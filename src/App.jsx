import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import SearchPage from "./pages/SearchPage.jsx";
import GardenBudgetIdeas from "./pages/GardenBudgetIdeas.jsx";
import IdentifyResult from "./pages/IdentifyResult.jsx";
import BomResultPage from "./pages/BomResultPage.jsx";
import ThankYouPage from "./pages/ThankYouPage.jsx";

function App() {
  return (
    <Router>
      {/* div นอกสุดสำหรับคุมพื้นหลังและโครงสร้างหลักแบบ flex */}
      <div className="flex min-h-screen flex-col bg-slate-50">
        {/* Header แบบเต็มความกว้างและลอยติดด้านบน */}
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-sm">
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* === จุดแก้ไขที่ 2: ทำให้โลโก้ไม่มีขีดเส้นใต้ === */}
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-800 transition-colors hover:text-green-600"
            >
              <span role="img" aria-label="Leaf" className="text-2xl">
                🌿
              </span>
              <span className="text-xl font-bold">PlantPick</span>
            </Link>

            {/* === จุดแก้ไขที่ 3: เพิ่มระยะห่างเมนู === */}
            <nav className="flex items-center gap-6 text-sm font-medium">
              <Link
                to="/garden-budget-ideas"
                className="text-gray-600 transition-colors hover:text-green-600"
              >
                จำลองสวน AI
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

        {/* เนื้อหาหลัก จะถูกจำกัดความกว้างและอยู่ตรงกลาง */}
        <main className="w-full max-w-5xl mx-auto flex-grow p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<GardenBudgetIdeas />} />
            <Route path="/search" element={<SearchPage />} />
            <Route
              path="/garden-budget-ideas"
              element={<GardenBudgetIdeas />}
            />
            <Route path="/identify-result" element={<IdentifyResult />} />
            <Route path="/bom-result" element={<BomResultPage />} />
            <Route path="/thank-you" element={<ThankYouPage />} />
          </Routes>
        </main>

        {/* Footer แบบเต็มความกว้าง */}
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
