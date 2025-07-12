import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// === จุดแก้ไขที่ 1: ลบ Import ที่ไม่ใช้ออก และใช้ชื่อใหม่ ===
import DesignStudioPage from "./pages/DesignStudioPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import BomResultPage from "./pages/BomResultPage.jsx";
// (เราได้ลบ HomePage, GardenBudgetIdeas, และ IdentifyResult ออกไปแล้ว)

function App() {
  return (
    <Router>
      <div className="flex min-h-screen flex-col bg-slate-50">
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-sm">
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-800 transition-colors hover:text-green-600"
            >
              <span role="img" aria-label="Leaf" className="text-2xl">
                🌿
              </span>
              <span className="text-xl font-bold">PlantPick</span>
            </Link>

            {/* === จุดแก้ไขที่ 2: ปรับแก้เมนูให้เรียบง่ายและถูกต้อง === */}
            <nav className="flex items-center gap-6 text-sm font-medium">
              <Link
                to="/"
                className="text-gray-600 transition-colors hover:text-green-600"
              >
                ออกแบบสวน
              </Link>
              <Link
                to="/search"
                className="text-gray-600 transition-colors hover:text-green-600"
              >
                วิเคราะห์ภาพ
              </Link>
            </nav>
          </div>
        </header>

        <main className="w-full max-w-5xl mx-auto flex-grow p-4 sm:p-6 lg:p-8">
          {/* === จุดแก้ไขที่ 3: นำ Route ที่จำเป็นกลับมา และตั้งค่าหน้าแรกให้ถูกต้อง === */}
          <Routes>
            <Route path="/" element={<DesignStudioPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/bom-result" element={<BomResultPage />} />
            {/* ตอนนี้หน้าออกแบบหลักของเราคือ DesignStudioPage ที่ path "/" */}
          </Routes>
        </main>

        <footer className="w-full border-t bg-white">
          <div className="mx-auto max-w-5xl p-4 text-center text-xs text-gray-500">
            ลิขสิทธิ์ ©️ 2025 PlantPick
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
