import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import "./Invest.css";


// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const API_URL = "http://localhost:3000/api/investments";

const Investment = () => {
  
  const [investments, setInvestments] = useState([]);
    const [editingId, setEditingId] = useState(null);
  
    const [form, setForm] = useState({
      category: "",
      amount: "",
      duration: "",
      date: "",
      ProfitLoss: "",
    });
  
    // ---------- Calculator State ----------
    const [invested, setInvested] = useState("");
    const [current, setCurrent] = useState("");
    const [years, setYears] = useState("");
    const [roi, setRoi] = useState(null);
    const [cagr, setCagr] = useState(null);
  
    const calculate = () => {
      if (!invested || !current || !years) return;
  
      const i = Number(invested);
      const c = Number(current);
      const y = Number(years);
  
      const roiVal = ((c - i) / i) * 100;
      const cagrVal = ((c / i) ** (1 / y) - 1) * 100;
  
      setRoi(roiVal.toFixed(2));
      setCagr(cagrVal.toFixed(2));
    };
  
    const resetCalc = () => {
      setInvested("");
      setCurrent("");
      setYears("");
      setRoi(null);
      setCagr(null);
    };
  
    // ---------- Load from backend ----------
    useEffect(() => {
      fetchInvestments();
    }, []);
  
    const fetchInvestments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInvestments(res.data);
      } catch (err) {
        console.error("Error fetching investments:", err);
      }
    };
  
    // ---------- Save / Update Investment ----------
    const handleSubmit = async () => {
      if (!form.category || !form.amount || !form.duration || !form.date)
        return alert("Fill all the fields.");
  
      const flag = Number(form.ProfitLoss) < 0 ? "loss" : "profit";
      const data = { ...form, flag };
  
      try {
        const token = localStorage.getItem("token");
  
        if (editingId) {
          const res = await axios.put(`${API_URL}/${editingId}`, data, {
            headers: { Authorization: `Bearer ${token}` },
          });
  
          setInvestments((prev) =>
            prev.map((i) => (i._id === editingId ? res.data : i))
          );
  
          setEditingId(null);
        } else {
          const res = await axios.post(API_URL, data, {
            headers: { Authorization: `Bearer ${token}` },
          });
  
          setInvestments((prev) => [...prev, res.data]);
        }
  
        setForm({
          category: "",
          amount: "",
          duration: "",
          date: "",
          ProfitLoss: "",
        });
  
      } catch (err) {
        console.error("Error saving investment:", err.response?.data || err);
      }
    };
  
    // ---------- Edit ----------
    const handleEdit = (id) => {
      const inv = investments.find((i) => i._id === id);
      if (inv) {
        setForm(inv);
        setEditingId(id);
      }
    };
  
    // ---------- Delete ----------
    const handleDelete = async (id) => {
      try {
        const token = localStorage.getItem("token");
  
        await axios.delete(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        setInvestments((prev) => prev.filter((i) => i._id !== id));
      } catch (err) {
        console.error("Delete error:", err);
      }
    };
  
    // ---------- Totals ----------
    const totalInvested = useMemo(
      () => investments.reduce((sum, i) => sum + Number(i.amount), 0),
      [investments]
    );
  
    const totalProfit = useMemo(
      () => investments.reduce((sum, i) => sum + Number(i.ProfitLoss), 0),
      [investments]
    );
  
    // ---------- Chart ----------
    const categoryData = useMemo(() => {
      const grouped = {};
      investments.forEach((i) => {
        if (!grouped[i.category]) grouped[i.category] = [];
        grouped[i.category].push(Number(i.amount) + Number(i.ProfitLoss));
      });
  
      return Object.entries(grouped).map(([cat, arr]) => ({
        label: cat,
        avg: arr.reduce((a, b) => a + b, 0) / arr.length,
      }));
    }, [investments]);
  
    const chartData = useMemo(() => {
      const labels = investments.map((i) => i.date || "Unknown");
  
      const datasets = categoryData.map((cat, idx) => ({
        label: `${cat.label} (₹)`,
        data: investments
          .filter((i) => i.category === cat.label)
          .map((i) => Number(i.amount) + Number(i.ProfitLoss)),
        borderColor: ["rgba(34,197,94,1)", "rgba(35,179,179,1)", "rgba(221,10,151,1)"][idx % 3],
        backgroundColor: ["rgba(34,197,94,0.2)", "rgba(35,179,179,0.2)", "rgba(221,10,151,0.2)"][idx % 3],
        fill: false,
        tension: 0.4,
      }));
  
      return { labels, datasets };
    }, [investments, categoryData]);
  
    const options = {
      responsive: true,
      plugins: {
        legend: { position: "top" },
        title: { display: true, text: "Investment Growth Over Time" },
      },
    };

  return (
  <div className="main">
     <div className="leftpanel">
      <div className="summary">
        <div className="card income">Total Amount Invested: ₹2000</div>
        <div className="card spent">Total Profit: ₹1000</div>
      </div>

      <div className="transactions">
        <h3>My Investments</h3>
        <div className="investments-header">
          <div className="start">
          <span>Category</span>
          <span>Amount Invested</span>
          <span>Duration</span>
          </div>
          <div className="end">
          <span>Profit/Loss</span>
          <span>Date Invested</span>
          </div>
        </div>
        <div className="transaction-scroll">
        {investments.length === 0 ? (
            <p>No investments yet.</p>
          ) : (
            investments.map((t) => (
              <div key={t._id} className={`transaction ${t.flag === "loss" ? "-highlight" : ""}`}>
                <div>{t.category}</div>
                <div>₹{t.amount}</div>
                <div>{t.duration}</div>
                <div>{t.ProfitLoss}</div>
                <div>{t.date}</div>
                <button onClick={() => handleEdit(t._id)}>Edit</button>
                <button onClick={() => handleDelete(t._id)}>Delete</button>
              </div>
            ))
          )}
      </div>
      </div>
      
      <div className="actions">
          <h3>{editingId ? "Edit Investment" : "Add New Investment"}</h3>
          <div className="inputting">
          <input
            type="text"
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />

          <input
            type="number"
            placeholder="Amount (₹)"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />

          <input
            type="text"
            placeholder="Duration"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
          />

          <input
            type="number"
            placeholder="Profit/Loss (₹)"
            value={form.ProfitLoss}
            onChange={(e) => setForm({ ...form, ProfitLoss: e.target.value })}
          />

          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          </div>
          <button onClick={handleSubmit}>
            {editingId ? "Save Changes" : "Add Investment"}
          </button>
    </div>
        </div>
    <div className="right-panel">
    <div className="chart-box">
      {/* Chart */}
      <div className="chart-container">
        <Line data={chartData} options={options} />
      </div>

      {/* ROI / CAGR Calculator */}
      <div className="calculator-box">
        <h2>ROI / CAGR Calculator</h2>
        <div className="calculator-table">
          <div className="row">
            <label>Invested Amount (₹):</label>
            <input
              type="number"
              placeholder="Invested Amount (₹)"
              value={invested}
              onChange={(e) => setInvested(e.target.value)}
            />
          </div>
          <input
            type="number"
            placeholder="Current Value (₹)"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />

          <input
            type="number"
            placeholder="Years"
            value={years}
            onChange={(e) => setYears(e.target.value)}
          />

          <button onClick={calculate}>Calculate</button>
          <button onClick={resetCalc}>Reset</button>

          {roi !== null && (
            <div className="calc-result">
              <p>ROI: <strong>{roi}%</strong></p>
              <p>CAGR: <strong>{cagr}%</strong></p>
            </div>
          )}
      </div>
    </div>
    </div>
    </div>
    </div>
  );
};

export default Investment;