import React, { useEffect, useState } from "react";
import API from "../api/axiosConfig";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import "../App.css";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#00C49F"];

const AdminDashboard = () => {
  const [sweets, setSweets] = useState([]);
  const [sales, setSales] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [time, setTime] = useState(new Date().toLocaleString());

  useEffect(() => {
    fetchSweets();
    fetchEmployees();
    const timer = setInterval(() => setTime(new Date().toLocaleString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchSweets = async () => {
    try {
      const res = await API.get("/api/sweets/");
      setSweets(res.data);
      generateSalesData(res.data);
    } catch (error) {
      console.error("Error fetching sweets:", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      // ✅ assuming your backend `/api/auth/users` returns a list of all users
      const res = await API.get("/api/auth/users");
      setEmployees(res.data);
    } catch {
      // 🔹 fallback (if backend route not made yet)
      setEmployees([
        { id: 1, name: "Ravi", role: "admin" },
        { id: 2, name: "Meena", role: "billing" },
        { id: 3, name: "Amit", role: "billing" },
      ]);
    }
  };

  const generateSalesData = (data) => {
    const randomSales = data.map((s) => ({
      name: s.name,
      sales: Math.floor(Math.random() * 120) + 10,
      stock: s.quantity,
    }));
    setSales(randomSales);
  };

  // --- Analytics Calculations ---
  const totalSweets = sweets.length;
  const totalStock = sweets.reduce((sum, s) => sum + s.quantity, 0);
  const totalValue = sweets.reduce((sum, s) => sum + s.price * s.quantity, 0);
  const lowStockCount = sweets.filter((s) => s.quantity < 2).length;
  const totalEmployees = employees.length;
  const billingEmployees = employees.filter((e) => e.role === "billing").length;

  return (
    <div className="admin-dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <h1>🍬 Sweet Shop Admin Dashboard</h1>
        <div className="dashboard-time">
          <p>{time}</p>
          <button className="report-btn">📄 Generate Report</button>
        </div>
      </header>

      {/* Analytics Cards */}
      <section className="analytics-grid">
        <div className="analytics-card">
          <h3>Total Sweets</h3>
          <p>{totalSweets}</p>
        </div>
        <div className="analytics-card">
          <h3>Total Stock (kg)</h3>
          <p>{totalStock.toFixed(2)}</p>
        </div>
        <div className="analytics-card">
          <h3>Stock Value</h3>
          <p>₹{totalValue.toFixed(2)}</p>
        </div>
        <div className="analytics-card warning">
          <h3>Low Stock Items</h3>
          <p>{lowStockCount}</p>
        </div>
        <div className="analytics-card">
          <h3>Total Employees</h3>
          <p>{totalEmployees}</p>
        </div>
        <div className="analytics-card">
          <h3>Billing Staff</h3>
          <p>{billingEmployees}</p>
        </div>
      </section>

      {/* Charts Section */}
      <section className="charts-grid">
        {/* Sales Chart */}
        <div className="chart-card">
          <h2>📊 Sweet-wise Sales (Today)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#00C49F" name="Units Sold" />
              <Bar dataKey="stock" fill="#8884d8" name="Stock (kg)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Chart */}
        <div className="chart-card">
          <h2>🥧 Category Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={Object.values(
                  sweets.reduce((acc, s) => {
                    const cat = s.category || "Uncategorized";
                    acc[cat] = acc[cat] || { name: cat, value: 0 };
                    acc[cat].value += 1;
                    return acc;
                  }, {})
                )}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {COLORS.map((color, index) => (
                  <Cell key={index} fill={color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Employee Summary Table */}
      <section className="recent-orders">
        <h2>👥 Employee Directory</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e, i) => (
              <tr key={i}>
                <td>{e.id}</td>
                <td>{e.name}</td>
                <td>{e.role.charAt(0).toUpperCase() + e.role.slice(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default AdminDashboard;
