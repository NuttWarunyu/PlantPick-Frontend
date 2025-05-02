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
            PlantPick - หาดีลต้นไม้ถูกสุด ดีสุด!
          </h1>
          <p>แค่อัพรูปหรือเสิร์ชชื่อ ดีลดี ๆ รอคุณอยู่!</p>
          <nav className="header-links">
            <Link to="/">ค้นหาดีล</Link> |{" "}
            <Link to="/popular-plants">ดีลยอดนิยม</Link>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/popular-plants" element={<PopularPlants />} />
          </Routes>
        </main>

        <footer className="footer">ลิขสิทธิ์ ©️ 2025</footer>
      </div>
    </Router>
  );
}

export default App;
