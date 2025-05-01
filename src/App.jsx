import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home.jsx";
import SearchResults from "./pages/SearchResults.jsx"; // ยังไม่ได้ใช้ อาจลบได้ถ้าไม่จำเป็น
import "./App.css";
import PopularPlants from "./pages/PopularPlants";

function App() {
  console.log("Rendering App.jsx");
  return (
    <Router>
      <div className="app-container">
        <header className="header">
          <h1>
            <span role="img" aria-label="Leaf">
              🌱
            </span>{" "}
            Welcome to PlantPick!
          </h1>
          <nav className="header-links">
            <Link to="/">ค้นหาต้นไม้</Link> |{" "}
            <Link to="/popular-plants">สำรวจต้นไม้ยอดนิยม</Link>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/popular-plants" element={<PopularPlants />} />
          </Routes>
        </main>

        <footer className="footer">ลิขสิทธิ์ ©️</footer>
      </div>
    </Router>
  );
}

export default App;
