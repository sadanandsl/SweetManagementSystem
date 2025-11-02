
import React, { useEffect, useState } from "react";
import API from "../api/axiosConfig";
import "../App.css";

const BillingPanel = () => {
  const [sweets, setSweets] = useState([]);
  const [filteredSweets, setFilteredSweets] = useState([]);
  const [billItems, setBillItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [categories, setCategories] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    fetchSweets();
  }, []);

  const fetchSweets = async () => {
    try {
      const res = await API.get("/api/sweets/");
      setSweets(res.data);
      setFilteredSweets(res.data);

      // ✅ Extract unique categories dynamically
      const uniqueCats = [
        "All",
        ...new Set(res.data.map((s) => s.category).filter((c) => c && c.trim() !== "")),
      ];
      setCategories(uniqueCats);
    } catch (error) {
      console.error("Error fetching sweets:", error);
    }
  };


  // 🔹 Apply search and category filters
  useEffect(() => {
    let filtered = sweets;
    if (searchTerm) {
      filtered = filtered.filter((s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (categoryFilter !== "All") {
      filtered = filtered.filter(
        (s) => s.category && s.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }
    setFilteredSweets(filtered);
  }, [searchTerm, categoryFilter, sweets]);

  // 🔹 Add sweet to bill
  const handleAddToBill = (sweet) => {
    const qty = parseFloat(prompt("Enter quantity (kg, e.g. 0.5 for 500g):", "0.5"));
    if (isNaN(qty) || qty <= 0) return alert("❌ Enter a valid quantity!");
    if (qty > sweet.quantity) return alert("⚠️ Not enough stock available!");

    const total = sweet.price * qty;
    const existing = billItems.find((item) => item.id === sweet.id);
    if (existing) {
      existing.qty += qty;
      existing.total += total;
      setBillItems([...billItems]);
    } else {
      setBillItems([
        ...billItems,
        { id: sweet.id, name: sweet.name, price: sweet.price, qty, total },
      ]);
    }
    setTotalAmount((prev) => prev + total);
  };

  // 🔹 Remove item from bill
  const handleRemove = (id) => {
    const item = billItems.find((i) => i.id === id);
    setBillItems(billItems.filter((i) => i.id !== id));
    setTotalAmount((prev) => prev - item.total);
  };

  // 🔹 Complete payment
  const handlePayment = (method) => {
    alert(`✅ Payment successful via ${method}!`);
    setBillItems([]);
    setTotalAmount(0);
  };

  return (
    <div className="billing-dashboard">
      {/* Header Section */}
      <div className="billing-header">
        <h1>🍬 Sweet Shop POS Billing</h1>
        <div className="billing-controls">
          <input
            type="text"
            placeholder="🔍 Search sweets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <button
            className="new-bill-btn"
            onClick={() => {
              setBillItems([]);
              setTotalAmount(0);
            }}
          >
            🧾 New Bill
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="billing-layout">
        {/* Left — Sweet Catalog */}
        <div className="catalog-section">
          <h2>🧁 Sweet Catalog</h2>
          <div className="sweet-cards">
            {filteredSweets.length === 0 ? (
              <p>No sweets available.</p>
            ) : (
              filteredSweets.map((sweet) => (
                <div key={sweet.id} className="sweet-card-item">
                  <h3>{sweet.name}</h3>
                  <p>₹{sweet.price}/kg</p>
                  <p>{sweet.category}</p>
                  <button onClick={() => handleAddToBill(sweet)}>Add</button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right — Billing Section */}
        <div className="bill-section">
          <h2>🧾 Current Bill</h2>
          {billItems.length === 0 ? (
            <p>No items added yet.</p>
          ) : (
            <table className="bill-table">
              <thead>
                <tr>
                  <th>Sweet</th>
                  <th>Qty (kg)</th>
                  <th>Rate (₹)</th>
                  <th>Total (₹)</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {billItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.qty}</td>
                    <td>{item.price}</td>
                    <td>{item.total.toFixed(2)}</td>
                    <td>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="delete-btn"
                      >
                        ❌
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="bill-summary">
            <h3>Total: ₹{totalAmount.toFixed(2)}</h3>
            <div className="payment-buttons">
              <button onClick={() => handlePayment("Cash")}>💵 Cash</button>
              <button onClick={() => handlePayment("UPI")}>📱 UPI</button>
              <button onClick={() => handlePayment("Card")}>💳 Card</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPanel;
