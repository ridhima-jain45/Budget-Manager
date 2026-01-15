import React, { useEffect, useState } from "react";
import "./Bills.css";

const BASE_URL = "http://localhost:3000";

export default function BillsDuePage() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    amount: "",
    dueDate: "",
    frequency: "Monthly",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/api/bills`)
      .then((res) => res.json())
      .then((data) => {
        setBills(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch bills:", err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${BASE_URL}/api/bills/${editingId}` : `${BASE_URL}/api/bills`;

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then((savedBill) => {
        if (editingId) {
          setBills(bills.map((b) => (b._id === savedBill._id ? savedBill : b)));
        } else {
          setBills([...bills, savedBill]);
        }
        setForm({ title: "", amount: "", dueDate: "", frequency: "Monthly" });
        setEditingId(null);
      })
      .catch((err) => console.error("Save failed:", err));
  };

  const handleEdit = (bill) => {
    setForm({
      title: bill.title,
      amount: bill.amount,
      dueDate: bill.dueDate,
      frequency: bill.frequency,
    });
    setEditingId(bill._id);
  };

  const handleDelete = () => {
    if (bills.length === 0) return;
    const lastBill = bills[bills.length - 1];
    fetch(`${BASE_URL}/api/bills/${lastBill._id}`, { method: "DELETE" })
      .then(() => setBills(bills.slice(0, -1)));
  };

  const handleCopy = () => {
    if (bills.length === 0) return;
    const copy = { ...bills[0], title: bills[0].title + " (Copy)" };
    delete copy._id;
    fetch(`${BASE_URL}/api/bills`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(copy),
    })
      .then((res) => res.json())
      .then((newBill) => setBills([...bills, newBill]));
  };

  const togglePaid = (bill) => {
    const updated = { ...bill, paid: !bill.paid };
    fetch(`${BASE_URL}/api/bills/${bill._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    })
      .then((res) => res.json())
      .then((newBill) =>
        setBills(bills.map((b) => (b._id === newBill._id ? newBill : b)))
      );
  };

  const getColor = (bill) => {
    if (bill.paid) return "#d4edda";
    const today = new Date();
    const due = new Date(`${bill.dueDate} ${today.getFullYear()}`);
    const diff = (due - today) / (1000 * 60 * 60 * 24);
    if (diff >= 0 && diff <= 3) return "#f8d7da";
    return "#ffffff";
  };

  return (
    <div className="bills-container">
      <h1>Bills Manager</h1>

      <div className="form">
        <input name="title" value={form.title} onChange={handleChange} placeholder="Title" />
        <input name="amount" value={form.amount} onChange={handleChange} placeholder="Amount" />
        <input name="dueDate" value={form.dueDate} onChange={handleChange} placeholder="Due Date" />
        <select name="frequency" value={form.frequency} onChange={handleChange}>
          <option value="Monthly">Monthly</option>
          <option value="Yearly">Yearly</option>
        </select>
        <button onClick={handleSubmit}>
          {editingId ? "Update Bill" : "Add Bill"}
        </button>
      </div>

      {loading ? (
        <p>Loading bills...</p>
      ) : (
        <div className="bills-grid">
          {bills.map((bill) => (
            <div
              key={bill._id}
              className="bill-card"
              style={{ backgroundColor: getColor(bill) }}
            >
              <h2>{bill.title}</h2>
              <hr />
              <p className="amount">💵 ₹{bill.amount}</p>
              <p className="secondary">Due date 📅: {bill.dueDate}</p>
              <p className="secondary">Frequency 🔁: {bill.frequency}</p>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={bill.paid}
                  onChange={() => togglePaid(bill)}
                />
              Paid
              </label>

              <button onClick={() => handleEdit(bill)}>✏ Edit</button>
            </div>
          ))}
        </div>
      )}

      <div className="actions">
        <button className="icon-btn" onClick={handleDelete}>🗑 Delete</button>
        <button className="copy-btn" onClick={handleCopy}>📄 Copy</button>
      </div>
    </div>
  );
}
