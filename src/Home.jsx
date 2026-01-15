import './Home.css'
import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Tooltip, Cell } from 'recharts';
import { Line} from "react-chartjs-2";
import axios from "axios";
import { getExpenses, getBudgets, putCategory, getCategories } from './api';

const BASE_URL = "http://localhost:3000/api"
const API_URL = "http://localhost:3000/api/investments";

function Pieing({ expenses }) {
  const [activeIndex, setActiveIndex] = useState(-1);

  // group expenses by category (use name or category)
  const data = useMemo(() => {
    const grouped = {};
    (expenses || []).forEach(e => {
      const cat = ( e.name || 'Miscellaneous').trim();
      grouped[cat] = Number(e.amount) || 0;
    });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const COLORS = ['#0088FE', '#00C49F', '#d2604fff', '#2d8bba', '#f1b6c2'];

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  if (!data || data.length === 0) return <div className="thepie">No expense categories yet</div>;

  return (
    <div className="thepie">
      <PieChart width={160} height={160}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          outerRadius="100%"
          onMouseEnter={onPieEnter}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `₹${value}`} />
      </PieChart>
    </div>
  );
}

function Budget({ income }) {
  return <div className="incoming"><p><b>Budget: ₹{income}</b></p></div>
}

function Income({ name }) {
  return (
    <div className="budgeting">
      <p><b>{name}</b></p>
    </div>
  );
}
function Recents({ transactions }) {
  const sorted = [...transactions].sort((a, b) => {
    const da = new Date(a.createdAt || a.date || Date.now());
    const db = new Date(b.createdAt || b.date || Date.now());
    return db - da;
  });

  return (
    <div className="recents">
      <div className="exp"><b>Recent expenditure</b></div>
      <div className="recents-header">
          <span>Category</span>
          <span>Cost</span>
          <span>Desc</span>
          <span>Category</span>
          <span>Date</span>
          <span>Mode</span>
      </div>

      <div className="recent-scroll">
        {sorted.length ?transactions.map((t) => (
          <div key={t._id} className={`recent${(t.type==="income")?" highlight":""}`}>
            <span>{t.type === "income" ? "💰" : "💸"}</span>
            <span>₹{t.amount}</span>
            <span>{t.desc}</span>
            <span>{t.category}</span>
            <span>{new Date(t.date).toLocaleDateString()}</span>
            <span>{t.mode}</span>
          </div>
        )):(
          <div className="recent">No recent expenses</div>
        )}
      </div>
    </div>
  );
}

{/*function Recents(){
    const transactions = [
  { id: 1, amount: 350, desc: "Auto", category: "auto", date: "27 Oct 2025", mode: "Cash" },
  { id: 2, amount: 120, desc: "Metro", category: "auto", date: "27 Oct 2025", mode: "UPI" },
  { id: 3, amount: 400, desc: "Ritu payed back", category: "other", date: "18 Oct 2025", mode: "Cash" },
  { id: 4, amount: 50, desc: "Masala Puri", category: "food", date: "8 Oct 2025", mode: "Cash" },
  { id: 5, amount: 9500, desc: "Rent", category: "bills", date: "30 Sept 2025", mode: "Cash" },
  { id: 6, amount: 200, desc: "Parking", category: "auto", date: "27 Oct 2025", mode: "Cash" },
];
    return(
    <div className="recents">
      <div className="exp"><b>Recent expenditure</b></div>
        <div className="recents-header">
          <div className="first">
          <span>Category</span>
          <span>Cost</span>
          <span>Desc</span>
          </div>

          <div className="last">
          <span>Date</span>
          <span>Mode of Payment</span>
          </div>
        </div>

        <div className="recent-scroll">
        {transactions.map((t) => (
          <div key={t.id} className={`recent ${t.category === "other" ? "highlight" : ""}`}>
            <div className="icon">{t.category === "auto" ? "🚗" : t.category === "food" ? "🍴" : t.category === "bills" ? "🧾" : "•••"}</div>
            <div className="amount">₹{t.amount}</div>
            <div className="desc">{t.desc}</div>
            <div className="date">{t.date}</div>
            <div className="mode">{t.mode}</div>
          </div>
        ))}
        </div>
    </div>
    );
}*/}

function CategoryBar({ expenses }) {
  const grouped = {};
  expenses.forEach(e => {
    const cat = e.name || 'Miscellaneous';
    grouped[cat] = (grouped[cat] || 0) + (Number(e.amount) || 0);
  });
  const data = Object.entries(grouped).map(([name, value]) => ({ name, value }));
  if (data.length === 0) return <div className="prechart-container">No data</div>;

  return (
    <div className="categorychart-container">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid stroke="#ccc" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis />
          <Bar dataKey="value" fill="#2d8bba" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/*function StockChart(){
    const data = {
    labels: [
      "Jan 2024", "Mar 2024", "May 2024", "Jul 2024",
      "Sep 2024", "Nov 2024", "Jan 2025", "Mar 2025",
      "May 2025", "Jul 2025", "Sep 2025"
    ],
    datasets: [
      {
        label: "Stocks (₹)",
        data: [1000, 1200, 1400, 1600, 1850, 2100, 2500, 2900, 3300, 3800, 4500].map(Number),
        fill: false,
        borderColor: "rgba(34, 197, 94, 1)",
        backgroundColor: "rgba(34, 197, 94, 0.2)",
        tension: 0.4,
        pointBackgroundColor: "rgba(34, 197, 94, 1)",
        pointRadius: 4,
      },
      {
        label: "Fixed Deposits (₹)",
        data: [1000, 1020, 1040, 1060, 1850, 2100, 2500, 2900, 3300, 3800, 4500].map(Number),
        borderColor: "rgba(35, 179, 179, 1)",
        backgroundColor: "rgba(34, 197, 194, 0.2)",
        tension: 0.4,
        pointBackgroundColor: "rgba(35, 179, 179, 1)",
        pointRadius: 4,
      },
      {
        label: "Crypto",
        data: [1000, 1250, 1700, 1400, 2100, 2600, 2000, 2800, 3600, 4200, 4800].map(Number),
        borderColor: "rgba(221, 10, 151, 0.93)",
        backgroundColor: "rgba(220, 56, 185, 0.2)",
        fill: false,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: "Investment Growth Over Time",
        font: { size: 18 },
      },
      tooltip: {
        callbacks: {
          label: (context) => `₹${context.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value) => `₹${value}`,
        },
      },
    },
  };
    return( <div className="stockchart-container">
            <Line data={data} options={options} />
          </div>
    );
}*/

function Home(){
  const [investments, setInvestments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudgets] = useState({});
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const token = localStorage.getItem("token");

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(res.data);
      console.log("transctions:", transactions);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  const fetchAll = async () => {
  try {
    const categoryData = { name: "Miscellaneous", amount: 0 };
    putCategory(token, categoryData);
    console.log("fetchAll: starting fetch of expenses & budget");

    const [exp, bud] = await Promise.all([
      getCategories(),  // should return array 
      getBudgets()    // should return a single object or null
    ]);

    console.log("fetchAll: raw expenses response:", exp);
    console.log("fetchAll: raw budgets response:", bud);

    // Expenses should always be an array
    setExpenses(Array.isArray(exp) ? exp : []);

    // Budget is a single object — so extract the amount safely
    // If no budget exists, default to 0
    setBudgets(bud);

  } catch (err) {
    console.error("Error fetching backend data:", err);

    if (err.status === 401 || err.status === 403) {
      console.warn("Authentication error — token may be missing or invalid.");
      // Optional:
      // localStorage.removeItem("token");
      // window.location.reload();
    }

    setExpenses([]);
    setBudgets(0); // budget defaults to 0
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchAll();
  }, []);

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

  console.log(budget.amount);
  const totalBudget = budget?.amount || "Not set";
  const income = transactions.reduce((s, e) => {return ((e.type==="income")? s + (Number(e.amount) || 0 ):s)}, 0);
  const spent = transactions.reduce((s, e) => {return ((e.type==="income")? s: s + (Number(e.amount) || 0 ))}, 0);
  const balance = income - spent;

  if (loading) return <div>Loading...</div>;

    return(
        <div className="all">
        <div className="top">
          <Pieing expenses={expenses}/>
        <div className="info">
          <Budget income={totalBudget} />
        <div className="budget1">
            <Income name={`Income: ₹${income||"Not set"}`} />
            <Income name={`Spent: ₹${spent||"Not set"}`} />
            <Income name={`Balance: ₹${balance||"Not set"}`} />
        </div>
        </div>
        </div>
        <div className="bottom">
        <Recents transactions={transactions}/>
        <div className = "stock-container">
          <Line data={chartData} options={options} />
        </div>
        </div>
        </div>
    );
}

export default Home;

/*import './Home.css'
import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Tooltip, Cell } from 'recharts';
import { Line } from "react-chartjs-2";
import axios from "axios";
import { getExpenses, getBudgets } from './api';

function Pieing({ expenses }){
    const [activeIndex, setActiveIndex] = useState(-1);
    const grouped = {};
      expenses.forEach(e => {
        const cat = e.name || 'Miscellaneous';
        grouped[cat] = (grouped[cat] || 0) + (Number(e.amount) || 0);
    });
    const data = Object.entries(grouped).map(([name, value]) => ({ name, value }));
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#2d8bba', '#f1b6c2'];
  if (data.length === 0) return <div className="thepie">No expense categories yet</div>;
    /*const fetchCategories = async () => {
        try {
            const res = await getCategories(username);
            if (res.token) {
              localStorage.setItem("token", res.token);
              setLoggedIn(true);
            } else {
              setError(res.message || "Login failed");
            }
        } catch (e) {
          setError("Network error");
        }
      };

    const data = [
        { name: "Travel", cost: 400, color:"#fbe3e8"},
        { name: "Food", cost: 700, color:"#f1b6c2" },
        { name: "Bills", cost: 200, color: "#2d8bba"},
        { name: "Miscellaneous", cost: 1000, color:"#2f5f98" },
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];*/

    /*const onPieEnter = (_, index) => {
        setActiveIndex(index);
    };

    return (
        <div className="thepie">
        <PieChart width={160} height={160}>
            <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          outerRadius="100%"
          innerRadius="60%"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `₹${value}`} />
            <Tooltip />
        </PieChart>  
        </div>
    );
}*/





