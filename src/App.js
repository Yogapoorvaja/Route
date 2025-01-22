import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

const App = () => {
  const [startLocation, setStartLocation] = useState("");
  const [routeData, setRouteData] = useState(null);
  const [trafficData, setTrafficData] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [eta, setEta] = useState("");
  const [nearbyHospitals, setNearbyHospitals] = useState([]);

  // Get user's location if geolocation is available
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setStartLocation(`${latitude}, ${longitude}`);
      });
    }
  }, []);

  const handleRouteCalculation = async (e) => {
    e.preventDefault();
    if (!startLocation) {
      alert("Please enter the ambulance's starting location.");
      return;
    }

    try {
      const response = await axios.get(`https://api.example.com/route`, {
        params: { start: startLocation },
      });

      setRouteData(response.data.route);
      setTrafficData(response.data.traffic);
      setEta(response.data.eta);
    } catch (error) {
      console.error("Error fetching route data:", error);
      alert("Failed to fetch route data. Try again later.");
    }
  };

  // Search for nearby hospitals based on starting location
  const searchNearbyHospitals = async () => {
    if (!startLocation) {
      alert("Please enter a location first.");
      return;
    }

    try {
      const response = await axios.get(`https://api.example.com/nearby_hospitals`, {
        params: { location: startLocation },
      });
      setNearbyHospitals(response.data.hospitals);
    } catch (error) {
      console.error("Error fetching nearby hospitals:", error);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const resetRoute = () => {
    setRouteData(null);
    setStartLocation("");
    setNearbyHospitals([]);
  };

  return (
    <div
      style={{
        display: "flex",
        fontFamily: "Arial, sans-serif",
        height: "100vh",
        backgroundColor: darkMode ? "#333" : "#f4f4f4",
        color: darkMode ? "#fff" : "#000",
      }}
    >
      <div
        style={{
          width: "250px",
          backgroundColor: darkMode ? "#222" : "#003366",
          color: "#fff",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
        }}
      >
        <h2 style={{ color: "#fff", fontSize: "24px" }}>Ambulance Routing</h2>
        <button onClick={resetRoute} style={{ ...buttonStyle, backgroundColor: darkMode ? "#444" : "#004080" }}>
          Home
        </button>
        <button onClick={resetRoute} style={{ ...buttonStyle, backgroundColor: darkMode ? "#444" : "#004080" }}>
          Route
        </button>
        <button onClick={searchNearbyHospitals} style={{ ...buttonStyle, backgroundColor: darkMode ? "#444" : "#004080" }}>
          Hospitals
        </button>
        <button onClick={toggleDarkMode} style={{ ...buttonStyle, backgroundColor: darkMode ? "#444" : "#004080" }}>
          Dark Mode
        </button>
        <footer style={{ color: "#fff", textAlign: "center", fontSize: "12px" }}>
          <p>&copy; 2024 Ambulance Routing System</p>
        </footer>
      </div>

      <div style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column" }}>
        <h1 style={{ color: darkMode ? "#fff" : "#003366" }}>
          Ambulance Routing to Nearest Hospitals
        </h1>

        {routeData === null && (
          <form onSubmit={handleRouteCalculation} style={{ marginBottom: "20px", display: "flex", alignItems: "center" }}>
            <label
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                color: darkMode ? "#fff" : "#003366",
                marginRight: "10px",
              }}
            >
              Enter Ambulance Starting Location:
            </label>
            <input
              type="text"
              value={startLocation}
              onChange={(e) => setStartLocation(e.target.value)}
              placeholder="E.g., 123 Main St"
              style={inputStyle}
            />
            <button type="submit" style={{ ...buttonStyle, marginLeft: "10px" }}>
              Find Route
            </button>
          </form>
        )}

        <p style={{ color: darkMode ? "#fff" : "#003366" }}>
          Estimated Time of Arrival: <strong>{eta} minutes</strong>
        </p>

        <MapContainer
          center={[51.505, -0.09]}
          zoom={13}
          style={{ height: "100%", flex: 1, marginTop: "20px" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
        </MapContainer>

        {routeData && (
          <div>
            <h3 style={{ color: darkMode ? "#fff" : "#003366" }}>Optimized Route:</h3>
            <p style={{ color: darkMode ? "#fff" : "#003366" }}>
              Travel Time: <strong>{routeData.optimizedTime} minutes</strong>
            </p>
            <p style={{ color: darkMode ? "#fff" : "#003366" }}>
              Non-Optimized Time: <strong>{routeData.nonOptimizedTime} minutes</strong>
            </p>

            <MapContainer
              center={routeData.start}
              zoom={13}
              style={{ height: "500px", width: "100%", marginTop: "20px" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={routeData.start} key="ambulance">
                <Popup>Ambulance Starting Location</Popup>
              </Marker>
              <Marker position={routeData.destination} key="hospital">
                <Popup>Nearest Hospital</Popup>
              </Marker>
              <Polyline positions={routeData.optimizedPath} color="purple" weight={4} />
              <Polyline positions={routeData.nonOptimizedPath} color="gray" weight={2} />
            </MapContainer>
          </div>
        )}

        {nearbyHospitals.length > 0 && (
          <div>
            <h3 style={{ color: darkMode ? "#fff" : "#003366" }}>Nearby Hospitals:</h3>
            <ul style={{ color: darkMode ? "#fff" : "#003366" }}>
              {nearbyHospitals.map((hospital, index) => (
                <li key={index}>{hospital.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// Button style
const buttonStyle = {
  background: "#003366",
  color: "#fff",
  padding: "10px 15px",
  border: "none",
  borderRadius: "5px",
  textAlign: "center",
  marginBottom: "10px",
  cursor: "pointer",
  transition: "background 0.3s",
};

// Input field style
const inputStyle = {
  padding: "5px",
  fontSize: "14px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  width: "300px",
  transition: "all 0.3s",
};

export default App;
