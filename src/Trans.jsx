import "./Trans.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { putCategory, getCategories} from './api';

const BASE_URL = "http://localhost:3000/api"

/*const transactions = [
  { id: 1, amount: 350, desc: "Auto", category: "auto", date: "27 Oct 2025", mode: "Cash" },
  { id: 2, amount: 120, desc: "Metro", category: "auto", date: "27 Oct 2025", mode: "UPI" },
  { id: 3, amount: 400, desc: "Ritu payed back", category: "other", date: "18 Oct 2025", mode: "Cash" },
  { id: 4, amount: 50, desc: "Masala Puri", category: "food", date: "8 Oct 2025", mode: "Cash" },
  { id: 5, amount: 9500, desc: "Rent", category: "bills", date: "30 Sept 2025", mode: "Cash" },
  { id: 6, amount: 200, desc: "Parking", category: "auto", date: "27 Oct 2025", mode: "Cash" },
];*/

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    amount: "",
    desc: "",
    category: "Miscellaneous",
    date: "",
    mode: "",
    type: "expense",
  });

  let miscId;
  const token = localStorage.getItem("token"); // assuming user token is stored

  // Fetch transactions on load
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/transactions`, {
        headers: { Authorization: `Bearer ${token}`},
      });
      setTransactions(res.data);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  useEffect(() => {
    const categoryData = { name: "Miscellaneous", amount: 0 };
    putCategory(token, categoryData);
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try{
      const exp = await getCategories();
      console.log('fetchAll: raw categories response:', exp);
      setCategories(Array.isArray(exp) ? exp : []);
      console.log('categories response:', categories);
    } catch (err) {
        
      console.error('Error fetching backend data', err);
      if (err.status === 401 || err.status === 403) {
      console.warn('Authentication error — token may be missing or invalid.');
      }
      setCategories([]);
    };
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!form.amount || !form.desc || !form.category) return;

  try {
    // Prepare payload to match Mongoose schema
    const payload = {
      amount: Number(form.amount),      // ensure number
      desc: form.desc,
      category: form.category,
      date: form.date ? new Date(form.date) : new Date(),
      mode: form.mode,
      type: form.type || "expense",
    };

    const res = await axios.post(`${BASE_URL}/transactions`, payload, {
      headers: { Authorization: `Bearer ${token}` }, // token from auth
    });

    // Prepend new transaction
    setTransactions([res.data, ...transactions]);

    // Reset form
    setForm({
      amount: "",
      desc: "",
      category: "",
      date: "",
      mode: "",
      type: "expense",
    });
  } catch (err) {
    console.error("Error saving transaction:", err.response?.data || err.message);
  }
};

const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(transactions.filter((t) => t._id !== id));
    } catch (err) {
      console.error("Error deleting transaction:", err);
    }
  };

  // Calculate totals
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="app">
      <div className="summary">
        <div className="card income">Income: ₹{totalIncome}</div>
        <div className="card spent">Expenses: ₹{totalExpense}</div>
        <div className="card balance">Balance: ₹{balance}</div>
      </div>

      <form className="transaction-form" onSubmit={handleSubmit}>
        <div className="input-stuff">
        <input
          placeholder="Amount"
          type="number"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />
        <input
          placeholder="Description"
          value={form.desc}
          onChange={(e) => setForm({ ...form, desc: e.target.value })}
        />
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          placeHolder="Date"
        />
        <input
          placeholder="Mode"
          value={form.mode}
          onChange={(e) => setForm({ ...form, mode: e.target.value })}
        />
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          {categories.filter((a) => {
            if(a.name==="Miscellaneous")
            {
              miscId = a._id;
              return false;
            }
            return true;
            }).map((t) => (
          <option key={t._id} value={t.name}>{t.name}</option>
        ))}
        <option key={miscId} value="Miscellaneous">Miscellaneous</option>
        </select>
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        </div>
        <button type="submit">Add Transaction</button>
      </form>

      <div className="transactions">
        <div className="transactions-header">
          <span>Type</span>
          <span>Cost</span>
          <span>Desc</span>
          <span>Category</span>
          <span>Date</span>
          <span>Mode</span>
        </div>
        <div className="transaction-scroll">
        {transactions.map((t) => (
          <div key={t._id} className={`transaction${(t.type==="income")?"-highlight":""}`}>
            <span>{t.type === "income" ? "💰" : "💸"}</span>
            <span>₹{t.amount}</span>
            <span>{t.desc}</span>
            <span>{t.category}</span>
            <span>{new Date(t.date).toLocaleDateString()}</span>
            <span>{t.mode}</span>
            <button onClick={() => handleDelete(t._id)}>Delete</button>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}

export default Transactions;
