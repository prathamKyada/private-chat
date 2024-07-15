import React, { useState } from "react";
import axios from "axios";
import '../Style/login.css'

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    axios.post("http://localhost:8082/login", { username, password })
      .then((response) => {
        // console.log("DATA > ", response.data.data.user_id )
        if (response.data.data) {
          onLogin(response.data.data);
        }
      })
      .catch((error) => {
        console.error("Login error", error);
      });
  };

  return (
    <div className="login-div" id="login">
      <input
        className="input_txt_name"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        className="input_txt_password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="btn_submit" onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;