import { useState,useEffect } from 'react'
import { login, register } from "./api";
import './Login.css'
import './App.css'
import backgroundImage from './assets/cash.jpg';
import settingsImage from './assets/settings.png';
import {BrowserRouter,Routes, Route, Link} from 'react-router-dom';
import Home from './Home.jsx'
import Trans from './Trans.jsx'
import Bills from './Bills.jsx'
import Invest from './Invest.jsx'
import Settings from "./Settings.jsx"

function App(){

  return(
    <div className="everything">
    <BrowserRouter>
    <nav>
    <div className="navbar">
    <div className="home">
    <Link className="link" to="/"><b>Home</b></Link>
    </div>
    <div className="things">
      <div className="thing"><Link className="link" to="/transactions"><b>Transactions</b></Link></div>
      <div className="thing"><Link className="link" to="/bills-due"><b>Bills Due</b></Link></div>
      <div className="thing"><Link className="link" to="/investments"><b>Investments</b></Link></div>
    </div>
    <div className="settings">
      <img src={settingsImage}></img>
      <Link className="link" to="/settings"><b>Settings</b></Link>
    </div>
    </div>
    </nav>
    
    <div className="the-main-part">
    <Routes>
    <Route path="/" element={<Home/>}/>
    <Route path="/transactions" element={<Trans/>}/>
    <Route path="/bills-due" element={<Bills/>}/>
    <Route path="/investments" element={<Invest/>}/>
    <Route path="/settings" element={<Settings/>}/>
    </Routes>
    </div>
    </BrowserRouter>
    </div>
  )
}

function Main() {
  const [signReg, setSignReg] = useState("Register Here");
  const [heading, setHeading] = useState("Sign In");
  const [buttonc, setButton] = useState("Login");
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState(""); // Add for controlled input
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      if (buttonc === "Login") {
        const res = await login(username, password);
        if (res.token) {
          localStorage.setItem("token", res.token);
          setLoggedIn(true);
        } else {
          setError(res.message || "Login failed");
        }
      } else {
        const res = await register(username, password);
        if (res.message === "User registered") {
          setSignReg("Register Here");
          setHeading("Sign In");
          setButton("Login");
        } else {
          setError(res.message || "Registration failed");
        }
      }
    } catch (e) {
      setError("Network error");
    }
  };


  if (loggedIn) {
    return <App />;
  }
  
  return(
    <div className="container" style={{ 
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover', 
          }}>
      {/*<img src={viteLogo}></img>*/}
    <div>
    <div className="login-box">
      <div className="welcome">
       <h3><b>Welcome!</b></h3>
       <p>First time?</p>
       <button type="button" onClick={()=>{
        if(signReg=="Register Here")
        {setSignReg("Sign In Here");
        setHeading("Sign Up");
        setButton("Register");
        }
        else{
          setSignReg("Register Here");
        setHeading("Sign In");
        setButton("Login");
        }
       }}>{signReg}</button>
      </div>
      <div className="login">
       <h3>{heading}</h3>
       <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
       <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
       <button type="submit" onClick={handleSubmit}>{buttonc}</button>
       {error && <div className="error">{error}</div>}
    </div>
      
    </div>
    </div>
    </div>
  );
}

{/*function Main() {
  const [signReg, setSignReg] = useState("Register Here");
  const [heading, setHeading] = useState("Sign In");
  const [buttonc, setButton] = useState("Login");

    return (
    <div className="container" style={{ 
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover', 
          }}>
      {/*<img src={viteLogo}></img>
    <div>
    <div className="login-box">
      <div className="welcome">
       <h3><b>Welcome!</b></h3>
       <p>First time?</p>
       <button type="button" onClick={()=>{
        if(signReg=="Register Here")
        {setSignReg("Sign In Here");
        setHeading("Sign Up");
        setButton("Register");
        }
        else{
          setSignReg("Register Here");
        setHeading("Sign In");
        setButton("Login");
        }
       }}>{signReg}</button>
      </div>
      <div className="login">
       <h3>{heading}</h3>
       <input type="text" placeholder="Username"></input>
       <input type="password" placeholder="Password"></input>
       <button type="submit" >{buttonc}</button>
    </div>
      
    </div>
    </div>
    </div>
  );
}*/}

export default Main;

