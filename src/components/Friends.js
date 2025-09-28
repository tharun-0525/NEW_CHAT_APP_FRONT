import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
const API_URL = process.env.REACT_APP_API_URL;

export default function FriendsList() {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastId, setLastId] = useState(null);

  const token = localStorage.getItem("token");
  const sender_id = jwtDecode(token).user_id;
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/")
  }

  const fetchFriends = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const res = await axios.get(
        `${API_URL}/users`, 
        {
        params: { after_id: lastId, limit: 10 }, 
        headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (res.data.length === 0) {
        setHasMore(false);
      } 
      else {
        setFriends(prevFriends => {
      // Filter out duplicates before appending
        const newFriends = res.data.filter(
          user => !prevFriends.some(f => f.id === user.id)
        );
        return [...prevFriends, ...newFriends];
        });
        setLastId(res.data[res.data.length-1].id);
      }
    } 
    catch (err) {
      console.error("Error fetching users:", err);
    } 
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 20 &&
        !loading &&
        hasMore
      ) {
        fetchFriends();
      }
    };
    console.log(window.innerHeight, window.scrollY, document.body.offsetHeight);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
    // eslint-disable-next-line
  }, [loading, hasMore, lastId]);

  return (
<div className="max-w-md mx-auto p-4 bg-white shadow rounded-lg">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-bold">Friends {sender_id}</h2>
    <button 
      onClick={handleLogout} 
      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
    >
      Logout
    </button>
  </div>

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
</div>
  );
}
