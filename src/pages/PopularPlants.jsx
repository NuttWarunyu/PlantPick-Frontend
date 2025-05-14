import React from "react";

function PopularGardens() {
  const popularGardens = [
    {
      name: "สวนกระบองเพชรขนาดเล็ก",
      popularityScore: 95,
      price: 450,
      image:
        "https://down-th.img.susercontent.com/file/th-11134207-7r98y-lv4t2m5z3q5v95",
      shopeeLink:
        "https://shopee.co.th/สวนกระบองเพชร-ขนาดเล็ก-i.12345690.987654340",
    },
    {
      name: "สวนหิน Zen มินิ",
      popularityScore: 88,
      price: 600,
      image:
        "https://down-th.img.susercontent.com/file/th-11134207-7r98y-lv4t2m5z3q5v96",
      shopeeLink: "https://shopee.co.th/สวนหิน-zen-มินิ-i.12345691.987654341",
    },
    {
      name: "สวนในกระถางกลม",
      popularityScore: 82,
      price: 350,
      image:
        "https://down-th.img.susercontent.com/file/th-11134207-7r98y-lv4t2m5z3q5v97",
      shopeeLink: "https://shopee.co.th/สวนในกระถางกลม-i.12345692.987654342",
    },
    {
      name: "สวนแนวตั้ง DIY",
      popularityScore: 75,
      price: 800,
      image:
        "https://down-th.img.susercontent.com/file/th-11134207-7r98y-lv4t2m5z3q5v98",
      shopeeLink: "https://shopee.co.th/สวนแนวตั้ง-diy-i.12345693.987654343",
    },
    {
      name: "สวนสมุนไพรชุดเล็ก",
      popularityScore: 70,
      price: 400,
      image:
        "https://down-th.img.susercontent.com/file/th-11134207-7r98y-lv4t2m5z3q5v99",
      shopeeLink:
        "https://shopee.co.th/สวนสมุนไพร-ชุดเล็ก-i.12345694.987654344",
    },
  ];

  const sortedGardens = [...popularGardens].sort(
    (a, b) => b.popularityScore - a.popularityScore
  );

  return (
    <div className="bg-gradient-to-b from-green-50 to-white min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-green-800 mb-4 flex items-center justify-center">
            <span className="mr-2">🌿</span> สวนยอดนิยมจาก Shopee
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            ไอเดียสวนสำเร็จรูปที่ลูกค้าชื่นชอบ จัดตามได้ง่าย
            มาพร้อมลิงก์ช้อปปิ้งสุดสะดวก!
          </p>
        </div>

        {/* Garden Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {sortedGardens.map((item, index) => (
            <div
              key={index}
              className="relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
            >
              {/* Badge for Popular Items */}
              {item.popularityScore > 85 && (
                <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  🔥 ยอดนิยม
                </span>
              )}
              {/* Image */}
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-60 object-cover transition-opacity duration-300 hover:opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
              {/* Content */}
              <div className="p-6">
                <h4 className="text-xl font-semibold text-gray-800 mb-2 truncate">
                  {item.name}
                </h4>
                <p className="text-green-600 font-bold text-lg mb-4">
                  {item.price.toLocaleString()} บาท
                </p>
                <a
                  href={item.shopeeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2 rounded-lg text-center transition-colors duration-300 shadow-md"
                >
                  🛒 ซื้อที่ Shopee
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PopularGardens;
