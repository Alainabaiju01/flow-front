// src/pages/Wish.jsx
import { useState, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { MdDelete } from "react-icons/md";
import { getWishlistAPI, addWishlistAPI, removeWishlistAPI } from "../services/allAPI";

export default function Wish() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [addingId, setAddingId] = useState(null);
  const [processingId, setProcessingId] = useState(null); // single-button loading

  useEffect(() => {
    fetchWishlist();
  }, []);

  const  fetchWishlist =  async  ()=> {
    try {
      const data = await getWishlistAPI(); // gets the data from db
      setWishlist(data);
    } catch (err) {
      console.error("Failed to load wishlist:", err);
      setWishlist([]);
    }
  }

  const fetchApi = async () => {
    if (!query.trim()) return;
    // if user gives an input
    setLoading(true);
    // to clear previous search results
    setResults([]); 

    try {
      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        query
      )}&maxResults=10`;
      const res = await fetch(url);
      const json = await res.json();
      setResults(json.items || []);
    } catch (err) {
      console.error("Error searching:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add book to wishlist
  const addToWishlist = async (book) => {
    const info = book.volumeInfo || {};

    const payload = {
      googleId: book.id,
      title: info.title,
      authors: info.authors || [],
      thumbnail: info.imageLinks?.thumbnail || "",
    };

    if (wishlist.some((w) => w.googleId === payload.googleId)) {
      return alert("Already in wishlist");
    }

    try {
      setAddingId(book.id);
      const saved = await addWishlistAPI(payload); // returns saved object
      setWishlist((prev) => [...prev, saved]);
      setResults([]); // Close dropdown
      setQuery("");
    } catch (err) {
      console.error("Add failed:", err);
      alert("Add to wishlist failed. See console.");
    } finally {
      setAddingId(null);
    }
  };
  // Delete a wishlist item permanently
  async function handleDelete(id, title) {
    if (!window.confirm(`Delete "${title}" permanently?`)) return;
    try {
      setProcessingId(id);
      await removeWishlistAPI(id);
      // update wishlist state (not reads)
      setWishlist((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Could not delete. Check console.");
    } finally {
      setProcessingId(null);
    }
  }


  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* Blurred background (only background layer is blurred) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "url('https://t3.ftcdn.net/jpg/08/15/90/80/360_F_815908053_Mfy2DJfv1iFSdL6ET9pRD5R5VzOOEu5k.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "blur(6px)",
          transform: "scale(1.03)",
          zIndex: 0,
        }}
      />

      {/* Optional overlay to darken blurred bg slightly */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.18)",
          zIndex: 1,
        }}
      />

      {/* Content (not blurred) */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          padding:"40px 20px",
          width: "100%",
           justifyContent: "center",
          alignItems: "flex-start",
        }}
      >

        {/* Centered search area (keeps search bar centered within a narrower column) */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>

          <div style={{ width: "min(900px, 100%)", position: "relative" }}>
           <h2 style={{ margin: 0, marginBottom: 12, color: "#fff" }}>Add Books to Wishlist</h2>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #ccc",
                borderRadius: 8,
                padding: "6px 10px",
                gap: 10,
                background: "#fff",
              }}
            >
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchApi()}
                placeholder="Search Google Books..."
                style={{
                  border: "none",
                  outline: "none",
                  flex: 1,
                  fontSize: 16,
                }}
              />
              <CiSearch size={24} style={{ cursor: "pointer" }} onClick={fetchApi} />
            </div>

            {results.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: 46,
                  left: 0,
                  width: "100%",
                  background: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  maxHeight: 300,
                  overflowY: "auto",
                  zIndex: 30,
                  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                }}
              >
                {/* When loading is true, it means the app is currently fetching data. */}
                {loading && <div style={{ padding: 10 }}>Searching...</div>}
                {results.map((book) => {
                  const info = book.volumeInfo || {};
                  return (
                    <div
                      key={book.id}
                      onClick={() => addToWishlist(book)}
                      style={{
                        padding: 10,
                        borderBottom: "1px solid #eee",
                        display: "flex",
                        gap: 10,
                        cursor: "pointer",
                        background: addingId === book.id ? "#e8ffe8" : "#fff",
                      }}
                    >
                      <img
                        src={info.imageLinks?.thumbnail || "https://via.placeholder.com/50x75?text=No"}
                        alt=""
                        style={{ width: 45, height: 65, objectFit: "cover", borderRadius: 4 }}
                      />
                      <div>
                        <div style={{ fontWeight: 600 }}>{info.title}</div>
                        <div style={{ fontSize: 12, color: "#555" }}>
                          {info.authors?.join(", ") || "Unknown"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <h3 style={{ marginTop: 6, marginBottom: 12, color: "#fff" }}>Your Wishlist ({wishlist.length})</h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 25,
            justifyContent: "start",
            alignItems: "start",
          }}
        >
          {wishlist.map((w) => (
            <div
              key={w.id}
              style={{
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: 12,
                padding: 14,
                textAlign: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: 390,              
                boxSizing: "border-box",
                overflow: "hidden",
              }}
            >
              <img
                src={w.thumbnail || "https://via.placeholder.com/140x200?text=No+Cover"}
                alt={w.title}
                style={{
                  width: "100%",
                  height: 170,
                  objectFit: "cover",
                  borderRadius: 8,
                }}
              />

              <div style={{ fontWeight: 600, marginTop: 12, fontSize: 15 }}>{w.title}</div>

              <div style={{ fontSize: 13, color: "#666" }}>
                {w.authors?.join(", ") || "Unknown author"}
              </div>
              <button
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: processingId === w.id ? "default" : "pointer",
                  color: "#080505ff",
                  fontSize: 20,
                  marginTop: 10,
                }}
                onClick={() => handleDelete(w.id, w.title)}
                disabled={processingId === w.id}
                aria-label={`Delete ${w.title}`}

              >
                <MdDelete />
              </button>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
