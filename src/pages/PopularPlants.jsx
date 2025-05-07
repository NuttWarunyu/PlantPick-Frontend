import React from "react";
import "../styles.css";

function PopularPlants() {
  const popularItems = [
    {
      type: "plant",
      name: "ไทรใบสัก",
      price: 150,
      image: "https://example.com/thaiyak.jpg",
      shopeeLink: "https://shopee.co.th/product/12345",
    },
    {
      type: "plant",
      name: "ยางอินเดีย",
      price: 200,
      image: "https://example.com/yangindia.jpg",
      shopeeLink: "https://shopee.co.th/product/12346",
    },
    {
      type: "plant",
      name: "ลิ้นมังกร",
      price: 120,
      image: "https://example.com/linmangkon.jpg",
      shopeeLink: "https://shopee.co.th/product/12347",
    },
    {
      type: "plant",
      name: "มอนสเตร่า",
      price: 300,
      image: "https://example.com/monstera.jpg",
      shopeeLink: "https://shopee.co.th/product/12348",
    },
    {
      type: "plant",
      name: "เฟิร์นบอสตัน",
      price: 180,
      image: "https://example.com/fern.jpg",
      shopeeLink: "https://shopee.co.th/product/12349",
    },
    {
      type: "decoration",
      name: "กระถางเซรามิค",
      price: 250,
      image: "https://example.com/ceramicpot.jpg",
      shopeeLink: "https://shopee.co.th/product/12350",
    },
    {
      type: "decoration",
      name: "ขอบพลาสติก",
      price: 150,
      image: "https://example.com/plasticedge.jpg",
      shopeeLink: "https://shopee.co.th/product/12351",
    },
    {
      type: "decoration",
      name: "ตุ๊กตาแมว",
      price: 200,
      image: "https://example.com/catstatue.jpg",
      shopeeLink: "https://shopee.co.th/product/12352",
    },
  ];

  return (
    <div className="popular-plants-page">
      <section className="popular-plants mt-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-green-800">
          ร้าน DIY Gardeners
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {popularItems.map((item, index) => (
            <div
              key={index}
              className="popular-card bg-white p-4 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-40 object-cover rounded-t-lg mb-2"
              />
              <h4 className="font-bold text-lg text-brown-700">{item.name}</h4>
              <p className="text-gray-600">{item.price} บาท</p>
              <a
                href={item.shopeeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block bg-green-500 text-white py-2 px-4 rounded-full hover:bg-green-600"
              >
                ซื้อที่ Shopee
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default PopularPlants;
