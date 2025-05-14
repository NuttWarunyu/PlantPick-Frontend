import React from "react";
import { Link } from "react-router-dom";
import "../styles.css";

function Marketplace() {
  return (
    <div className="home bg-gradient-to-b from-green-50 to-white min-h-screen flex items-center justify-center py-12 px-4">
      <div className="home-container max-w-3xl mx-auto text-center">
        {/* Header Section */}
        <div className="category-section animate-fade-in">
          <h2 className="category-title text-4xl md:text-5xl font-bold text-green-800 mb-6 flex items-center justify-center">
            <span className="category-icon mr-2">🌿</span> ตลาดต้นไม้เสรี
          </h2>
          <h3 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">
            Coming Soon!
          </h3>
          <p className="text-lg text-gray-600 max-w-xl mx-auto mb-8">
            รออัพเดทเร็ว ๆ นี้!
            คุณจะสามารถซื้อขายต้นไม้และของตกแต่งสวนกับชุมชนคนรักต้นไม้ได้ที่นี่
          </p>
          {/* Call to Action */}
          <div className="flex justify-center space-x-4">
            <Link
              to="/"
              className="inline-flex items-center bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <span className="mr-2">🏠</span> กลับสู่หน้าแรก
            </Link>
            <Link
              to="/garden-budget-ideas"
              className="inline-flex items-center bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <span className="mr-2">🌱</span> สำรวจไอเดียจัดสวน
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Marketplace;
