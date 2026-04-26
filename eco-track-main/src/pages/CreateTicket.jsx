import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { ticketAPI } from "../utils/api";
import { showToast } from "../components/Toast";
import GlassCard from "../components/GlassCard";
import { pageVariants } from "../utils/animations";
import { AlertTriangle, MapPin, Hash, FileText, Upload, ArrowLeft } from "lucide-react";

const DEPARTMENTS = ["CSE", "Mechanical", "Electrical", "Civil", "Hostel", "Mess", "Library", "Other"];

export default function CreateTicket() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "", department: user?.department || "CSE", location: "", roomNumber: "", description: "", priority: "medium",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) {
      showToast("Title and description are required!", "error");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (imageFile) formData.append("image", imageFile);

      await ticketAPI.create(formData);
      showToast("🎟️ Ticket submitted! +5 bonus points!", "success");
      navigate("/tickets");
    } catch (err) {
      showToast("Error submitting ticket", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = { width: "100%", padding: "0.85rem", borderRadius: 12, border: "1px solid var(--card-border, #e5e7eb)", background: "var(--bg-secondary, #f0fdf4)", color: "var(--text-primary)", fontSize: "1rem", outline: "none" };
  const labelStyle = { display: "block", marginBottom: "0.4rem", fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-secondary)" };

  return (
    <motion.div className="page" variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{ padding: 20, maxWidth: 700, margin: "0 auto" }}>
      <button onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "var(--primary)", fontWeight: 600, cursor: "pointer", marginBottom: "1rem", fontSize: "0.95rem" }}>
        <ArrowLeft size={18} /> Back
      </button>

      <h1 className="page-title">🛑 Report Campus Issue</h1>
      <p className="page-subtitle" style={{ marginBottom: "1.5rem" }}>Help improve our campus by reporting problems</p>

      <GlassCard style={{ padding: "1.5rem" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          <div>
            <label style={labelStyle}><FileText size={14} style={{ marginRight: 4, verticalAlign: "middle" }} /> Issue Title</label>
            <input style={inputStyle} placeholder="e.g. Broken light in corridor" value={form.title} onChange={(e) => update("title", e.target.value)} maxLength={80} />
            <div style={{ textAlign: "right", fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: 4 }}>{form.title.length}/80</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Department</label>
              <select style={inputStyle} value={form.department} onChange={(e) => update("department", e.target.value)}>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Priority</label>
              <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                {["low", "medium", "high"].map((p) => (
                  <button key={p} type="button" onClick={() => update("priority", p)} style={{ flex: 1, padding: "10px 6px", borderRadius: 10, border: form.priority === p ? "2px solid var(--primary)" : "1px solid var(--card-border, #e5e7eb)", background: form.priority === p ? "rgba(124,58,237,0.08)" : "transparent", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", color: p === "high" ? "#EF4444" : p === "medium" ? "#F59E0B" : "#6B7280", textTransform: "capitalize" }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}><MapPin size={14} style={{ marginRight: 4, verticalAlign: "middle" }} /> Location / Block</label>
              <input style={inputStyle} placeholder="Block A, North Wing" value={form.location} onChange={(e) => update("location", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}><Hash size={14} style={{ marginRight: 4, verticalAlign: "middle" }} /> Room Number</label>
              <input style={inputStyle} placeholder="101" value={form.roomNumber} onChange={(e) => update("roomNumber", e.target.value)} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...inputStyle, minHeight: 120, resize: "vertical" }} placeholder="Describe the issue in detail..." value={form.description} onChange={(e) => update("description", e.target.value)} maxLength={500} />
            <div style={{ textAlign: "right", fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: 4 }}>{form.description.length}/500</div>
          </div>

          <div>
            <label style={labelStyle}><Upload size={14} style={{ marginRight: 4, verticalAlign: "middle" }} /> Upload Photo (Optional)</label>
            <div style={{ border: "2px dashed var(--card-border, #e5e7eb)", borderRadius: 12, padding: "1.5rem", textAlign: "center", cursor: "pointer", position: "relative" }} onClick={() => document.getElementById("ticket-image").click()}>
              <input type="file" id="ticket-image" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
              {imagePreview ? (
                <div>
                  <img src={imagePreview} alt="Preview" style={{ maxHeight: 150, borderRadius: 8, marginBottom: 8 }} />
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Click to change</p>
                </div>
              ) : (
                <div>
                  <Upload size={32} style={{ color: "var(--text-secondary)", marginBottom: 8 }} />
                  <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Click or drag to upload an image</p>
                </div>
              )}
            </div>
          </div>

          <motion.button type="submit" disabled={submitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} style={{ background: "linear-gradient(135deg, #7C3AED, #10B981)", color: "white", padding: "14px 28px", borderRadius: 14, fontWeight: 700, border: "none", fontSize: "1.05rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {submitting ? "Submitting..." : <><AlertTriangle size={18} /> Submit Issue</>}
          </motion.button>
        </form>
      </GlassCard>
    </motion.div>
  );
}
