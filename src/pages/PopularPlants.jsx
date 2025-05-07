import React from "react";
import "../styles.css";

function PopularPlants() {
  const popularPlants = [
    {
      name: "ไทรใบสัก",
      price: 150,
      image: "https://example.com/thaiyak.jpg",
      shopeeLink: "https://shopee.co.th/product/12345",
    },
    {
      name: "ยางอินเดีย",
      price: 200,
      image: "https://example.com/yangindia.jpg",
      shopeeLink: "https://shopee.co.th/product/12346",
    },
    {
      name: "ลิ้นมังกร",
      price: 120,
      image: "https://example.com/linmangkon.jpg",
      shopeeLink: "https://shopee.co.th/product/12347",
    },
    {
      name: "มอนสเตร่า",
      price: 300,
      image: "https://example.com/monstera.jpg",
      shopeeLink: "https://shopee.co.th/product/12348",
    },
    {
      name: "เฟิร์นบอสตัน",
      price: 180,
      image: "https://example.com/fern.jpg",
      shopeeLink: "https://shopee.co.th/product/12349",
    },
    {
      name: "พลูด่าง",
      price: 250,
      image: "https://example.com/pludang.jpg",
      shopeeLink: "https://shopee.co.th/product/12350",
    },
    {
      name: "เดหลี",
      price: 90,
      image: "https://example.com/delee.jpg",
      shopeeLink: "https://shopee.co.th/product/12351",
    },
    {
      name: "บอนสี",
      price: 220,
      image: "https://example.com/bonsi.jpg",
      shopeeLink: "https://shopee.co.th/product/12352",
    },
    {
      name: "ว่านสี่ทิศ",
      price: 160,
      image: "https://example.com/wansitit.jpg",
      shopeeLink: "https://shopee.co.th/product/12353",
    },
    {
      name: "กุหลาบหิน",
      price: 140,
      image: "https://example.com/rose.jpg",
      shopeeLink: "https://shopee.co.th/product/12354",
    },
    {
      name: "ต้นเงินไหลมา",
      price: 170,
      image: "https://example.com/money.jpg",
      shopeeLink: "https://shopee.co.th/product/12355",
    },
    {
      name: "ต้นจั๋ง",
      price: 130,
      image: "https://example.com/jang.jpg",
      shopeeLink: "https://shopee.co.th/product/12356",
    },
    {
      name: "ต้นเขียวหมื่นปี",
      price: 190,
      image: "https://example.com/green.jpg",
      shopeeLink: "https://shopee.co.th/product/12357",
    },
    {
      name: "ต้นคลาสซูล่า",
      price: 200,
      image: "https://example.com/crassula.jpg",
      shopeeLink: "https://shopee.co.th/product/12358",
    },
    {
      name: "ต้นว่านหางจระเข้",
      price: 110,
      image: "https://example.com/aloe.jpg",
      shopeeLink: "https://shopee.co.th/product/12359",
    },
    {
      name: "ต้นออมเงิน",
      price: 160,
      image: "https://example.com/ommoney.jpg",
      shopeeLink: "https://shopee.co.th/product/12360",
    },
    {
      name: "ต้นกวักมรกต",
      price: 180,
      image: "https://example.com/gwak.jpg",
      shopeeLink: "https://shopee.co.th/product/12361",
    },
    {
      name: "ต้นว่านงาช้าง",
      price: 150,
      image: "https://example.com/ngachang.jpg",
      shopeeLink: "https://shopee.co.th/product/12362",
    },
    {
      name: "ต้นฟิโลเดนดรอน",
      price: 220,
      image: "https://example.com/philo.jpg",
      shopeeLink: "https://shopee.co.th/product/12363",
    },
    {
      name: "ต้นเข็ม",
      price: 140,
      image: "https://example.com/khem.jpg",
      shopeeLink: "https://shopee.co.th/product/12364",
    },
    {
      name: "ต้นชบา",
      price: 130,
      image: "https://example.com/chaba.jpg",
      shopeeLink: "https://shopee.co.th/product/12365",
    },
    {
      name: "ต้นกล้วยไม้",
      price: 300,
      image: "https://example.com/orchid.jpg",
      shopeeLink: "https://shopee.co.th/product/12366",
    },
    {
      name: "ต้นโป๊ยเซียน",
      price: 120,
      image: "https://example.com/poysean.jpg",
      shopeeLink: "https://shopee.co.th/product/12367",
    },
    {
      name: "ต้นลาเวนเดอร์",
      price: 200,
      image: "https://example.com/lavender.jpg",
      shopeeLink: "https://shopee.co.th/product/12368",
    },
    {
      name: "ต้นมะลิ",
      price: 150,
      image: "https://example.com/jasmine.jpg",
      shopeeLink: "https://shopee.co.th/product/12369",
    },
  ];

  const gardenDecorations = [
    {
      name: "กระถางเซรามิคเล็ก",
      price: 120,
      image: "https://example.com/ceramicpot1.jpg",
      shopeeLink: "https://shopee.co.th/product/12370",
    },
    {
      name: "กระถางเซรามิคใหญ่",
      price: 250,
      image: "https://example.com/ceramicpot2.jpg",
      shopeeLink: "https://shopee.co.th/product/12371",
    },
    {
      name: "ขอบพลาสติกสีขาว",
      price: 150,
      image: "https://example.com/plasticedge1.jpg",
      shopeeLink: "https://shopee.co.th/product/12372",
    },
    {
      name: "ขอบพลาสติกสีเขียว",
      price: 150,
      image: "https://example.com/plasticedge2.jpg",
      shopeeLink: "https://shopee.co.th/product/12373",
    },
    {
      name: "ตุ๊กตาแมวสีขาว",
      price: 200,
      image: "https://example.com/catstatue1.jpg",
      shopeeLink: "https://shopee.co.th/product/12374",
    },
    {
      name: "ตุ๊กตาแมวสีส้ม",
      price: 200,
      image: "https://example.com/catstatue2.jpg",
      shopeeLink: "https://shopee.co.th/product/12375",
    },
    {
      name: "กระถางลายดอกไม้",
      price: 180,
      image: "https://example.com/flowerpot.jpg",
      shopeeLink: "https://shopee.co.th/product/12376",
    },
    {
      name: "ป้ายไม้ชื่อต้นไม้",
      price: 80,
      image: "https://example.com/plantlabel.jpg",
      shopeeLink: "https://shopee.co.th/product/12377",
    },
    {
      name: "โคมไฟสวนขนาดเล็ก",
      price: 300,
      image: "https://example.com/gardenlight1.jpg",
      shopeeLink: "https://shopee.co.th/product/12378",
    },
    {
      name: "โคมไฟสวนลายดอก",
      price: 350,
      image: "https://example.com/gardenlight2.jpg",
      shopeeLink: "https://shopee.co.th/product/12379",
    },
    {
      name: "ชิงช้าตุ๊กตา",
      price: 220,
      image: "https://example.com/swingset.jpg",
      shopeeLink: "https://shopee.co.th/product/12380",
    },
    {
      name: "น้ำพุจิ๋ว",
      price: 400,
      image: "https://example.com/fountain.jpg",
      shopeeLink: "https://shopee.co.th/product/12381",
    },
    {
      name: "หินตกแต่งสีขาว",
      price: 100,
      image: "https://example.com/whitestone.jpg",
      shopeeLink: "https://shopee.co.th/product/12382",
    },
    {
      name: "หินตกแต่งสีเทา",
      price: 100,
      image: "https://example.com/greystone.jpg",
      shopeeLink: "https://shopee.co.th/product/12383",
    },
    {
      name: "ตุ๊กตากระต่าย",
      price: 180,
      image: "https://example.com/rabbitstatue.jpg",
      shopeeLink: "https://shopee.co.th/product/12384",
    },
    {
      name: "กระถางแขวนลายจุด",
      price: 150,
      image: "https://example.com/hangingpot1.jpg",
      shopeeLink: "https://shopee.co.th/product/12385",
    },
    {
      name: "กระถางแขวนลายใบ",
      price: 150,
      image: "https://example.com/hangingpot2.jpg",
      shopeeLink: "https://shopee.co.th/product/12386",
    },
    {
      name: "ชั้นวางต้นไม้ไม้ไผ่",
      price: 500,
      image: "https://example.com/bambooshelf.jpg",
      shopeeLink: "https://shopee.co.th/product/12387",
    },
    {
      name: "ป้ายสวนลายดอก",
      price: 90,
      image: "https://example.com/gardensign.jpg",
      shopeeLink: "https://shopee.co.th/product/12388",
    },
    {
      name: "ที่รดน้ำลายการ์ตูน",
      price: 120,
      image: "https://example.com/wateringcan.jpg",
      shopeeLink: "https://shopee.co.th/product/12389",
    },
    {
      name: "ผ้าคลุมดินสีเขียว",
      price: 200,
      image: "https://example.com/groundcover.jpg",
      shopeeLink: "https://shopee.co.th/product/12390",
    },
    {
      name: "ตุ๊กตานกฮูก",
      price: 180,
      image: "https://example.com/owlstatue.jpg",
      shopeeLink: "https://shopee.co.th/product/12391",
    },
    {
      name: "ตาข่ายกันนก",
      price: 250,
      image: "https://example.com/birdnet.jpg",
      shopeeLink: "https://shopee.co.th/product/12392",
    },
    {
      name: "ลูกบอลไฟสวน",
      price: 300,
      image: "https://example.com/lightball.jpg",
      shopeeLink: "https://shopee.co.th/product/12393",
    },
    {
      name: "ม้านั่งจิ๋ว",
      price: 220,
      image: "https://example.com/minibench.jpg",
      shopeeLink: "https://shopee.co.th/product/12394",
    },
  ];

  return (
    <div className="cute-shop-page">
      <section className="cute-section">
        <h2 className="cute-title">
          <span className="cute-icon">🌿</span> ร้าน DIY Gardeners
        </h2>

        {/* หมวดหมู่ต้นไม้ยอดนิยม */}
        <div className="category-section">
          <h3 className="category-title">
            <span className="category-icon">🌱</span> ต้นไม้ยอดนิยม
          </h3>
          <div className="cute-items">
            {popularPlants.map((item, index) => (
              <div key={index} className="cute-card">
                <img src={item.image} alt={item.name} className="cute-image" />
                <h4 className="cute-name">{item.name}</h4>
                <p className="cute-price">{item.price} บาท</p>
                <a
                  href={item.shopeeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cute-button"
                >
                  ซื้อที่ Shopee
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* หมวดหมู่ของตกแต่งสวน */}
        <div className="category-section">
          <h3 className="category-title">
            <span className="category-icon">🌸</span> ของตกแต่งสวน
          </h3>
          <div className="cute-items">
            {gardenDecorations.map((item, index) => (
              <div key={index} className="cute-card">
                <img src={item.image} alt={item.name} className="cute-image" />
                <h4 className="cute-name">{item.name}</h4>
                <p className="cute-price">{item.price} บาท</p>
                <a
                  href={item.shopeeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cute-button"
                >
                  ซื้อที่ Shopee
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default PopularPlants;
