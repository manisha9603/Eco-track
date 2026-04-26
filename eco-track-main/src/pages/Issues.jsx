import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { showToast } from "../components/Toast";
import GlassCard from "../components/GlassCard";
import Loader from "../components/Loader";
import { CopyPlus, AlertTriangle, CheckCircle, Image as ImageIcon } from "lucide-react";

export default function Issues({ ecoData }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [block, setBlock] = useState("Academic");
  const [room, setRoom] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = () => {
    fetch("/api/tickets")
      .then(res => res.json())
      .then(data => {
        setTickets(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setTickets([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!room || !description) {
      showToast("Room and description are required!", "error");
      return;
    }
    setSubmitting(true);
    
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          block,
          room,
          description,
          image,
          userId: ecoData.data?.userId,
          userName: ecoData.user
        })
      });
      if (res.ok) {
        showToast("Issue reported successfully! +10 pts", "success");
        setBlock("Academic");
        setRoom("");
        setDescription("");
        setImage("");
        fetchTickets();
        // Give local points immediately for hackathon demo
        ecoData.logActivity("issue_report", 1); 
      }
    } catch (err) {
      showToast("Error reporting issue", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div 
      className="page issues-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{ padding: "20px" }}
    >
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <h1 className="page-title">🛑 Report an Issue</h1>
        <p className="page-subtitle">Help improve our campus by reporting problems like broken lights, leaking pipes, etc.</p>
      </div>

      <GlassCard style={{ marginBottom: "2rem", padding: "1.5rem" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display:"block", marginBottom:"0.5rem" }}>Block / Building</label>
            <select value={block} onChange={(e) => setBlock(e.target.value)} style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--card-border)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}>
              <option>Academic</option>
              <option>Hostel</option>
              <option>Mess</option>
              <option>Sports Complex</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label style={{ display:"block", marginBottom:"0.5rem" }}>Room / Location</label>
            <input type="text" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="e.g. EC-101 or North Wing Bathroom" style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--card-border)", background: "var(--bg-secondary)", color: "var(--text-primary)" }} />
          </div>
          <div>
            <label style={{ display:"block", marginBottom:"0.5rem" }}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the issue... (e.g., Tap is leaking non-stop)" rows="4" style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--card-border)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}></textarea>
          </div>
          <div>
            <label style={{ display:"block", marginBottom:"0.5rem" }}>Photo proof (Optional)</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ width: "100%", padding: "0.5rem" }} />
            {image && <img src={image} alt="Preview" style={{ marginTop: "1rem", maxHeight: "150px", borderRadius: "8px" }} />}
          </div>
          <button type="submit" disabled={submitting} style={{ background: "var(--primary)", color: "white", padding: "1rem", borderRadius: "8px", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
            {submitting ? <Loader size={20} /> : <><AlertTriangle size={18} /> Submit Issue</>}
          </button>
        </form>
      </GlassCard>

      <h2 style={{ marginBottom: "1rem" }}>Campus Issues Feed</h2>
      {loading ? <Loader /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {tickets.length === 0 ? <p style={{ color: "var(--text-muted)", textAlign: "center" }}>No active issues! 🎉</p> : null}
          {tickets.map(ticket => (
            <GlassCard key={ticket._id} style={{ padding: "1rem", position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <strong>{ticket.block} - {ticket.room}</strong>
                <span style={{ 
                  background: ticket.status === 'Resolved' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', 
                  color: ticket.status === 'Resolved' ? 'var(--secondary)' : '#F59E0B', 
                  padding: "4px 8px", 
                  borderRadius: "100px", 
                  fontSize: "0.8rem", 
                  fontWeight: "bold" 
                }}>
                  {ticket.status}
                </span>
              </div>
              <p style={{ color: "var(--text-secondary)", marginBottom: "0.5rem" }}>{ticket.description}</p>
              {ticket.image && <img src={ticket.image} alt="Issue" style={{ width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: "8px", marginBottom: "0.5rem" }} />}
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Reported by {ticket.authorName}</span>
            </GlassCard>
          ))}
        </div>
      )}
    </motion.div>
  );
}
