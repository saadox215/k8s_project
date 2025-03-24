const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection configuration
const connection = mysql.createConnection({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USERNAME || "saad",
  password: process.env.DB_PASSWORD || "1234",
  database: process.env.DB_NAME || "db_ramadane"
});

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err);
    process.exit(1);
  }
  console.log("Connected to MySQL");
});

// Create table if it doesn't exist
const createTableQuery = `
CREATE TABLE IF NOT EXISTS prayers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city VARCHAR(255) NOT NULL,
  country VARCHAR(255) NOT NULL,
  fajr TIME NOT NULL,
  dhuhr TIME NOT NULL,
  asr TIME NOT NULL,
  maghrib TIME NOT NULL,
  isha TIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;

connection.query(createTableQuery, (err) => {
  if (err) {
    console.error("Error creating table:", err);
  } else {
    console.log("Table 'prayers' is ready");
    
    // Check if table is empty, insert default data if needed
    connection.query("SELECT COUNT(*) as count FROM prayers", (err, results) => {
      if (err) {
        console.error("Error checking table data:", err);
        return;
      }
      
      if (results[0].count === 0) {
        console.log("Inserting default prayer times...");
        const defaultData = {
          city: "Casablanca",
          country: "Morocco",
          fajr: "05:15",
          dhuhr: "12:40",
          asr: "16:45",
          maghrib: "18:45",
          isha: "20:00"
        };
        
        const insertQuery = `
          INSERT INTO prayers (city, country, fajr, dhuhr, asr, maghrib, isha)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        connection.query(
          insertQuery, 
          [defaultData.city, defaultData.country, defaultData.fajr, defaultData.dhuhr, 
           defaultData.asr, defaultData.maghrib, defaultData.isha],
          (err) => {
            if (err) {
              console.error("Error inserting default data:", err);
            } else {
              console.log("Default prayer times inserted successfully");
            }
          }
        );
      }
    });
  }
});

// Get all cities
app.get("/api/cities", (req, res) => {
  const query = "SELECT id, city, country FROM prayers ORDER BY city ASC";
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching cities:", err);
      return res.status(500).json({ error: "Error fetching cities" });
    }
    
    res.json(results);
  });
});

// Get prayer times for a specific city by ID
app.get("/api/prayers/:id", (req, res) => {
  const id = req.params.id;
  const query = "SELECT * FROM prayers WHERE id = ?";
  
  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error fetching prayer times:", err);
      return res.status(500).json({ error: "Error fetching prayer times" });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: "City not found" });
    }
    
    res.json(results[0]);
  });
});

// Get all prayer times (keeping this for backward compatibility)
app.get("/api/prayers", (req, res) => {
  const query = "SELECT * FROM prayers ORDER BY city ASC";
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching prayer times:", err);
      return res.status(500).json({ error: "Error fetching prayer times" });
    }
    
    res.json(results);
  });
});

/// Add new prayer times
app.post("/api/prayers", (req, res) => {
    // Extract data from request body
    const { city, country, fajr, dhuhr, asr, maghrib, isha } = req.body;
    
    // Check if essential fields are present
    if (!city || !country) {
      return res.status(400).json({ error: "City and country are required" });
    }
    
    // Prepare query with proper null handling
    const insertQuery = `
      INSERT INTO prayers (city, country, fajr, dhuhr, asr, maghrib, isha)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    // Create values array with null handling
    const values = [
      city,
      country,
      fajr || null,
      dhuhr || null,
      asr || null,
      maghrib || null,
      isha || null
    ];
  
    // Execute database query
    connection.query(insertQuery, values, (err, results) => {
      if (err) {
        console.error("Error inserting data:", err);
        return res.status(500).json({ error: "Error inserting prayer times" });
      }
      
      // Return success response with the ID of the new record
      res.status(201).json({ 
        message: "Prayer times added successfully", 
        id: results.insertId 
      });
    });
  });

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});