import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home.jsx";
import SearchResults from "./pages/SearchResults.jsx";
import "./App.css"; // นำเข้า App.css
import PopularPlants from "./pages/PopularPlants"; // เพิ่มการ import

function App() {
  console.log("Rendering App.jsx");
  return (
    <Router>
      <div className="app-container">
        {/* Header */}
        <header className="header">
          <h1>
            <span role="img" aria-label="Leaf">
              🌱
            </span>{" "}
            Welcome to PlantPick!
          </h1>
          <nav className="header-links">
            <Link to="/">ค้นหาต้นไม้</Link> |{" "}
            <Link to="/search">สำรวจต้นไม้ยอดนิยม</Link>
          </nav>
        </header>

        {/* Main Content */}
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/popular-plants" element={<PopularPlants />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="footer">ลิขสิทธิ์ ©️</footer>
      </div>
    </Router>
  );
}

export default App;
