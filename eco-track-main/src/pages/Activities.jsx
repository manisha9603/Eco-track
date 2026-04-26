import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ActivityCard from "../components/ActivityCard";
import Loader from "../components/Loader";
import { showToast } from "../components/Toast";
import { ACTIVITIES, CATEGORIES } from "../utils/constants";
import confetti from "canvas-confetti";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20 },
};

export default function Activities({ ecoData }) {
  const { logActivity, dailyCount } = ecoData;
  const [category, setCategory] = useState("All");
  const [selectedId, setSelectedId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const filtered = category === "All"
    ? ACTIVITIES
    : ACTIVITIES.filter((a) => a.category === category);

  const selectedActivity = ACTIVITIES.find((a) => a.id === selectedId);

  const handleSubmit = useCallback(async () => {
    if (!selectedId) {
      showToast("Please select an activity", "warning");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));

    const result = logActivity(selectedId, quantity);
    setSubmitting(false);

    if (result.success) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.7 },
        colors: ["#7C3AED", "#10B981", "#34D399", "#F59E0B"],
      });
      showToast(result.message, "success");
      setSelectedId(null);
      setQuantity(1);
    } else {
      showToast(result.message, "error");
    }
  }, [selectedId, quantity, logActivity]);

  return (
    <motion.div className="page activities-page" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="page-header">
        <h1 className="page-title">Log Activity</h1>
        <p className="page-subtitle">
          {dailyCount >= 3
            ? "Daily limit reached! Come back tomorrow 🌙"
            : `${3 - dailyCount} activities remaining today`}
        </p>
      </div>

      {/* Category Filter */}
      <div className="category-tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`cat-tab ${category === cat ? "active" : ""}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Activity Grid */}
      <motion.div
        className="activity-grid"
        initial="initial"
        animate="animate"
        variants={{ animate: { transition: { staggerChildren: 0.06 } } }}
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((act) => (
            <motion.div
              key={act.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              layout
            >
              <ActivityCard
                activity={act}
                selected={selectedId === act.id}
                onSelect={setSelectedId}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Submit Panel */}
      <AnimatePresence>
        {selectedActivity && (
          <motion.div
            className="submit-panel"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
          >
            <div className="submit-panel-inner">
              <div className="submit-info">
                <span className="submit-icon">{selectedActivity.icon}</span>
                <div>
                  <h3>{selectedActivity.name}</h3>
                  <p>
                    +{selectedActivity.points * quantity} pts · -{(selectedActivity.co2 * quantity).toFixed(1)} kg CO₂
                  </p>
                </div>
              </div>

              <div className="submit-controls">
                <div className="quantity-input">
                  <label htmlFor="qty-input">Qty ({selectedActivity.unit})</label>
                  <input
                    id="qty-input"
                    type="number"
                    min={1}
                    max={10}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(10, Number(e.target.value))))}
                  />
                </div>
                <motion.button
                  className="submit-btn"
                  onClick={handleSubmit}
                  disabled={submitting}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {submitting ? <Loader size={24} /> : "Submit Activity"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
