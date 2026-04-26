import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { taskAPI } from "../utils/api";
import { showToast } from "../components/Toast";
import GlassCard from "../components/GlassCard";
import Loader from "../components/Loader";
import { pageVariants, staggerContainer, staggerItem } from "../utils/animations";
import confetti from "canvas-confetti";
import { CheckCircle, Upload, Wrench } from "lucide-react";

const DEPARTMENTS = ["CSE", "Mechanical", "Electrical", "Civil", "Hostel", "Mess", "Library", "Other"];

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", problem: "", solution: "", department: user?.department || "CSE" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      const res = await taskAPI.getAll();
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch { setTasks([]); }
    finally { setLoading(false); }
  };

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.solution) {
      showToast("Title and solution are required!", "error");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (imageFile) formData.append("image", imageFile);

      await taskAPI.create(formData);
      confetti({ particleCount: 150, spread: 80, colors: ["#10B981", "#34D399", "#F59E0B"] });
      showToast(`🦸 Hero! Problem solved! +${imageFile ? 60 : 40} pts`, "success");
      setForm({ title: "", problem: "", solution: "", department: user?.department || "CSE" });
      setImageFile(null);
      setImagePreview(null);
      setShowForm(false);
      fetchTasks();
    } catch {
      showToast("Error submitting solution", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = { width: "100%", padding: "0.85rem", borderRadius: 12, border: "1px solid var(--card-border, #e5e7eb)", background: "var(--bg-secondary, #f0fdf4)", color: "var(--text-primary)", fontSize: "1rem", outline: "none" };
  const labelStyle = { display: "block", marginBottom: "0.4rem", fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-secondary)" };

  return (
    <motion.div className="page" variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 className="page-title">✅ Solved Problems</h1>
          <p className="page-subtitle">Log problems you've personally fixed on campus</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowForm(!showForm)} style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--secondary, #10B981)", color: "white", padding: "12px 24px", borderRadius: 14, fontWeight: 600, border: "none", cursor: "pointer", fontSize: "0.95rem" }}>
          <Wrench size={18} /> {showForm ? "Cancel" : "I Solved Something!"}
        </motion.button>
      </div>

      {showForm && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} style={{ marginBottom: "2rem" }}>
          <GlassCard style={{ padding: "1.5rem", border: "2px solid var(--secondary, #10B981)" }}>
            <h3 style={{ color: "var(--secondary)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: 8 }}><CheckCircle size={20} /> Submit Your Solution</h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>What did you solve?</label>
                <input style={inputStyle} placeholder="e.g. Fixed leaking tap in Hostel B" value={form.title} onChange={(e) => update("title", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>What was the problem?</label>
                <textarea style={{ ...inputStyle, minHeight: 80 }} placeholder="Describe the issue..." value={form.problem} onChange={(e) => update("problem", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>How did you solve it?</label>
                <textarea style={{ ...inputStyle, minHeight: 80 }} placeholder="Describe your solution..." value={form.solution} onChange={(e) => update("solution", e.target.value)} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Department</label>
                  <select style={inputStyle} value={form.department} onChange={(e) => update("department", e.target.value)}>
                    {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}><Upload size={14} style={{ marginRight: 4, verticalAlign: "middle" }} /> Proof Photo (+20 pts bonus!)</label>
                  <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } }} style={{ width: "100%", padding: "0.5rem" }} />
                </div>
              </div>
              {imagePreview && <img src={imagePreview} alt="Preview" style={{ maxHeight: 150, borderRadius: 8 }} />}
              <motion.button type="submit" disabled={submitting} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} style={{ background: "var(--secondary, #10B981)", color: "white", padding: "14px", borderRadius: 14, fontWeight: 700, border: "none", cursor: "pointer", fontSize: "1rem" }}>
                {submitting ? "Submitting..." : `Submit Solution (+${imageFile ? 60 : 40} pts)`}
              </motion.button>
            </form>
          </GlassCard>
        </motion.div>
      )}

      <h2 style={{ marginBottom: "1rem" }}>🏆 Hall of Fame</h2>
      {loading ? <Loader /> : tasks.length === 0 ? (
        <GlassCard style={{ padding: "3rem", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🛠️</div>
          <h3>Spot a problem? Be the solution!</h3>
          <p style={{ color: "var(--text-secondary)" }}>No tasks solved yet. Be the first campus hero!</p>
        </GlassCard>
      ) : (
        <motion.div variants={staggerContainer} initial="initial" animate="animate" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {tasks.map((task) => (
            <motion.div key={task._id} variants={staggerItem}>
              <GlassCard style={{ padding: "1.2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <h3 style={{ color: "var(--secondary, #10B981)", fontWeight: 700 }}>{task.title}</h3>
                  <span style={{ background: "rgba(124,58,237,0.1)", color: "var(--primary)", padding: "4px 12px", borderRadius: 100, fontSize: "0.8rem", fontWeight: 700 }}>+{task.pointsAwarded} pts</span>
                </div>
                {task.problem && <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: 6 }}><strong>Problem:</strong> {task.problem}</p>}
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: 8 }}><strong>Solution:</strong> {task.solution}</p>
                {task.image && <img src={`http://localhost:5000${task.image}`} alt="Proof" style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 12, marginBottom: 8 }} />}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  <span>Solved by <strong>{task.userName}</strong></span>
                  <span style={{ background: task.status === "verified" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)", color: task.status === "verified" ? "#10B981" : "#F59E0B", padding: "2px 8px", borderRadius: 100, fontWeight: 600 }}>{task.status}</span>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
