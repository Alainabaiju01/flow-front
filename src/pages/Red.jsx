// src/pages/Red.jsx
import React, { useEffect, useState } from "react";
import { getReadAPI, deleteReadAPI, updateReadAPI } from "../services/allAPI";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

export default function Red() {
  const [reads, setReads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [reviewDraft, setReviewDraft] = useState("");
  const [savingReviewId, setSavingReviewId] = useState(null);

  useEffect(() => {
    fetchReads();
  }, []);

  async function fetchReads() {
    setLoading(true);
    try {
      const data = await getReadAPI();
      setReads(data);

    } catch (err) {
      console.error("Failed to fetch read books:", err);

      setReads([]);
    } finally {
      setLoading(false);
    }
  }

  // Delete a read item permanently
  async function handleDelete(id, title) {
    if (!window.confirm(`Delete "${title}" permanently?`)) return;
    try {
      // Mark which book is currently being processed
      setProcessingId(id);
      await deleteReadAPI(id);
      setReads((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Could not delete. Check console.");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleSaveReview(id) {
    const trimmed = (reviewDraft || "").trim();
    try {
      setSavingReviewId(id);
      const patched = await updateReadAPI(id, { review: trimmed });
      setReads(prev => prev.map(r => r.id === id ? (patched || { ...r, review: trimmed }) : r));
      setEditingId(null);
      setReviewDraft("");
    } catch (err) {
      console.error("Save review failed:", err);
      alert("Could not save review.");
    } finally {
      setSavingReviewId(null);
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
          padding: 20,
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <h2 style={{ margin: 0, marginBottom: 12, color: "#fff" }}>Read Books</h2>

        {loading ? (
          <div style={{ padding: 12, color: "#fff" }}>Loading...</div>
        ) : reads.length === 0 ? (
          <div style={{ padding: 12, color: "#fff" }}>No read books yet.</div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 20,
              marginTop: 8,
            }}
          >
            {reads.map((book) => (
              <div
                key={book.id}
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
                  height: 470,
                  width: 250,
                  boxSizing: "border-box",
                  overflow: "hidden",
                }}
              >
                <div>
                  <img
                    src={book.thumbnail || "https://via.placeholder.com/140x200?text=No+Cover"}
                    alt={book.title}
                    style={{
                      width: "100%",
                      height: 170,
                      objectFit: "cover",
                      borderRadius: 8,
                      marginBottom: 8,
                    }}
                  />

                  <div style={{ fontWeight: 700, fontSize: 15 }}>
                    {book.title.split(" ").slice(0, 8).join(" ")}
                  </div>
                  <div style={{
                    background: "transparent",
                    border: "none",
                    cursor: processingId === book.id ? "default" : "pointer",
                    color: "#080505ff",
                    fontSize: 20,
                    marginTop: 10,
                  }} onClick={() => handleDelete(book.id, book.title)} disabled={processingId === book.id}><MdDelete /></div>
                  <div style={{ fontSize: 13, color: "#666" }}>
                    {(book.authors || []).join(", ") || "Unknown author"}
                  </div>

                  <div style={{ marginTop: 8, fontSize: 13, color: "#444" }}>
                    Finished on: {book.dateFinished}
                  </div>

                  <div style={{ marginTop: 10, fontSize: 15, color: "#333" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                      <div style={{ flex: 1, minHeight: 60 }}>
                        {book.review ? <div style={{ paddding: "20px", border: "solid", }}>{book.review}</div> : <em>No review yet</em>}
                      </div>
                      <div style={{ fontsize: "50px" }} className="d-flex align-items-center justify-content-center">
                        {editingId !== book.id && (

                          <button
                            onClick={() => { setEditingId(book.id); setReviewDraft(book.review || ""); }}

                            aria-label={`Edit review for ${book.title}`}
                          >
                            <FaEdit />
                          </button>
                        )}
                      </div>

                    </div>

                    {editingId === book.id && (
                      <div style={{ marginTop: 8, display: "flex" }}>
                        <input
                          value={reviewDraft}
                          onChange={(e) => setReviewDraft(e.target.value)}
                          placeholder="Write a review..."
                          style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #110404ff" }}
                        />

                        <button onClick={() => handleSaveReview(book.id)} disabled={savingReviewId === book.id}>
                          {savingReviewId === book.id ? "Saving..." : "Save"}
                        </button>


                      </div>

                    )}
                  </div>


                </div>


              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
