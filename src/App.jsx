import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import LandingPage from "./pages/LandingPage.jsx";
import DesignStudioPage from "./pages/DesignStudioPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import BomResultPage from "./pages/BomResultPage.jsx";
import PlantDoctorPage from "./pages/PlantDoctorPage.jsx";
import PriceTrackerPage from "./pages/PriceTrackerPage.jsx";

function App() {
  return (
    <Router>
      <div className="flex min-h-screen flex-col bg-slate-50">
        <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-white shadow-xl" style={{backgroundColor: 'white'}}>
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

            {/* Navigation Menu */}
            <nav className="flex items-center gap-4 text-sm font-medium">
              <Link
                to="/design-studio"
                className="flex items-center gap-1 text-gray-600 transition-colors hover:text-green-600 px-2 py-1 rounded-lg hover:bg-green-50"
              >
                <span className="text-lg">🎨</span>
                <span>ออกแบบ</span>
              </Link>
              <Link
                to="/plant-doctor"
                className="flex items-center gap-1 text-gray-600 transition-colors hover:text-green-600 px-2 py-1 rounded-lg hover:bg-green-50"
              >
                <span className="text-lg">🏥</span>
                <span>หมอต้นไม้</span>
              </Link>
              <Link
                to="/search"
                className="flex items-center gap-1 text-gray-600 transition-colors hover:text-green-600 px-2 py-1 rounded-lg hover:bg-green-50"
              >
                <span className="text-lg">🔍</span>
                <span>ระบุต้นไม้</span>
              </Link>
              <Link
                to="/price-tracker"
                className="flex items-center gap-1 text-gray-600 transition-colors hover:text-green-600 px-2 py-1 rounded-lg hover:bg-green-50"
              >
                <span className="text-lg">💰</span>
                <span>ราคา</span>
              </Link>
            </nav>
          </div>
        </header>

        <main className="w-full max-w-5xl mx-auto flex-grow p-4 sm:p-6 lg:p-8 pt-20">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/design-studio" element={<DesignStudioPage />} />
            <Route path="/plant-doctor" element={<PlantDoctorPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/price-tracker" element={<PriceTrackerPage />} />
            <Route path="/bom-result" element={<BomResultPage />} />
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
