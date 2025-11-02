import React, { useEffect, useState } from "react";
import API from "../api/axiosConfig";
import SweetCard from "../components/SweetCard";
import "../App.css";

const Dashboard = () => {
  const [sweets, setSweets] = useState([]);

  useEffect(() => {
    const fetchSweets = async () => {
      try {
        const res = await API.get("/api/sweets");
        setSweets(res.data);
      } catch (error) {
        console.error("Error fetching sweets:", error);
      }
    };
    fetchSweets();
  }, []);

  return (
    <div className="container">
      <h2 className="title">Available Sweets 🍭</h2>
      <div className="sweets-grid">
        {sweets.length > 0 ? (
          sweets.map((sweet) => <SweetCard key={sweet.id} sweet={sweet} />)
        ) : (
          <p>No sweets available yet!</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
