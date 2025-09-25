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
    <div>
      <h2>Friends {sender_id}</h2>
      <button onClick={handleLogout}>Logout</button>
      <ul>
        {friends.map(user => (
          <li key={user.id}>
            <Link to={`/message/${user.id}`}>
              {user.username}
            </Link>
          </li>
        ))}
      </ul>
      {loading && <p>Loading more friends...</p>}
      {!hasMore && <p>No more friends to load.</p>}
    </div>
  );
}
