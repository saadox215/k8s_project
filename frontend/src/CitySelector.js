import React, { useEffect, useState } from "react";

function CitySelector({ onSelectCity, selectedCity }) {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = () => {
    setLoading(true);
    setError(null);

    fetch("http://localhost:5000/api/cities")
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch cities');
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setCities(data);
          // Auto-select the first city if none is selected
          if (!selectedCity && data.length > 0) {
            onSelectCity(data[0]);
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
  };

  const handleCityChange = (e) => {
    const cityId = parseInt(e.target.value);
    const city = cities.find(c => c.id === cityId);
    
    if (city) {
      onSelectCity(city);
    }
  };

  if (loading) {
    return <div className="selector-loading">Loading cities...</div>;
  }

  if (error) {
    return <div className="selector-error">Error: {error}</div>;
  }

  if (cities.length === 0) {
    return <div className="no-cities">No cities available</div>;
  }

  return (
    <div className="city-selector">
      <select 
        value={selectedCity?.id || ""} 
        onChange={handleCityChange}
        className="city-select"
      >
        {cities.map(city => (
          <option key={city.id} value={city.id}>
            {city.city}, {city.country}
          </option>
        ))}
      </select>
      <button 
        onClick={fetchCities} 
        className="refresh-cities-btn"
        title="Refresh cities list"
      >
        🔄
      </button>
    </div>
  );
}

export default CitySelector;