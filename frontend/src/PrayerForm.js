import React, { useState } from "react";
import "./PrayerForm.css"

function PrayerForm({ onPrayerAdded, onCancel }) {
  const [formData, setFormData] = useState({
    city: "",
    country: "",
    fajr: "",
    dhuhr: "",
    asr: "",
    maghrib: "",
    isha: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch("http://saad.local/api/prayers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to add prayer times");
      }
      
      // Clear form
      setFormData({
        city: "",
        country: "",
        fajr: "",
        dhuhr: "",
        asr: "",
        maghrib: "",
        isha: ""
      });
      
      // Notify parent component
      onPrayerAdded();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="prayer-form">
      <h2>Add New Prayer Times</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="city">City:</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="country">Country:</label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="fajr">Fajr:</label>
          <input
            type="time"
            id="fajr"
            name="fajr"
            value={formData.fajr}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="dhuhr">Dhuhr:</label>
          <input
            type="time"
            id="dhuhr"
            name="dhuhr"
            value={formData.dhuhr}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="asr">Asr:</label>
          <input
            type="time"
            id="asr"
            name="asr"
            value={formData.asr}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="maghrib">Maghrib:</label>
          <input
            type="time"
            id="maghrib"
            name="maghrib"
            value={formData.maghrib}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="isha">Isha:</label>
          <input
            type="time"
            id="isha"
            name="isha"
            value={formData.isha}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            onClick={onCancel} 
            className="cancel-btn"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Prayer Times"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PrayerForm;