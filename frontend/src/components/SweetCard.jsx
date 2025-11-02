import React from "react";
import "../App.css";

const SweetCard = ({ sweet }) => (
  <div className="card">
    <h3>{sweet.name}</h3>
    <p>Category: {sweet.category}</p>
    <p>Price: ₹{sweet.price}</p>
    <p>Stock: {sweet.quantity}</p>
    <button disabled={sweet.quantity === 0}>
      {sweet.quantity === 0 ? "Out of Stock" : "Buy Now"}
    </button>
  </div>
);

export default SweetCard;
