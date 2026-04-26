import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import LeaderboardRow from "../components/LeaderboardRow";
import GlassCard from "../components/GlassCard";
import { FAKE_USERS } from "../utils/constants";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20 },
};

export default function Leaderboard({ ecoData }) {
  const { user, avatar, points, totalCO2 } = ecoData;
  const [tab, setTab] = useState("all");

  const [apiUsers, setApiUsers] = useState([]);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => setApiUsers(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error("Could not fetch leaderboard", err);
        setApiUsers([]);
      });
  }, []);

  const allUsers = useMemo(() => {
    // Merge real current user if not in apiUsers or just use apiUsers 
    // Actually our api returns all users. The current user is in `apiUsers`.
    // Let's identify the current user using ecoData.userId
    let list = (Array.isArray(apiUsers) ? apiUsers : []).map(u => ({
      name: u.name,
      avatar: u.avatar || "🌿",
      points: u.points,
      co2: u.co2Saved || 0,
      isCurrentUser: u._id === ecoData.data?.userId
    }));

    // Fallback if empty API (e.g. offline)
    if (list.length === 0) {
      list = [...FAKE_USERS, { name: user, avatar, points, co2: totalCO2, isCurrentUser: true }];
    }

    if (tab === "weekly") {
      // Simulate weekly points as fraction of total
      list = list.map(u => ({
        ...u,
        points: Math.round(u.points * (0.1 + Math.random() * 0.2)),
        co2: parseFloat((u.co2 * (0.1 + Math.random() * 0.2)).toFixed(1)),
      }));
    }

    list.sort((a, b) => b.points - a.points);
    return list;
  }, [apiUsers, user, avatar, points, totalCO2, tab, ecoData.data?.userId]);

  const userRank = allUsers.findIndex((u) => u.isCurrentUser) + 1;

  return (
    <motion.div className="page leaderboard-page" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="page-header">
        <h1 className="page-title">🏆 Leaderboard</h1>
        <p className="page-subtitle">Compete. Contribute. Change the planet.</p>
      </div>

      {/* Tabs */}
      <div className="lb-tabs">
        <button className={`lb-tab ${tab === "weekly" ? "active" : ""}`} onClick={() => setTab("weekly")}>
          Weekly
        </button>
        <button className={`lb-tab ${tab === "all" ? "active" : ""}`} onClick={() => setTab("all")}>
          All Time
        </button>
      </div>

      {/* Your Rank */}
      <GlassCard className="lb-your-rank" glowColor="0 0 20px rgba(124,58,237,0.3)">
        <span className="lb-your-rank-label">Your Rank</span>
        <span className="lb-your-rank-num">#{userRank}</span>
        <span className="lb-your-rank-pts">{(tab === "weekly" ? Math.round(points * 0.3) : points).toLocaleString()} pts</span>
      </GlassCard>

      {/* Podium - Top 3 */}
      <div className="podium-section">
        {allUsers.slice(0, 3).map((u, i) => (
          <motion.div
            key={u.name + i}
            className={`podium-card podium-${i + 1} ${u.isCurrentUser ? "current-user" : ""}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
          >
            <span className="podium-medal">{["🥇", "🥈", "🥉"][i]}</span>
            <span className="podium-avatar">{u.avatar}</span>
            <span className="podium-name">{u.name}{u.isCurrentUser ? " (You)" : ""}</span>
            <span className="podium-points">{u.points.toLocaleString()} pts</span>
          </motion.div>
        ))}
      </div>

      {/* Remaining Rows */}
      <div className="lb-list">
        {allUsers.slice(3).map((u, i) => (
          <LeaderboardRow
            key={u.name + i}
            user={u}
            rank={i + 4}
            isCurrentUser={u.isCurrentUser || false}
            index={i}
          />
        ))}
      </div>
    </motion.div>
  );
}
