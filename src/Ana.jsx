import './Ana.css'
import {
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    ResponsiveContainer
} from "recharts";
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Tooltip, Cell } from 'recharts';
import { getBudgets, getExpenses } from './api';

function Stat(props){
    return <div className = {props.clas}><b>{props.name}</b></div>
}

function Info(props){
    return(
        <div className="infor" style={{backgroundColor:props.color}}><b>{props.info}</b></div>
    )
}

function Achievement(props){
    return(
        <div className="stat">
            you have saved {props.percent}% of your {props.freq} goal!
        </div>
    )
}

function Achieve(props){
    return <div className="achieve">
        {props.info}
    </div>
}

function Expenditure({month, categoryData}){
    /*const data = [
        { name: "Travel", cost: 400, color:"#fbe3e8"},
        { name: "Food", cost: 700, color:"#f1b6c2" },
        { name: "Bills", cost: 200, color: "#2d8bba"},
        { name: "Miscellaneous", cost: 1000, color:"#2f5f98" },
    ];*/
    const data = categoryData.length ? categoryData : [{ name: 'No data', cost: 0, color: '#eee' }];
    
    return(<div className="expenditure">
        <div className="monthname">
            <div>{month}</div>
        </div>
        <div className="barchart">
        <ResponsiveContainer>
        <BarChart data={data}>
            <Bar dataKey="value" fill="green">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || "#2d8bba"} />
            ))}
          </Bar>
          <CartesianGrid stroke="#ccc" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis />
        </BarChart>
        </ResponsiveContainer>
        </div>
        <div>Expenditure in {month}</div>
    </div>
    );
}

function ThePie({ totalSpent, totalBudget, categoryData }){
        const [activeIndex, setActiveIndex] = useState(-1);
        const left = Math.max(totalBudget - totalSpent, 0);
        const pieData = (totalSpent&&totalBudget) ? [
        { name: 'Spent', value: totalSpent },
        { name: 'Left', value: left }
        ]: 
        [
        { name: 'Spent', value: 1200 },
        { name: 'left', value: 800 }
        ];
    
        const COLORS = ['#2f5f98', '#2d8bba'];
    
        const onPieEnter = (_, index) => {
            setActiveIndex(index);
        };
    
        return (
            <div className="spentpie">
            <PieChart width={100} height={100}>
                <Pie
                    activeIndex={activeIndex}
                    data={pieData}
                    dataKey="value"
                    outerRadius="100%"
                    innerRadius="70%"
                    fill="green"
                    onMouseEnter={onPieEnter}
                    style={{ cursor: 'pointer', outline: 'none' }} // Ensure no outline on focus
                >
                    {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value}`} />
            </PieChart> 
            <div style={{ marginTop: 8 }}>
            {categoryData.slice(0, 4).map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, background: c.color || '#2d8bba' }} />
                <div>{c.name}: ₹{c.value}</div>
            </div>
            ))}
            </div> 
            </div>
    );
}

function Ana(){
    const [budgets, setBudgets] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
        try {
            const [budgetData, expenseData] = await Promise.all([getBudgets(), getExpenses()]);
            setBudgets(Array.isArray(budgetData) ? budgetData : []);
            setExpenses(Array.isArray(expenseData) ? expenseData : []);
        } catch (err) {
            console.error('Failed to load', err);
            setBudgets([]);
            setExpenses([]);
        } finally {
            setLoading(false);
        }
        }
        fetchData();
    }, []);

    // group expenses by category (expense.name)
    const grouped = {};
    (expenses || []).forEach(e => {
        const cat = e.name || 'Miscellaneous';
        grouped[cat] = (grouped[cat] || 0) + (Number(e.amount) || 0);
    });
    const COLORS = ["#fbe3e8", "#f1b6c2", "#2d8bba", "#2f5f98", "#93f8ae"];
    const categoryData = Object.entries(grouped)
        .map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }))
        .sort((a, b) => b.value - a.value);

    const totalBudget = (budgets || []).reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
    const totalSpent = (expenses || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const income = totalBudget + 2000;
    const savings = income - totalSpent;
    const savingsPercent = totalBudget ? Math.round(((totalBudget - totalSpent) / totalBudget) * 100) : 0;
    const monthlyPercent = totalBudget ? Math.round((totalSpent / totalBudget) * 100) : 0;

    if (loading) return <div>Loading...</div>;

    return(
        <div className="allofit">
            <div className="thestats">
                <Stat clas="expen" name={`Expenses: ${totalSpent||"Not set"}`} />
        <Stat clas="inc" name={`Income: ${income||"Not set"}`} />
        <Stat clas="save" name={`Savings: ${savings||"Not set"}`} />
        <Stat clas="budg" name={`Budget: ${totalBudget||"Not set"}`} />
            </div>
            <div className = "therest">
                <div className="leftside">
                    <div className="topleft">
                        <div className="pie">
                            <ThePie totalSpent={totalSpent} totalBudget={totalBudget} categoryData={categoryData}/>
                            <p>{totalBudget > 0 ? `${monthlyPercent}% of your budget used`: "No budget set yet"}</p>
                        </div>
                        <div className="topright">
                            <Info
                            info={
                            categoryData.length
                                ? `You spent the most on the ${categoryData[0].name} category this month`
                                : `No expenses yet`
                            }
                            color="#2d8bba"
                        />
                        <Info
                            info={
                            categoryData.length
                                ? `You spent the least on the ${categoryData[categoryData.length - 1]?.name} category this month`
                                : `No expenses yet`
                            }
                            color="#fbe3e8"
                        />
                        </div>
                    </div>
                    <div className="bottomleft">
                        <p><b>ACHIEVEMENTS:</b></p>
                        <div className="morestats">
                            <div className="stats">
                                <Achievement freq="overall" percent={savingsPercent} />
                                <Achievement freq="monthly" percent={monthlyPercent} />
                                <Achieve info={`You have logged ${expenses.length} transactions!`} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="rightside">
                    <Expenditure month="This Month" categoryData={categoryData.map(c => ({ name: c.name, value: c.value, color: c.color }))} />
                </div>
            </div>
        </div>
    )
}

export default Ana;