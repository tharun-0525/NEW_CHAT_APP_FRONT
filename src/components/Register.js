import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const API_URL = process.env.REACT_APP_API_URL;

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const handleRegister = async () => {
    setError('');
    setSuccess('');
    try {
      const res = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        username,
        password
      });
      console.log(res.data);
      setSuccess('Registered Successfully');
      navigate("/register");
      setName('');
      setEmail('');
      setUsername('');
      setPassword('');
    } 
    catch (err) {
      console.error(err);
      const obj=err.response?.data.detail[0].loc[1] || "error"
      const msg=err.response?.data.detail[0].msg || "Something went wrong"
      setError( `${obj}:${msg}`);
    }
  };

  return (
<div className="flex min-h-screen items-center justify-center bg-gray-100">
  <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Register</h2>

    {error && <p className="text-red-500 text-center mb-2">{error}</p>}
    {success && <p className="text-green-500 text-center mb-2">{success}</p>}

    <input
      placeholder="Name"
      value={name}
      onChange={(e) => setName(e.target.value)}
      className="w-full mb-3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
    />

    <input
      placeholder="Username"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      className="w-full mb-3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
    />

    <input
      placeholder="E-mail"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className="w-full mb-3 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
    />

    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="w-full mb-5 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
    />

    <div className="flex justify-between">
      <button
        onClick={handleRegister}
        className="w-[48%] bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
      >
        Register
      </button>
      <button
        onClick={() => navigate("/")}
        className="w-[48%] bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
      >
        Back to Login
      </button>
    </div>
  </div>
</div>

  );
}
