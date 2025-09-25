import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const API_URL = process.env.REACT_APP_API_URL;

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        `${API_URL}/auth/login`,
        new URLSearchParams({ username, password }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      if(res.data?.access_token){
        const token = res.data.access_token;
        localStorage.setItem("token", token); // store it for later API calls
        navigate("/friends");
      }
      else
      {
        alert("Login failed: No token returned");
      } // go to friends list page
    }
    catch (err) {
    if (err.response?.status === 401) {
      setError("Invalid username or password");
    } else {
      setError("Something went wrong. Try again later.");
    }
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
      <button onClick={() => navigate("/register")} style={{ marginLeft: "10px" }}>
          Register
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>} {/* show error */}
    </div>
  );
}
