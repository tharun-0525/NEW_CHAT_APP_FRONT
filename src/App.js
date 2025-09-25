import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Friends from "./components/Friends";
import Chat from "./components/Chat";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/message/:friendId" element={<Chat />} />
      </Routes>
    </Router>
  );
}

export default App;
