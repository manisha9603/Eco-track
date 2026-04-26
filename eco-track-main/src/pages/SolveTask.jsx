import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { showToast } from "../components/Toast";
import GlassCard from "../components/GlassCard";
import Loader from "../components/Loader";
import confetti from "canvas-confetti";
import { CheckCircle } from "lucide-react";

export default function SolveTask({ ecoData }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [title, setTitle] = useState("");
  const [solution, setSolution] = useState("");
  const [image, setImage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = () => {
    fetch("/api/tasks")
      .then(res => res.json())
      .then(data => {
        setTasks(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setTasks([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTasks();
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
    if (!title || !solution) {
      showToast("Title and solution are required!", "error");
      return;
    }
    setSubmitting(true);
    
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          solution,
          image,
          userId: ecoData.data?.userId,
          userName: ecoData.user
        })
      });
      if (res.ok) {
        confetti({ particleCount: 150, spread: 80, colors: ["#10B981", "#34D399", "#F59E0B"] });
        showToast("Hero! You solved a problem! +50 pts", "success");
        setTitle("");
        setSolution("");
        setImage("");
        fetchTasks();
        // Give local points immediately for hackathon demo
        ecoData.logActivity("task_solve", 1); 
      }
    } catch (err) {
      showToast("Error submitting solution", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div 
      className="page tasks-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{ padding: "20px" }}
    >
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <h1 className="page-title">✅ Problem Solved</h1>
        <p className="page-subtitle">Took initiative and fixed a problem yourself? Log it here for massive points and badjes!</p>
      </div>

      <GlassCard style={{ marginBottom: "2rem", padding: "1.5rem", border: "2px solid var(--secondary)" }}>
        <h3 style={{ marginBottom: "1rem", color: "var(--secondary)", display: "flex", alignItems: "center", gap: "8px" }}><CheckCircle /> I Solved A Problem</h3>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display:"block", marginBottom:"0.5rem" }}>What did you solve? (Title)</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Fixed leaking tap in Hostel Block B" style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--card-border)", background: "var(--bg-secondary)", color: "var(--text-primary)" }} />
          </div>
          <div>
            <label style={{ display:"block", marginBottom:"0.5rem" }}>How did you solve it?</label>
            <textarea value={solution} onChange={(e) => setSolution(e.target.value)} placeholder="e.g. I tightened the valve and informed the plumber..." rows="3" style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--card-border)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}></textarea>
          </div>
          <div>
            <label style={{ display:"block", marginBottom:"0.5rem" }}>Proof Photo (Optional)</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ width: "100%", padding: "0.5rem" }} />
            {image && <img src={image} alt="Preview" style={{ marginTop: "1rem", maxHeight: "150px", borderRadius: "8px" }} />}
          </div>
          <button type="submit" disabled={submitting} style={{ background: "var(--secondary)", color: "white", padding: "1rem", borderRadius: "8px", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
            {submitting ? <Loader size={20} /> : "Submit Solution"}
          </button>
        </form>
      </GlassCard>

      <h2 style={{ marginBottom: "1rem" }}>Hall of Fame (Solved Problems)</h2>
      {loading ? <Loader /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {tasks.length === 0 ? <p style={{ color: "var(--text-muted)", textAlign: "center" }}>No tasks solved yet. Be the first!</p> : null}
          {tasks.map(task => (
            <GlassCard key={task._id} style={{ padding: "1rem", position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <strong style={{ color: "var(--secondary)" }}>{task.title}</strong>
                <span style={{ 
                  background: 'rgba(124,58,237,0.1)', 
                  color: 'var(--primary)', 
                  padding: "4px 8px", 
                  borderRadius: "100px", 
                  fontSize: "0.8rem", 
                  fontWeight: "bold" 
                }}>
                  +{task.pointsEarned} pts
                </span>
              </div>
              <p style={{ color: "var(--text-secondary)", marginBottom: "0.5rem" }}>{task.solution}</p>
              {task.image && <img src={task.image} alt="Solved" style={{ width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: "8px", marginBottom: "0.5rem" }} />}
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Solved by hero: <strong>{task.userName}</strong></span>
            </GlassCard>
          ))}
        </div>
      )}
    </motion.div>
  );
}
