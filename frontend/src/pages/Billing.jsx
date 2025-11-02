import React, { useEffect, useState } from "react";
import API from "../api/axiosConfig";
import "../App.css";

const Billing = () => {
  const [sweets, setSweets] = useState([]);
  const [billItems, setBillItems] = useState([]);
  const [total, setTotal] = useState(0);

  // Fetch sweets
  useEffect(() => {
    const fetchSweets = async () => {
      try {
        const res = await API.get("/api/sweets/");
        setSweets(res.data);
      } catch (err) {
        console.error("Error fetching sweets:", err);
      }
    };
    fetchSweets();
  }, []);

  // Add to bill
  const addToBill = (sweet) => {
    const existing = billItems.find((item) => item.id === sweet.id);
    if (existing) {
      existing.qty += 1;
      setBillItems([...billItems]);
    } else {
      setBillItems([...billItems, { ...sweet, qty: 1 }]);
    }
    updateTotal();
  };

  // Remove from bill
  const removeFromBill = (id) => {
    const updated = billItems.filter((item) => item.id !== id);
    setBillItems(updated);
    updateTotal();
  };

  // Calculate total
  const updateTotal = () => {
    const newTotal = billItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    setTotal(newTotal.toFixed(2));
  };

  // Generate Bill (mock)
  const generateBill = () => {
    if (billItems.length === 0) {
      alert("No items in bill");
      return;
    }
    alert("✅ Bill generated successfully!");
    console.log("Bill Items:", billItems);
    console.log("Total:", total);
    setBillItems([]);
    setTotal(0);
  };

  return (
    <div className="container">
      <h2 className="title">🧾 Sweet Shop Billing</h2>
      <div className="billing-layout">
        {/* Left: Sweets List */}
        <div className="sweets-list">
          <h3>Available Sweets</h3>
          {sweets.map((sweet) => (
            <div key={sweet.id} className="sweet-item">
              <span>
                {sweet.name} ({sweet.category}) - ₹{sweet.price}
              </span>
              <button onClick={() => addToBill(sweet)}>Add</button>
            </div>
          ))}
        </div>

        {/* Right: Bill Preview */}
        <div className="bill-preview">
          <h3>Current Bill</h3>
          {billItems.length === 0 ? (
            <p>No items added yet</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                  <th>❌</th>
                </tr>
              </thead>
              <tbody>
                {billItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.qty}</td>
                    <td>₹{item.price}</td>
                    <td>₹{(item.price * item.qty).toFixed(2)}</td>
                    <td>
                      <button onClick={() => removeFromBill(item.id)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <h3>Total: ₹{total}</h3>
          <button className="generate-btn" onClick={generateBill}>
            Generate Bill
          </button>
        </div>
      </div>
    </div>
  );
};

export default Billing;
