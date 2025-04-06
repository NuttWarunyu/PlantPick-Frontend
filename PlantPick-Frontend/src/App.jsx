import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home.jsx";
import SearchResults from "./pages/SearchResults.jsx";

function App() {
  return (
    <Router>
      <div
        style={{
          textAlign: "center",
          padding: "50px",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h1>🌱 Welcome to PlantPick!</h1>
        <nav>
          <Link to="/">หน้าแรก</Link> | <Link to="/search">ค้นหาต้นไม้</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchResults />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
