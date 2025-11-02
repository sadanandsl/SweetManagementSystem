import React, { useState, useEffect } from "react";
import API from "../api/axiosConfig";
import "../App.css";

const AdminPanel = () => {
  const [sweets, setSweets] = useState([]);
  const [newSweet, setNewSweet] = useState({ name: "", category: "", price: "", quantity: "" });

  const fetchSweets = async () => {
    try {
      const res = await API.get("/api/sweets/");
      setSweets(res.data);
    } catch (error) {
      console.error("Error fetching sweets:", error);
    }
  };

  useEffect(() => {
    fetchSweets();
  }, []);

  // --- Analytics Calculations ---
  const totalSweets = sweets.length;
  const totalStock = sweets.reduce((sum, s) => sum + s.quantity, 0);
  const totalValue = sweets.reduce((sum, s) => sum + s.price * s.quantity, 0);
  const lowStock = sweets.filter((s) => s.quantity < 2);

// --- Add New Sweet ---
const handleAddSweet = async (e) => {
  e.preventDefault();

  try {
    const category = newSweet.category.trim();
    const sweetData = {
      name: newSweet.name,
      category,
      price: parseFloat(newSweet.price),
      quantity: parseFloat(newSweet.quantity),
    };

    await API.post("/api/sweets/", sweetData);
    alert("✅ Sweet added successfully!");

    // ✅ Save category locally
    if (category) {
      let savedCats = JSON.parse(localStorage.getItem("categories")) || [];
      if (!savedCats.includes(category)) {
        savedCats.push(category);
        localStorage.setItem("categories", JSON.stringify(savedCats));
      }
    }

    setNewSweet({ name: "", category: "", price: "", quantity: "" });
    fetchSweets();
  } catch (error) {
    console.error("Error adding sweet:", error);
    alert("❌ Failed to add sweet. Check backend connection.");
  }
};



  // --- Delete Sweet ---
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this sweet?")) {
      try {
        await API.delete(`/api/sweets/${id}`);
        fetchSweets();
      } catch (error) {
        console.error("Error deleting sweet:", error);
      }
    }
  };

  return (
    <div className="admin-panel-wrapper">
      <div className="admin-header">
        <h1>🍬 Sweet Inventory Management</h1>
        <p>Efficiently manage your sweet inventory, pricing, and stock levels.</p>
      </div>

      {/* --- Analytics Cards --- */}
      <div className="analytics-grid wide">
        <div className="analytics-card">
          <h3>Total Sweets</h3>
          <p>{totalSweets}</p>
        </div>
        <div className="analytics-card">
          <h3>Total Stock (kg)</h3>
          <p>{totalStock.toFixed(2)}</p>
        </div>
        <div className="analytics-card">
          <h3>Stock Value (₹)</h3>
          <p>₹{totalValue.toFixed(2)}</p>
        </div>
        <div className="analytics-card warning">
          <h3>Low Stock Items</h3>
          <p>{lowStock.length}</p>
        </div>
      </div>

      {/* --- Add Sweet Form --- */}
      <section className="add-sweet-section">
        <h2>Add New Sweet</h2>
        <form onSubmit={handleAddSweet} className="admin-form enhanced">
          <input
            type="text"
            placeholder="Sweet Name"
            value={newSweet.name}
            onChange={(e) => setNewSweet({ ...newSweet, name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Category (Dry, Milk, Ghee, etc.)"
            value={newSweet.category}
            onChange={(e) => setNewSweet({ ...newSweet, category: e.target.value })}
          />
          <input
            type="number"
            placeholder="Price per kg (₹)"
            value={newSweet.price}
            onChange={(e) => setNewSweet({ ...newSweet, price: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Quantity (kg)"
            value={newSweet.quantity}
            onChange={(e) => setNewSweet({ ...newSweet, quantity: e.target.value })}
            required
          />
          <button type="submit" className="btn-primary">➕ Add Sweet</button>
        </form>
      </section>

      {/* --- Inventory Table --- */}
      <section className="table-section wide">
        <h2>📦 Current Inventory</h2>
        <table className="admin-table full-width">
          <thead>
            <tr>
              <th>#</th>
              <th>Sweet Name</th>
              <th>Category</th>
              <th>Price/kg (₹)</th>
              <th>Quantity (kg)</th>
              <th>Total Value (₹)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sweets.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                  🍭 No sweets added yet.
                </td>
              </tr>
            ) : (
              sweets.map((s, index) => (
                <tr key={s.id} className={s.quantity < 2 ? "low-stock-row" : ""}>
                  <td>{index + 1}</td>
                  <td>{s.name}</td>
                  <td>{s.category || "-"}</td>
                  <td>₹{s.price}</td>
                  <td>{s.quantity}</td>
                  <td>₹{(s.price * s.quantity).toFixed(2)}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="delete-btn"
                    >
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default AdminPanel;
