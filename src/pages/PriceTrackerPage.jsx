import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiSearch,
  FiHeart,
  FiBell,
  FiTrendingUp,
  FiTrendingDown,
  FiStar,
  FiShoppingCart,
  FiEye,
  FiFilter,
  FiHome,
  FiZap,
  FiShield,
  FiCamera,
  FiArrowRight,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiMapPin,
  FiTruck,
  FiTag
} from "react-icons/fi";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

// Mock data for demonstration
const mockPlants = [
  {
    id: 1,
    name: "ต้นยางอินเดีย",
    nameEn: "Fiddle Leaf Fig",
    image: "https://images.unsplash.com/photo-1593691509543-c55fb32e5cee?w=400",
    currentPrice: 850,
    originalPrice: 1200,
    discount: 29,
    rating: 4.8,
    reviews: 156,
    store: "ร้านต้นไม้สวย",
    location: "กรุงเทพฯ",
    shipping: "ฟรี",
    inStock: true,
    trending: "up"
  },
  {
    id: 2,
    name: "ต้นมอนสเตอร่า",
    nameEn: "Monstera Deliciosa",
    image: "https://images.unsplash.com/photo-1614594975525-e45190c55d8b?w=400",
    currentPrice: 650,
    originalPrice: 800,
    discount: 19,
    rating: 4.9,
    reviews: 89,
    store: "สวนสวย Garden",
    location: "เชียงใหม่",
    shipping: "50 บาท",
    inStock: true,
    trending: "down"
  },
  {
    id: 3,
    name: "ต้นไทรใบสัก",
    nameEn: "Ficus Lyrata",
    image: "https://images.unsplash.com/photo-1593691509543-c55fb32e5cee?w=400",
    currentPrice: 1200,
    originalPrice: 1500,
    discount: 20,
    rating: 4.7,
    reviews: 203,
    store: "ต้นไม้ในฝัน",
    location: "ภูเก็ต",
    shipping: "ฟรี",
    inStock: false,
    trending: "up"
  }
];

// Price Alert Component
const PriceAlert = ({ plant, onSetAlert }) => (
  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6 mb-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
        <FiBell className="text-white text-xl" />
      </div>
      <div>
        <h3 className="font-bold text-gray-800 text-lg">แจ้งเตือนราคา</h3>
        <p className="text-sm text-gray-600">รับการแจ้งเตือนเมื่อราคาลด</p>
      </div>
    </div>
    
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <input
          type="number"
          placeholder="ราคาที่ต้องการ"
          className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        />
        <button
          onClick={() => onSetAlert(plant.id)}
          className="bg-yellow-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-yellow-600 transition-colors flex items-center gap-2"
        >
          <FiBell className="text-sm" />
          ตั้งการแจ้งเตือน
        </button>
      </div>
      <p className="text-sm text-gray-600">
        💡 ตัวอย่าง: ตั้งราคา 700 บาท จะได้รับแจ้งเตือนเมื่อราคาลดลงมา
      </p>
    </div>
  </div>
);

// Plant Card Component
const PlantCard = ({ plant, onSetAlert }) => (
  <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group">
    <div className="relative mb-4">
      <img
        src={plant.image}
        alt={plant.name}
        className="w-full h-48 object-cover rounded-2xl"
      />
      <div className="absolute top-3 left-3">
        <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
          -{plant.discount}%
        </div>
      </div>
      <div className="absolute top-3 right-3">
        <button className="bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors">
          <FiHeart className="text-red-500" />
        </button>
      </div>
      {plant.trending === "up" && (
        <div className="absolute bottom-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
          <FiTrendingUp className="text-sm" />
          ราคาขึ้น
        </div>
      )}
      {plant.trending === "down" && (
        <div className="absolute bottom-3 left-3 bg-blue-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
          <FiTrendingDown className="text-sm" />
          ราคาลด
        </div>
      )}
    </div>
    
    <div className="space-y-3">
      <div>
        <h3 className="font-bold text-gray-800 text-lg mb-1">{plant.name}</h3>
        <p className="text-gray-500 text-sm">{plant.nameEn}</p>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <FiStar
              key={i}
              className={`text-sm ${i < Math.floor(plant.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-600">({plant.reviews})</span>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-green-600">฿{plant.currentPrice.toLocaleString()}</span>
            <span className="text-gray-400 line-through">฿{plant.originalPrice.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiMapPin className="text-sm" />
            <span>{plant.store}</span>
            <span>•</span>
            <span>{plant.location}</span>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <FiTruck className="text-sm" />
            <span>{plant.shipping}</span>
          </div>
          {plant.inStock ? (
            <div className="text-green-600 text-sm font-medium">มีสินค้า</div>
          ) : (
            <div className="text-red-600 text-sm font-medium">หมด</div>
          )}
        </div>
      </div>
      
      <div className="flex gap-2">
        <button className="flex-1 bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
          <FiShoppingCart className="text-sm" />
          ซื้อเลย
        </button>
        <button
          onClick={() => onSetAlert(plant.id)}
          className="bg-yellow-500 text-white px-4 py-3 rounded-xl font-semibold hover:bg-yellow-600 transition-colors"
        >
          <FiBell className="text-sm" />
        </button>
      </div>
    </div>
  </div>
);

export default function PriceTrackerPage() {
  const navigate = useNavigate();
  const [plants, setPlants] = useState(mockPlants);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [sortBy, setSortBy] = useState("price-low");
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState(null);

  const categories = [
    { id: "all", name: "ทั้งหมด", icon: "🌿" },
    { id: "indoor", name: "ไม้ในร่ม", icon: "🏠" },
    { id: "outdoor", name: "ไม้นอกบ้าน", icon: "🌳" },
    { id: "succulent", name: "แคคตัส", icon: "🌵" },
    { id: "flowering", name: "ไม้ดอก", icon: "🌸" }
  ];

  const sortOptions = [
    { value: "price-low", label: "ราคาต่ำ-สูง" },
    { value: "price-high", label: "ราคาสูง-ต่ำ" },
    { value: "discount", label: "ส่วนลดมาก" },
    { value: "rating", label: "คะแนนสูง" },
    { value: "trending", label: "กำลังนิยม" }
  ];

  const handleSetAlert = (plantId) => {
    const plant = plants.find(p => p.id === plantId);
    setSelectedPlant(plant);
    setShowAlertModal(true);
  };

  const handleConfirmAlert = () => {
    // TODO: Implement alert setting
    setShowAlertModal(false);
    setSelectedPlant(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-green-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
            >
              <FiHome className="text-xl" />
              <span className="font-medium">กลับหน้าหลัก</span>
            </button>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <FiTrendingUp className="text-white text-sm" />
              </div>
              <span className="font-bold text-gray-800">ติดตามราคาต้นไม้</span>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-green-600">
                <FiEye className="text-sm" />
                <span>1,234 คนติดตาม</span>
              </div>
              <div className="flex items-center gap-1 text-yellow-500">
                <FiStar className="text-sm" />
                <span>4.8</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            <span className="text-yellow-600">ติดตามราคา</span> ต้นไม้
            <br />
            <span className="text-2xl md:text-3xl font-normal text-gray-600">
              💰 ประหยัดเงิน รู้ราคาลดก่อนใคร 💰
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            ติดตามราคาต้นไม้จากร้านค้าต่างๆ เปรียบเทียบราคา 
            และรับการแจ้งเตือนเมื่อราคาลด
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                placeholder="ค้นหาต้นไม้ที่ต้องการ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-2xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-lg"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-3xl p-6 shadow-lg mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <FiFilter className="text-gray-600" />
              <span className="font-semibold text-gray-700">หมวดหมู่:</span>
            </div>
            
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  selectedCategory === category.id
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
          
          <div className="flex flex-wrap gap-4 items-center mt-4">
            <div className="flex items-center gap-2">
              <FiTag className="text-gray-600" />
              <span className="font-semibold text-gray-700">เรียงตาม:</span>
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Price Alert Section */}
        <PriceAlert plant={plants[0]} onSetAlert={handleSetAlert} />

        {/* Plants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plants.map((plant) => (
            <PlantCard key={plant.id} plant={plant} onSetAlert={handleSetAlert} />
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="bg-yellow-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-yellow-600 transition-all duration-300 flex items-center justify-center gap-3 mx-auto">
            <FiEye className="text-xl" />
            <span>ดูต้นไม้อีก 50 ต้น</span>
            <FiArrowRight className="text-xl" />
          </button>
        </div>
      </div>

      {/* Alert Modal */}
      {showAlertModal && selectedPlant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiBell className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                ตั้งการแจ้งเตือนราคา
              </h3>
              <p className="text-gray-600">
                {selectedPlant.name} - ฿{selectedPlant.currentPrice.toLocaleString()}
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ราคาที่ต้องการ
                </label>
                <input
                  type="number"
                  placeholder="เช่น 700"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAlertModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleConfirmAlert}
                  className="flex-1 bg-yellow-500 text-white py-3 rounded-xl font-semibold hover:bg-yellow-600 transition-colors"
                >
                  ตั้งการแจ้งเตือน
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 