import { motion } from "framer-motion";

export default function LeaderboardRow({ user, rank, isCurrentUser, index = 0 }) {
  const medals = ["🥇", "🥈", "🥉"];
  const isPodium = rank <= 3;

  return (
    <motion.div
      className={`leaderboard-row ${isCurrentUser ? "current-user" : ""} ${isPodium ? "podium" : ""}`}
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      whileHover={{ scale: 1.02, x: 4 }}
    >
      <div className="lb-rank">
        {isPodium ? (
          <span className="lb-medal">{medals[rank - 1]}</span>
        ) : (
          <span className="lb-rank-num">#{rank}</span>
        )}
      </div>
      <div className="lb-avatar">{user.avatar}</div>
      <div className="lb-info">
        <span className="lb-name">
          {user.name}
          {isCurrentUser && <span className="lb-you-badge">YOU</span>}
        </span>
        <span className="lb-co2">{(user.co2 || 0).toFixed(1)} kg CO₂ saved</span>
      </div>
      <div className="lb-points">
        <span className="lb-points-value">{user.points.toLocaleString()}</span>
        <span className="lb-points-label">pts</span>
      </div>
    </motion.div>
  );
}
