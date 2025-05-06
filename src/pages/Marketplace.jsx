import React, { useState, useEffect } from "react";
import "../styles.css";

function Marketplace() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    image: null,
    description: "",
    contact: "",
  });
  const [sortBy, setSortBy] = useState("latest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // เรียก API (ถ้ายังไม่มีให้ใช้ mock data)
    setLoading(true);
    fetch("https://plantpick-backend.up.railway.app/marketplace")
      .then((res) => {
        if (!res.ok) throw new Error("ไม่พบข้อมูลจากเซิร์ฟเวอร์");
        return res.json();
      })
      .then((data) => setProducts(data))
      .catch((err) => {
        setError("ไม่สามารถดึงข้อมูลได้: " + err.message);
        // Mock data ชั่วคราว
        setProducts([
          {
            name: "ไทรใบสัก",
            price: 150,
            description: "ต้นไม้ในร่ม",
            contact: "line123",
          },
          {
            name: "ลิ้นมังกร",
            price: 120,
            description: "ทนแดด",
            contact: "line456",
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("price", newProduct.price);
    formData.append("image", newProduct.image);
    formData.append("description", newProduct.description);
    formData.append("contact", newProduct.contact);

    setLoading(true);
    try {
      const response = await fetch(
        "https://plantpick-backend.up.railway.app/marketplace",
        {
          method: "POST",
          body: formData,
        }
      );
      if (!response.ok) throw new Error("การลงขายล้มเหลว");
      const result = await response.json();
      alert(result.message || "ลงขายสำเร็จ!");
      setNewProduct({
        name: "",
        price: "",
        image: null,
        description: "",
        contact: "",
      });
      // รีเฟรชข้อมูล
      fetch("https://plantpick-backend.up.railway.app/marketplace")
        .then((res) => res.json())
        .then((data) => setProducts(data));
    } catch (err) {
      setError("เกิดข้อผิดพลาด: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "latest")
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    if (sortBy === "priceLow") return a.price - b.price;
    if (sortBy === "priceHigh") return b.price - a.price;
    return 0;
  });

  if (loading) return <div className="loading">กำลังโหลด...</div>;
  if (error) return <div className="error text-red-500">{error}</div>;

  return (
    <div className="marketplace">
      <h2>ตลาดต้นไม้เสรี</h2>
      <form onSubmit={handleSubmit} className="sell-form">
        <input
          type="text"
          value={newProduct.name}
          onChange={(e) =>
            setNewProduct({ ...newProduct, name: e.target.value })
          }
          placeholder="ชื่อต้นไม้"
          required
        />
        <input
          type="number"
          value={newProduct.price}
          onChange={(e) =>
            setNewProduct({ ...newProduct, price: e.target.value })
          }
          placeholder="ราคา"
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setNewProduct({ ...newProduct, image: e.target.files[0] })
          }
          required
        />
        <textarea
          value={newProduct.description}
          onChange={(e) =>
            setNewProduct({ ...newProduct, description: e.target.value })
          }
          placeholder="คำอธิบาย"
          required
        />
        <input
          type="text"
          value={newProduct.contact}
          onChange={(e) =>
            setNewProduct({ ...newProduct, contact: e.target.value })
          }
          placeholder="Line ID หรือเบอร์โทร"
          required
        />
        <button type="submit" className="bg-green-500 text-white p-2 rounded">
          ลงขาย
        </button>
      </form>
      <div className="filter">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="latest">ล่าสุด</option>
          <option value="priceLow">ราคาน้อยไปมาก</option>
          <option value="priceHigh">ราคามากไปน้อย</option>
        </select>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {sortedProducts.map((product, index) => (
          <div key={index} className="product-card bg-white p-4 rounded shadow">
            <h4>{product.name}</h4>
            <p>ราคา: {product.price} บาท</p>
            <p>คำอธิบาย: {product.description}</p>
            <p>
              ติดต่อ:{" "}
              <a
                href={`https://line.me/R/ti/p/~${product.contact}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {product.contact}
              </a>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Marketplace;
