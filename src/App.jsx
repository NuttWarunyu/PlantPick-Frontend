import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home.jsx";
import PopularPlants from "./pages/PopularPlants";
import Marketplace from "./pages/Marketplace";
import "./App.css";
import IdentifyResult from "./pages/IdentifyResult";
import SearchResults from "./pages/SearchResults";
import TestShopeeAPI from "./pages/TestShopeeAPI"; // เพิ่มการ Import

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
            <Link to="/">ค้นหาต้นไม้</Link> |{" "}
            <Link to="/diy-gardeners">จัดสวนเอง</Link> |{" "}
            <Link to="/marketplace">ตลาดต้นไม้เสรี</Link>
            <Link to="/test-shopee">ทดสอบ API</Link> {/* เพิ่มลิงก์ */}
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/diy-gardeners" element={<PopularPlants />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/identify-result" element={<IdentifyResult />} />
            <Route path="/search-results" element={<SearchResults />} />{" "}
            <Route path="/test-shopee" element={<TestShopeeAPI />} />{" "}
          </Routes>
        </main>

        <footer className="footer">ลิขสิทธิ์ ©️ 2025</footer>
      </div>
    </Router>
  );
}

export default App;
