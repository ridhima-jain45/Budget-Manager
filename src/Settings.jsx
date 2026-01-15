import React, { useState,useEffect } from "react";
import "./Settings.css";

const SettingsPage = () => {
  //const [darkMode, setDarkMode] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved === "true"; // default to false if not set
  });
  const [budget, setBudget] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [username, setUname] = useState("");
  const [oldpass, setOldpass] = useState("");
  const [newpass, setNewpass] = useState("");

  useEffect(() => {
    const body = document.querySelector("body");
    if (darkMode) {
      body.style.backgroundColor = "#000000";
    } else {
      body.style.backgroundColor = "#ffffff";
    }

    // Save preference in localStorage
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);
  
  const handleToggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };
  /*const handleToggleDarkMode = () => {
    const body = document.querySelector("body");
    if(!darkMode)
      body.style.backgroundColor = "#000000";
    else
      body.style.backgroundColor = "#ffffff";
    setDarkMode(!darkMode);
  };*/

  const handleResetPassword = async (e) => {
  e.preventDefault();

  const email =username;
  const oldPassword = oldpass;
  const newPassword = newpass;

  try {
    const res = await fetch("http://localhost:3000/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, oldPassword, newPassword }),
    });

    const data = await res.json();
    alert(data.message);
    e.target.reset();
  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  }
};

const addCategory = async (e) => {
    e.preventDefault();
    if (!categoryName || categoryName.trim() === "") {
      alert("Enter a category name");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:3000/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: categoryName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Category "${data.name}" added`);
        setCategoryName("");
      } else {
        alert(data.message || "Failed to add category");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    }
  };

const changeBudget = async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login first");
    return;
  }

  const amount = Number(budget);
  if (Number.isNaN(amount) || amount < 0) {
    alert("Enter a valid budget amount");
    return;
  }

  try {
    let res = await fetch("http://localhost:3000/api/budgets", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const existingBudget = await res.json(); // object or null

    if (existingBudget && existingBudget._id) {
      const updateRes = await fetch(
        `http://localhost:3000/api/budgets/${existingBudget._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ amount }),
        }
      );

      const data = await updateRes.json();

      if (updateRes.ok) {
        alert(`Budget updated to ₹${data.amount}`);
        setBudget("");
      } else {
        alert(data.message || "Failed to update budget");
      }

      return;
    }

    const createRes = await fetch("http://localhost:3000/api/budgets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount }),
    });

    const data = await createRes.json();

    if (createRes.ok) {
      alert(`New budget created: ₹${data.amount}`);
      setBudget("");
    } else {
      alert(data.message || "Failed to create budget");
    }

  } catch (err) {
    console.error(err);
    alert("Network error while updating budget");
  }
};

// Logout handler: just refresh the page
  const handleLogout = () => {
    window.location.reload(); // assumes login page shows automatically
  };

  return (
    <div className={darkMode ? "settings-container dark" : "settings-container"}>
      <h1 className="settings-title">Settings</h1>

      {/* Appearance */}
      <div className="settings-card">
        <h2>Appearance</h2>
        <label className="toggle-label">
          Dark Mode
          <input
            type="checkbox"
            checked={darkMode}
            onChange={handleToggleDarkMode}
          />
          <span className="slider"></span>
        </label>
      </div>

      <div className="settings-card">
        <h2>Reset Password</h2>
        <form className="settings-form"  onSubmit={handleResetPassword}>
          <label>
            Username
            <input type="text" placeholder="Enter username" 
            value={username}
            onChange={(e) => setUname(e.target.value)}/>
          </label>
          <label>
            Old Password
            <input type="password" 
            value={oldpass}
            onChange={(e) => setOldpass(e.target.value)}
            placeholder="Enter old password" />
          </label>
          <label>
            New Password
            <input type="password" placeholder="Enter new password" 
            value={newpass}
            onChange={(e) => setNewpass(e.target.value)}/>
          </label>
          <button type="submit" className="settings-button">
            Reset Password
          </button>
        </form>
      </div>

      <div className="settings-card">
        <h2>Budget</h2>
        <form className="settings-form" onSubmit={changeBudget}>
          <input
          placeholder={budget}
          type="number"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          />
          <button type="submit" className="settings-button">
            Change budget
          </button>
        </form>
      </div>

      <div className="settings-card">
        <h2>Add an expense category</h2>
        <form className="settings-form" onSubmit={addCategory} >
            <input
            placeholder="Enter category"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value )}
            />
          <button type="submit" className="settings-button">
            Add category
          </button>
        </form>
      </div>

      {/* Logout */}
      <div className="settings-card">
        <h2>Logout</h2>
        <button onClick={handleLogout} className="settings-button logout-button">
          Logout
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;