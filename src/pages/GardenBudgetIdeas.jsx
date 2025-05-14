import React from "react";
import "../styles.css";

function GardenBudgetIdeas() {
  const budgetIdeas = [
    {
      level: "งบน้อย (500-1,000 บาท)",
      description: "เหมาะสำหรับมือใหม่หรือสวนขนาดเล็ก",
      items: [
        {
          name: "ต้อยติ่งฝรั่ง ฟ้าประทานพร",
          price: 1,
          image:
            "https://down-tx-th.img.susercontent.com/c2533a7b39f78008ace1db3fdd995c87",
          shopeeLink: "https://s.shopee.co.th/Vu5aQlU2e",
        },
        {
          name: "ต้นสนหอม",
          price: 4,
          image:
            "https://down-tx-th.img.susercontent.com/th-11134207-7rase-m2u75yc467v0eb",
          shopeeLink: "https://s.shopee.co.th/7V3pvL1t3s",
        },
        {
          name: "ต้นไม้มงคล",
          price: 20,
          image:
            "https://down-tx-th.img.susercontent.com/th-11134207-7qul4-ljeajf5di64x74",
          shopeeLink: "https://s.shopee.co.th/7pggJzhsN5",
        },
      ],
    },
    {
      level: "งบปานกลาง (1,000-3,000 บาท)",
      description: "เหมาะสำหรับสวนที่มีความหลากหลาย",
      items: [
        {
          name: "ไม้ฟอกอากาศ ไม้ด่าง",
          price: 140,
          image:
            "https://down-tx-th.img.susercontent.com/th-11134207-7r98t-lm8cbhhr1v5z23",
          shopeeLink: "https://s.shopee.co.th/2Vf9ob9cON",
        },
        {
          name: "ต้นโอลีฟปลอม",
          price: 189,
          image:
            "https://down-tx-th.img.susercontent.com/th-11134207-7rasg-m6nrexpvgredb0",
          shopeeLink: "https://s.shopee.co.th/1B9mEKJ7Qn",
        },
        {
          name: "พลูงาช้าง",
          price: 49,
          image:
            "https://down-tx-th.img.susercontent.com/beafdaafc49b4f95cd78274cb64f5511",
          shopeeLink: "https://s.shopee.co.th/AKO1IMII3t",
        },
      ],
    },
    {
      level: "งบสูง (3,000 บาทขึ้นไป)",
      description: "เหมาะสำหรับสวนสวยแบบมืออาชีพ",
      items: [
        {
          name: "ต้นกุหลาบ",
          price: 29,
          image:
            "https://down-tx-th.img.susercontent.com/th-11134207-7rase-m0e88lcqaqwq8e",
          shopeeLink: "https://s.shopee.co.th/8Kcwv28Hpc",
        },
        {
          name: "รูปปั้นเป็ด",
          price: 238,
          image:
            "https://down-tx-th.img.susercontent.com/cn-11134207-7qukw-lgevc3qpkakea2",
          shopeeLink: "https://s.shopee.co.th/8AJWiqjHKC",
        },
        {
          name: "ไฟปิงปองโซล่าเซลล์",
          price: 118,
          image:
            "https://down-tx-th.img.susercontent.com/th-11134207-7rasj-m17038odv6t03a",
          shopeeLink: "https://s.shopee.co.th/6AYSLJjGls",
        },
      ],
    },
  ];

  return (
    <div className="home bg-gradient-to-b from-green-50 to-white min-h-screen py-12 px-4">
      <div className="home-container max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="category-section text-center mb-12">
          <h2 className="category-title text-4xl font-bold text-green-800 mb-4 flex items-center justify-center">
            <span className="category-icon mr-2">🌱</span>{" "}
            ไอเดียจัดสวนตามงบประมาณ
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            เลือกไอเดียจัดสวนที่เหมาะกับงบของคุณ พร้อมลิงก์ซื้อจาก Shopee!
          </p>
        </div>

        {/* Budget Ideas Grid */}
        <div className="category-section">
          {budgetIdeas.map((budget, index) => (
            <div key={index} className="mb-10">
              <h3 className="text-2xl font-semibold text-green-700 mb-4 flex items-center">
                <span
                  className={`mr-2 ${
                    budget.level.includes("น้อย")
                      ? "text-yellow-500"
                      : budget.level.includes("ปานกลาง")
                      ? "text-orange-500"
                      : "text-red-500"
                  }`}
                >
                  💰
                </span>
                {budget.level}
              </h3>
              <p className="text-gray-600 mb-6">{budget.description}</p>
              <div className="offers-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {budget.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="offer-card relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition duration-300"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="plant-image w-full h-48 object-cover"
                      onError={(e) =>
                        (e.target.src =
                          "https://placehold.co/300x200.png?text=Image+Not+Found")
                      }
                    />
                    <div className="p-4">
                      <h4 className="offer-price text-lg font-semibold text-gray-800 mb-2 truncate">
                        {item.name}
                      </h4>
                      <p className="offer-shop text-green-600 font-bold mb-4">
                        {item.price.toLocaleString()} บาท
                      </p>
                      <a
                        href={item.shopeeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="offer-button block bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2 rounded-lg text-center transition-colors duration-300"
                      >
                        🛒 ดูดีล
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GardenBudgetIdeas;
