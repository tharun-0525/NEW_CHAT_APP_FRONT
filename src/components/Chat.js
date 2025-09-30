import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;
const API_WS_URL = process.env.REACT_APP_WS_URL;

export default function Chat() {
  const {friendId} = useParams();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const token = localStorage.getItem("token");
  const senderId = jwtDecode(token).user_id;
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${API_URL}/messages/${friendId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data.reverse());
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };
    fetchMessages();
  }, [friendId, token]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const ws = new WebSocket(`${API_WS_URL}/ws/send?user_id=${friendId}&token=${token}`);

    ws.onopen = () => console.log("✅ Connected to WebSocket");
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const msg = {
        receiver_id: data.receiver_id,
        content: data.content,
        sender_id: data.sender_id,
        timestamp: data.timestamp,
        id: data.id, 
      };
    setMessages(prev => {
      if (prev.some(m => m.id === msg.id)) return prev;
      const combined = [...prev, ...[msg]]; // add new msg
      console.log(combined);
      return combined;
    });
    //console.log(msg);
  };

    ws.onclose = (event) => {
      console.warn(
    `❌ WebSocket closed (code: ${event.code}, reason: ${event.reason || "no reason"}, wasClean: ${event.wasClean})`
    );
    }
    ws.onerror = (err) => console.error("⚠️ WebSocket error", err);

    setSocket(ws);

    return () => {
    };
  }, [friendId]);

  const sendMessage = () => {
    if (socket && input.trim() !== "") {
      socket.send(JSON.stringify({ sender_id: jwtDecode(localStorage.getItem("token")).user_id, receiver_id: friendId ,content: input}));
      setInput("");
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
   <div>
      {/* 🔙 Back Button */}
      <button onClick={() => navigate(-1)} style={{ marginBottom: "10px" }}>
        ⬅ Back
      </button>

      <h2>Chat with Friend {friendId}</h2>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          height: "500px",
          overflowY: "auto",
        }}
      >
        {messages.map((msg) => {
          const isMine = msg.sender_id === senderId;
          return (
            <div
              key={msg.id}
              style={{
                textAlign: isMine ? "right" : "left",
                backgroundColor: isMine ? "#a3f266ff" : "#0e8fe6ff",
                padding: "5px 10px",
                borderRadius: "10px",
                margin: "5px",
                maxWidth: "60%",
                alignSelf: isMine ? "flex-end" : "flex-start",
              }}
            >
              {msg.content}
            
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
