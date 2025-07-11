import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import SearchPage from "./pages/SearchPage.jsx";
import GardenBudgetIdeas from "./pages/GardenBudgetIdeas.jsx";
import IdentifyResult from "./pages/IdentifyResult.jsx";
import BomResultPage from "./pages/BomResultPage.jsx";
import ThankYouPage from "./pages/ThankYouPage.jsx";
import InpaintingPage from "./pages/InpaintingPage.jsx"; // <-- 1. Import หน้าทดลองใหม่

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

            {/* === 2. เพิ่มลิงก์สำหรับสลับโหมด === */}
            <nav className="flex items-center gap-6 text-sm font-medium">
              <Link
                to="/garden-budget-ideas"
                className="text-gray-600 transition-colors hover:text-green-600"
              >
                🎨 โหมดแรงบันดาลใจ
              </Link>
              <Link
                to="/inpainting-test"
                className="text-blue-600 transition-colors hover:text-blue-800 font-semibold"
              >
                🧪 ทดลองโหมดสมจริง
              </Link>
            </nav>
          </div>
        </header>

        <main className="w-full max-w-5xl mx-auto flex-grow p-4 sm:p-6 lg:p-8">
          <Routes>
            {/* === 3. เพิ่ม Route สำหรับหน้าทดลอง === */}
            <Route path="/" element={<GardenBudgetIdeas />} />
            <Route
              path="/garden-budget-ideas"
              element={<GardenBudgetIdeas />}
            />
            <Route path="/inpainting-test" element={<InpaintingPage />} />

            {/* Route อื่นๆ ที่มีอยู่เดิม */}
            <Route path="/search" element={<SearchPage />} />
            <Route path="/identify-result" element={<IdentifyResult />} />
            <Route path="/bom-result" element={<BomResultPage />} />
            <Route path="/thank-you" element={<ThankYouPage />} />
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
