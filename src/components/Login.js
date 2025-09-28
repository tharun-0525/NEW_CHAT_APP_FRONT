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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600">
      <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-2xl transform transition-transform hover:scale-105">
        <h2 className="mb-8 text-4xl font-extrabold text-center text-gray-800 tracking-wide">
          Welcome Back
        </h2>

        {error && <p className="mb-6 text-center text-red-600 font-semibold">{error}</p>}

        <input
          className="mb-5 w-full rounded-2xl border border-gray-300 px-5 py-3 text-gray-800 placeholder-gray-400 font-medium focus:outline-none focus:ring-4 focus:ring-indigo-400 focus:border-indigo-500 transition"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          className="mb-8 w-full rounded-2xl border border-gray-300 px-5 py-3 text-gray-800 placeholder-gray-400 font-medium focus:outline-none focus:ring-4 focus:ring-indigo-400 focus:border-indigo-500 transition"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="mb-4 w-full rounded-3xl bg-indigo-600 py-3 text-white font-bold shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all"
        >
          Login
        </button>

        <button
          onClick={() => navigate('/register')}
          className="w-full rounded-3xl bg-gray-200 py-3 text-gray-800 font-bold shadow hover:bg-gray-300 transition-all"
        >
          Register
        </button>
      </div>
    </div>
  );
}
