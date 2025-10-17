import { useState, useEffect , useRef} from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
const API_URL = process.env.REACT_APP_API_URL;
const limit = 10;

export default function FriendsList() {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastId, setLastId] = useState(0);
  const chatBoxRef = useRef(null);
  const BottomRef = useRef(null);

  const token = localStorage.getItem("token");
  const sender_id = jwtDecode(token).user_id;
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("token");
    console.log("token",localStorage.getItem("token"))
    navigate("/")
  }

  const fetchFriends = async () => {
    if (loading || !hasMore){ 
      console.log("no more to fetch");
      return;
    }
    setLoading(true);

    const chatDiv = chatBoxRef.current;
    const prevHeight = chatDiv.scrollHeight || 0;

    try {
      const ress = await axios.get(
        `${API_URL}/users`, 
        {
        params: { after_id: lastId, limit: limit }, 
        headers: { Authorization: `Bearer ${token}` }
        }
      );
      console.log("Fetched users:", ress.data);
      const res = Array.isArray(ress.data) ? ress : [];

      console.log("Fetched users response:", res.data);
      setLastId(res.data[res.data.length - 1].id);
      console.log("Last ID:", res.data[res.data.length - 1].id);
      console.log("lastId state:", lastId);
      if (res.data.length === 0) {
        setHasMore(false);
      } 
      else {
        if (res.data.length < limit) {
          setHasMore(false);
        }
        setFriends(prevFriends => {
      // Filter out duplicates before appending
        const newFriends = res.data.filter(
          user => !prevFriends.some(f => f.id === user.id)
        );
        return [...prevFriends, ...newFriends];
        });
      }
      if (chatDiv) chatDiv.scrollTop = chatDiv.scrollHeight - prevHeight;
    } 
    catch (err) {
      console.error("Error fetching users:", err);
    } 
    finally {
      setLoading(false);
      console.log("Last ID after fetch:", lastId);
    }
  };

  useEffect(() => {
    fetchFriends();
    // eslint-disable-next-line
  }, []);

  const handleScroll = () => {
    const chatDiv = chatBoxRef.current;
    //console.log(chatDiv.scrollHeight, chatDiv.scrollTop, chatDiv.clientHeight);
    if (chatDiv.scrollHeight - chatDiv.scrollTop - chatDiv.clientHeight < 10) fetchFriends();
    console.log("scrolled");
  };
    // eslint-disable-next-line

  return (
  <div 
    className="max-w-md mx-auto p-4 bg-white shadow rounded-lg">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold">Friends {sender_id}</h2>
      <button 
        onClick={handleLogout} 
        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
    <div
      ref={chatBoxRef}
      onScroll={handleScroll}
      className="h-64 overflow-y-auto border p-4"
    >
    <ul className="space-y-2">
      {friends.map(user => (
        <li key={user.id}>
          <Link 
            to={`/message/${user.id}`} 
            className="block px-3 py-2 rounded bg-gray-100 hover:bg-gray-200"
          >
            {user.username}
          </Link>
        </li>
      ))}
    </ul>
    {loading && (
      <p className="text-blue-500 text-sm mt-4">Loading more friends...</p>
    )}
    {!hasMore && (
      <p className="text-gray-400 text-sm mt-4">No more friends to load.</p>
    )}
    <div ref={BottomRef}/>
    </div>
  </div>
  );
}
