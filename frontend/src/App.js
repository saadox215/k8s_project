import React, { useEffect, useState, useCallback, useRef } from "react";
import "./App.css";
import PrayerForm from "./PrayerForm";

function App() {
  const [prayers, setPrayers] = useState(null);
  const [allCities, setAllCities] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [activeTime, setActiveTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState("light");
  const [showForm, setShowForm] = useState(false);
  const [nextPrayerName, setNextPrayerName] = useState(""); // Add this to track next prayer name
  
  // Use useRef to store the interval ID so we can clear it
  const countdownIntervalRef = useRef(null);

  const fetchCities = useCallback(() => {
    setLoading(true);
    setError(null);
  
    fetch("http://saad.local/api/prayers")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch prayer times");
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Extract unique cities from the prayer data
          const uniqueCities = data.reduce((acc, prayer) => {
            const cityExists = acc.some(
              (city) => city.id === prayer.id && city.city === prayer.city
            );
            if (!cityExists) {
              acc.push({
                id: prayer.id,
                city: prayer.city,
                country: prayer.country,
              });
            }
            return acc;
          }, []);
  
          setAllCities(uniqueCities);
  
          // Set the first city as default if no city is selected
          if (!selectedCityId && uniqueCities.length > 0) {
            setSelectedCityId(uniqueCities[0].id);
            fetchPrayerTimesForCity(uniqueCities[0].id);
          } else {
            fetchPrayerTimesForCity(selectedCityId);
          }
        } else {
          throw new Error("No prayer data available");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("API Error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [selectedCityId]); 

  // Fetch all prayers (fallback if cities endpoint fails)
  const fetchAllPrayers = useCallback(() => {
    setLoading(true);
    setError(null);
    
    fetch("http://saad.local/api/prayers")
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch prayer times');
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const prayerData = data[0];
          
          const formattedPrayers = {
            city: prayerData.city,
            country: prayerData.country,
            prayers: {
              Fajr: formatTime(prayerData.fajr),
              Dhuhr: formatTime(prayerData.dhuhr),
              Asr: formatTime(prayerData.asr),
              Maghrib: formatTime(prayerData.maghrib),
              Isha: formatTime(prayerData.isha)
            }
          };
          
          setPrayers(formattedPrayers);
          const nextPrayer = determineNextPrayer(formattedPrayers.prayers);
          if (nextPrayer) {
            setActiveTime(nextPrayer.name);
            setNextPrayerName(nextPrayer.name);
            updateCountdown(formattedPrayers.prayers[nextPrayer.name]);
          }
        } else {
          throw new Error("No prayer data available");
        }
        
        setLoading(false);
      })
      .catch(err => {
        console.error("API Error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);
  
  // Fetch prayer times for a specific city
  const fetchPrayerTimesForCity = useCallback((cityId) => {
    if (!cityId) return;
    
    setLoading(true);
    setError(null);
    
    fetch(`http://saad.local/api/prayers/${cityId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch prayer times for this city');
        }
        return res.json();
      })
      .then(prayerData => {
        if (prayerData) {
          const formattedPrayers = {
            city: prayerData.city,
            country: prayerData.country,
            prayers: {
              Fajr: formatTime(prayerData.fajr),
              Dhuhr: formatTime(prayerData.dhuhr),
              Asr: formatTime(prayerData.asr),
              Maghrib: formatTime(prayerData.maghrib),
              Isha: formatTime(prayerData.isha)
            }
          };
          
          setPrayers(formattedPrayers);
          
          // Get the next prayer time
          const nextPrayer = determineNextPrayer(formattedPrayers.prayers);
          if (nextPrayer) {
            setActiveTime(nextPrayer.name);
            setNextPrayerName(nextPrayer.name);
            updateCountdown(formattedPrayers.prayers[nextPrayer.name]);
          }
        } else {
          throw new Error("Invalid data format received");
        }
        
        setLoading(false);
      })
      .catch(err => {
        console.error("API Error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);
  
  useEffect(() => {
    fetchCities();
    
    document.body.className = theme;
    
    // Clear interval when component unmounts
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      document.body.className = "";
    };
  }, [theme, fetchCities]);
  
  // Format time from "HH:MM:SS" to "HH:MM"
  const formatTime = (timeString) => {
    if (!timeString) return "";
    
    if (timeString.includes(":")) {
      const parts = timeString.split(":");
      if (parts.length >= 2) {
        return `${parts[0]}:${parts[1]}`;
      }
    }
    
    return timeString;
  };

  // Determine the next prayer time
  const determineNextPrayer = (prayerTimes) => {
    if (!prayerTimes) return null;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    
    let nextPrayer = null;
    let minDiff = Infinity;
    
    for (const [name, time] of Object.entries(prayerTimes)) {
      if (!time || typeof time !== 'string') continue;
      
      const parts = time.split(":");
      if (parts.length < 2) continue;
      
      const [hour, minute] = parts.map(Number);
      if (isNaN(hour) || isNaN(minute)) continue;
      
      const prayerTime = hour * 60 + minute;
      
      let diff = prayerTime - currentTime;
      if (diff < 0) {
        diff += 24 * 60;
      }
      
      if (diff < minDiff) {
        minDiff = diff;
        nextPrayer = { name, time };
      }
    }
    
    return nextPrayer;
  };

  // Updated countdown function that clears previous intervals
  const updateCountdown = (nextPrayerTime) => {
    if (!nextPrayerTime) return;
    
    // Clear any existing interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    
    // Start a new interval
    countdownIntervalRef.current = setInterval(() => {
      const now = new Date();
      const prayerTime = new Date();
      
      const parts = nextPrayerTime.split(":");
      if (parts.length < 2) {
        setTimeLeft("Invalid time format");
        clearInterval(countdownIntervalRef.current);
        return;
      }
      
      const [hour, minute] = parts.map(Number);
      if (isNaN(hour) || isNaN(minute)) {
        setTimeLeft("Invalid time values");
        clearInterval(countdownIntervalRef.current);
        return;
      }
      
      prayerTime.setHours(hour, minute, 0, 0);

      // If the prayer time is earlier today, it means it's for tomorrow
      if (prayerTime < now) {
        prayerTime.setDate(prayerTime.getDate() + 1);
      }

      const diff = prayerTime - now;
      if (diff <= 0) {
        setTimeLeft("Prayer time!");
        
        // Recalculate next prayer time after current one is reached
        if (prayers) {
          const nextPrayer = determineNextPrayer(prayers.prayers);
          if (nextPrayer) {
            setActiveTime(nextPrayer.name);
            setNextPrayerName(nextPrayer.name);
            updateCountdown(prayers.prayers[nextPrayer.name]);
          }
        }
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const refreshData = () => {
    fetchCities();
  };

  // Modify the handlePrayerAdded function to ensure proper refresh
  const handlePrayerAdded = () => {
    setShowForm(false); // Hide the form
    
    // Add a small delay to ensure the backend has updated
    setTimeout(() => {
      fetchCities(); // Refresh the cities list
    }, 500);
  };
  
  // Toggle form visibility
  const toggleForm = () => {
    setShowForm(!showForm);
  };

  // Handle city selection change
  const handleCityChange = (e) => {
    const cityId = parseInt(e.target.value);
    setSelectedCityId(cityId);
    fetchPrayerTimesForCity(cityId);
  };

  if (loading && !prayers) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading prayer times...</p>
      </div>
    );
  }

  if (error && !prayers) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={refreshData} className="refresh-btn">Try Again</button>
      </div>
    );
  }

  return (
    <div className={`app-container ${theme}`}>
      <header>
        <h1>Ramadan Prayer Times</h1>
        <div className="header-actions">
          <button onClick={toggleForm} className="form-toggle-btn">
            {showForm ? "Hide Form" : "Add Prayer Times"}
          </button>
          <button onClick={refreshData} className="refresh-btn">Refresh</button>
          <button onClick={toggleTheme} className="theme-btn">
            {theme === "light" ? "Dark Mode" : "Light Mode"}
          </button>
        </div>
      </header>
      
      {/* Prayer Form */}
      {showForm && (
        <div className="form-section">
          <PrayerForm
            onPrayerAdded={handlePrayerAdded}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}
      
      {/* City Selection Dropdown */}
      {allCities.length > 0 && (
        <div className="city-selector">
          <label htmlFor="city-select">Select City: </label>
          <select 
            id="city-select" 
            value={selectedCityId || ""} 
            onChange={handleCityChange}
            className="city-dropdown"
          >
            {allCities.map(city => (
              <option key={city.id} value={city.id}>
                {city.city}, {city.country}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {prayers && (
        <div className="content">
          <div className="location-info">
            <h2>{prayers.city}, {prayers.country}</h2>
            <p className="date">{new Date().toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          
          <div className="iftar-countdown">
            <h2>Time until {nextPrayerName}</h2>
            <div className="countdown-display">{timeLeft}</div>
          </div>
          
          <div className="prayer-times-container">
            <h2>Prayer Times</h2>
            <div className="prayer-times">
              {prayers && prayers.prayers && (
                Object.entries(prayers.prayers).map(([name, time]) => (
                  <div key={name} className={`prayer-time-card ${name === activeTime ? "active" : ""}`}>
                    <div className="prayer-name">{name}</div>
                    <div className="prayer-time">{time}</div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <footer>
            <p>Ramadan Mubarak! 🌙</p>
          </footer>
        </div>
      )}
    </div>
  );
}

export default App;