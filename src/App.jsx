import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import SearchPage from "./pages/SearchPage.jsx";
import GardenBudgetIdeas from "./pages/GardenBudgetIdeas.jsx";
import IdentifyResult from "./pages/IdentifyResult.jsx";
import About from "./pages/About.jsx"; // 👈 นำเข้าหน้า About

import "./App.css";

function App() {
  console.log("Rendering App.jsx");

  return (
    <Router>
      <div className="app-container min-h-screen bg-gradient-to-b from-green-50 to-white">
        <header className="header p-4 text-center bg-green-100 rounded-b-lg shadow-md">
          <h1 className="text-3xl font-bold text-green-700 text-center">
            <span role="img" aria-label="Leaf" className="block">
              🌿
            </span>
            <span className="block mt-2">PlantPick</span>
          </h1>
          <p className="text-gray-600 mt-2">
            ออกแบบสวน คลิ๊กเดียว ได้ที่ซื้อ ได้ทีมสวน
          </p>

          {/* Navigation Links */}
          <nav className="header-links mt-4 flex flex-wrap justify-center gap-4">
            <Link
              to="/garden-budget-ideas"
              className="text-green-600 hover:text-green-800 font-medium"
            >
              จำลองสวนด้วย AI
            </Link>
            <span className="text-gray-400">|</span>
            <Link
              to="/search"
              className="text-green-600 hover:text-green-800 font-medium"
            >
              วิเคราะห์ต้นไม้จากภาพ
            </Link>
            <span className="text-gray-400">|</span>
            <Link
              to="/about"
              className="text-green-600 hover:text-green-800 font-medium"
            >
              เกี่ยวกับเรา
            </Link>
          </nav>
        </header>

        <main className="p-6">
          <Routes>
            <Route path="/search" element={<SearchPage />} />
            <Route
              path="/garden-budget-ideas"
              element={<GardenBudgetIdeas />}
            />
            <Route path="/identify-result" element={<IdentifyResult />} />
            <Route path="/about" element={<About />} />{" "}
            {/* 👈 เพิ่มเส้นทาง About */}
          </Routes>
        </main>

        <footer className="footer p-4 text-center text-gray-500 bg-green-50 mt-auto">
          ลิขสิทธิ์ ©️ 2025 PlantPick
        </footer>
      </div>
    </Router>
  );
}

export default App;
