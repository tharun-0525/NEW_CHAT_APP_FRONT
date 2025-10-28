import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;
const API_WS_URL = process.env.REACT_APP_WS_URL;
const limit = 13;

export default function Chat() {
  const {friendId} = useParams();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const token = localStorage.getItem("token");
  const senderId = jwtDecode(token).user_id;
  const navigate = useNavigate();
  const bottomRef = useRef(null);
  const chatBoxRef = useRef(null);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

    const fetchMessages = async () => {
      if (!hasMore || loading) return;
      setLoading(true);

      const chatDiv = chatBoxRef.current;
      const prevHeight = chatDiv?.scrollHeight || 0;

      try {
        const ress = await axios.get(`${API_URL}/messages/${friendId}`, {
          params: { after_id: offset, limit: limit },
          headers: { Authorization: `Bearer ${token}` }
        });
        const res=ress.data;
        console.log("API Response:", res);

        if(res.status !== "success") {
          setHasMore(false);
          return;

        }
        if (res.data.length < limit) {
          setHasMore(false);
        }
        setMessages(prev => {
          const newOnes = res.data.filter(m => !prev.some(p => p.id === m.id));
          return [...newOnes.reverse(), ...prev];
        });
        setOffset(prev => prev + limit);

        if (chatDiv) chatDiv.scrollTop = chatDiv.scrollHeight - prevHeight;
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
      setLoading(false);
    };

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
      const combined = [...prev, ...[msg]];
      console.log(combined);
      return combined;
    });
    //console.log(msg);
    setTimeout(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);
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
    console.log("Fetching messages...");
    fetchMessages();
    // eslint-disable-next-line
  }, []);

    //useEffect(() => {
    //  bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    //}, [messages]);

  const handleScroll = () => {
    if (chatBoxRef.current.scrollTop === 0) fetchMessages();
  };

  return (
    <div>
      {/* 🔙 Back Button */}
      <button onClick={() => navigate(-1)} style={{ marginBottom: "10px" }}>
        ⬅ Back
      </button>

      <h2>Chat with Friend {friendId}</h2>
      <div
  ref={chatBoxRef}
  onScroll={handleScroll}
  className="w-full max-w-4xl h-[500px] flex flex-col space-y-2 p-4 border rounded-lg bg-white shadow-md overflow-y-auto mx-auto"
>
        {messages.map((msg) => {
          const isMine = msg.sender_id === senderId;
          return (
            <div
              key={msg.id}
              className={`mb-2 px-6 py-3 rounded-2xl text-sm shadow-sm break-words ${
                isMine
                  ? "ml-auto bg-green-400 text-white text-right"
                  : "mr-auto bg-blue-500 text-white text-left"
              }`}
              style={{ maxWidth: "70%" }}
            >
              {msg.content}
            
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="flex items-center mt-4 space-x-2 w-full max-w-4xl mx-auto">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button onClick={sendMessage}  
        className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow-sm">
        Send</button>
      </div>
    </div>
  );
}
