// src/pages/Stillreading.jsx
import { useEffect, useState, useRef } from "react";
import { CiSearch } from "react-icons/ci";


import {
  addStillReadingAPI,
  getStillReadingAPI,
  updateStillReadingAPI,
  removeStillReadingAPI,
  addReadAPI,
} from "../services/allAPI";

export default function Stillreading() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]); // Google search results
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [still, setStill] = useState([]); // items from stillreading
  const [addingId, setAddingId] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchStill();
  }, []);

  async function fetchStill() {
    try {
      const data = await getStillReadingAPI();
      setStill(data || []);
    } catch (err) {
      console.error("Fetch stillreading failed:", err);
      setStill([]);
    }
  }

  // Google Books search (dropdown results)
  async function fetchApi() {
    if (!query.trim()) return;
    setLoadingSearch(true);
    setResults([]);
    try {
      const q = encodeURIComponent(query.trim());
      const url = `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=12`;
      const res = await fetch(url);
      const json = await res.json();
      setResults(json.items || []);
    } catch (err) {
      console.error("Google Books error:", err);
      setResults([]);
    } finally {
      setLoadingSearch(false);
    }
  }

  // Add from search to stillreading with extra fields (ask for pageCount/pagesRead)
  async function handleAddFromSearch(book) {
    const info = book.volumeInfo || {};
    const pageCountRaw = prompt(
      "Enter total pages (leave blank if unknown):",
      info.pageCount || ""
    );
    const pageCount = pageCountRaw ? Number(pageCountRaw) : null;
    const pagesReadRaw = prompt("Enter pages already read (bookmark):", "0");
    const pagesRead = pagesReadRaw ? Number(pagesReadRaw) : 0;

    const payload = {
      googleId: book.id,
      title: info.title || "Untitled",
      authors: info.authors || [],
      thumbnail:
        info.imageLinks?.thumbnail?.replace("http://", "https://") || "",
      pageCount,
      pagesRead,
      review: "",
    };

    try {
      setAddingId(book.id);
      const saved = await addStillReadingAPI(payload); // uses your normal API helper
      setStill((p) => [...p, saved]);
      setResults([]);
      setQuery("");
    } catch (err) {
      console.error("Add to stillreading failed:", err);
      alert("Could not add. See console.");
    } finally {
      setAddingId(null);
    }
  }

  // (save bookmark)
  async function handleSaveProgress(itemId, updates) {
    try {
      setSavingId(itemId);
      const patched = await updateStillReadingAPI(itemId, updates);
      setStill((prev) => prev.map((it) => (it.id === itemId ? patched : it)));
    } catch (err) {
      console.error("Save progress failed:", err);
      alert("Could not save. See console.");
    } finally {
      setSavingId(null);
    }
  }

  // Mark as read: POST to read then DELETE from stillreading
  async function handleMarkAsRead(item) {
    if (!confirm(`Mark "${item.title}" as read and move to Read?`)) return;

    const finished = {
      title: item.title,
      authors: item.authors || [],
      thumbnail: item.thumbnail || "",
      pageCount: item.pageCount || null,
      pagesRead: item.pagesRead || 0,
      dateFinished: new Date().toISOString().slice(0, 10),
    };

    try {
      setSavingId(item.id);
      await addReadAPI(finished); // add to /read
      await removeStillReadingAPI(item.id); // delete from /stillreading
      setStill((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      console.error("Move to read failed:", err);
      alert("Could not move to Read. See console.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
  
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

      
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.18)",
          zIndex: 1,
        }}
      />

    
      <div
        style={{
          position: "relative",
          zIndex: 2,
          padding: "40px 20px",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <div style={{ padding: 20, width: "100%", boxSizing: "border-box" }}>


          <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>

            <div style={{ width: "min(900px, 100%)", position: "relative" }}>
              <h2 style={{ margin: 0, marginBottom: 12, color: "#fff" }}>Add to current list!</h2>

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
                    background: "transparent",
                  }}
                />
                <CiSearch size={24} style={{ cursor: "pointer" }} onClick={fetchApi} />
              </div>

              {results.length > 0 && (
                <div
                  ref={dropdownRef}
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
                  {loadingSearch && <div style={{ padding: 10 }}>Searching...</div>}
                  {results.map((book) => {
                    const info = book.volumeInfo || {};
                    return (
                      <div
                        key={book.id}
                        onClick={() => handleAddFromSearch(book)}
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
                        <div style={{ marginLeft: "auto", alignSelf: "center", color: "#666", fontSize: 13 }}>
                          {addingId === book.id ? "Adding..." : "Add"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <h3 style={{ marginTop: 6, marginBottom: 12, color: "#fff" }}>Your Still Reading ({still.length})</h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 25,
              justifyContent: "start",
              alignItems: "start",
            }}
          >
            {still.map((item) => (
              <div
                key={item.id}
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
                  src={item.thumbnail || "https://via.placeholder.com/140x200?text=No+Cover"}
                  alt={item.title}
                  style={{
                    width: "100%",
                    height: 170,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />

                <div style={{ fontWeight: 600, marginTop: 12, fontSize: 15 }}>{<div style={{ fontWeight: 700, fontSize: 15 }}>
                  {item.title.split(" ").slice(0, 8).join(" ")}
                </div>}</div>
                <div style={{ fontSize: 13, color: "#666" }}>{item.authors?.join(", ") || "Unknown author"}</div>

                <div style={{ marginTop: 10 }}>
                  <input
                    type="number"
                    min={0}
                    value={item.pagesRead ?? 0}
                    onChange={(e) => {
                      const val = e.target.value === "" ? "" : Number(e.target.value);
                      setStill((prev) => prev.map((i) => (i.id === item.id ? { ...i, pagesRead: val } : i)));
                    }}
                    style={{
                      width: 50,
                      padding: 6,
                      marginRight: 8,
                      borderRadius: 6,
                      border: "1px solid #ccc",
                    }}
                  />

                  <input
                    type="number"
                    min={0}
                    value={item.pageCount ?? ""}
                    onChange={(e) => {
                      const val = e.target.value === "" ? "" : Number(e.target.value);
                      setStill((prev) => prev.map((i) => (i.id === item.id ? { ...i, pageCount: val } : i)));
                    }}
                    style={{
                      width: 60,
                      padding: 6,
                      borderRadius: 6,
                      border: "1px solid #ccc",
                    }}
                  />

                  <button
                    onClick={() =>
                      handleSaveProgress(item.id, {
                        pagesRead: Number(item.pagesRead || 0),
                        pageCount: item.pageCount ? Number(item.pageCount) : null,
                      })
                    }
                    disabled={savingId === item.id}
                    style={{
                      padding: "6px 10px",
                      margin: 11,
                      background: "#1d1f1fff",
                      color: "#e4d4d4ff",
                      borderRadius: 6,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {savingId === item.id ? "Saving..." : "Save"}
                  </button>
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                  <input type="checkbox" onChange={(e) => e.target.checked && handleMarkAsRead(item)} />
                  <span style={{ fontSize: 14, color: "#555" }}>Mark as Read</span>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
