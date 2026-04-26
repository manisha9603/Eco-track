import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Zap,
  TrendingUp,
  Activity,
  Leaf,
  ArrowRight,
  Trophy,
  Gift,
  Flame,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import GlassCard from "../components/GlassCard";
import AnimatedCounter from "../components/AnimatedCounter";
import ProgressBar from "../components/ProgressBar";
import {
  getGreeting,
  calculateRank,
  getTotalParticipants,
  getWeeklyPointsData,
  getCommunityTotal,
} from "../utils/calculations";
import { FAKE_USERS, FEED_TEMPLATES, WEEKLY_CHALLENGES } from "../utils/constants";
import confetti from "canvas-confetti";

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, y: -20 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const itemVariant = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function Dashboard({ ecoData }) {
  const { user, avatar, points, activities, totalCO2, streak, dailyCount, markFirstLoginDone, firstLogin } = ecoData;
  const [liveFeed, setLiveFeed] = useState([]);

  const rank = useMemo(() => calculateRank(points), [points]);
  const totalUsers = getTotalParticipants();
  const weeklyData = useMemo(() => getWeeklyPointsData(activities), [activities]);
  const communityTotal = useMemo(() => getCommunityTotal(totalCO2), [totalCO2]);

  // Random weekly challenge
  const challenge = useMemo(() => {
    const idx = new Date().getDay() % WEEKLY_CHALLENGES.length;
    const ch = WEEKLY_CHALLENGES[idx];
    const done = activities.filter((a) => a.activityId === ch.activityId).length;
    return { ...ch, done: Math.min(done, ch.target) };
  }, [activities]);

  // First login confetti
  useEffect(() => {
    if (firstLogin) {
      setTimeout(() => {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 }, colors: ["#7C3AED", "#10B981", "#34D399"] });
      }, 600);
      markFirstLoginDone();
    }
  }, [firstLogin, markFirstLoginDone]);

  // Live feed simulation
  useEffect(() => {
    const generateFeed = () => {
      const user = FAKE_USERS[Math.floor(Math.random() * FAKE_USERS.length)];
      const template = FEED_TEMPLATES[Math.floor(Math.random() * FEED_TEMPLATES.length)];
      const co2 = (Math.random() * 2 + 0.2).toFixed(1);
      return {
        id: Date.now() + Math.random(),
        text: `${template.prefix} ${user.name} ${template.action.replace("{co2}", co2)}`,
        time: "just now",
      };
    };
    setLiveFeed([generateFeed(), generateFeed(), generateFeed()]);

    const interval = setInterval(() => {
      setLiveFeed((prev) => [generateFeed(), ...prev.slice(0, 4)]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div className="page dashboard-page" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {/* Hero Section */}
      <motion.section className="dash-hero" variants={itemVariant}>
        <div className="dash-hero-content">
          <h1 className="dash-greeting">
            {getGreeting()}, {user} {avatar}
          </h1>
          <div className="dash-hero-stats">
            <div className="dash-hero-points">
              <AnimatedCounter target={points} prefix="" suffix=" pts" className="dash-points-num" />
            </div>
            <p className="dash-co2-text">
              You've saved <strong>{totalCO2.toFixed(2)} kg</strong> of CO₂ from the atmosphere 🌍
            </p>
            {streak > 0 && (
              <div className="dash-streak">
                <Flame size={20} className="streak-icon" />
                <span>{streak} day streak</span>
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* Stat Cards */}
      <motion.section className="dash-stats" variants={stagger} initial="initial" animate="animate">
        <motion.div variants={itemVariant}>
          <GlassCard className="stat-card" glowColor="0 0 20px rgba(16,185,129,0.4)">
            <div className="stat-icon green"><Zap size={24} /></div>
            <div className="stat-info">
              <span className="stat-value"><AnimatedCounter target={points} /></span>
              <span className="stat-label">Total Points</span>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={itemVariant}>
          <GlassCard className="stat-card" glowColor="0 0 20px rgba(124,58,237,0.4)">
            <div className="stat-icon purple"><TrendingUp size={24} /></div>
            <div className="stat-info">
              <span className="stat-value">#{rank}</span>
              <span className="stat-label">of {totalUsers} users</span>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={itemVariant}>
          <GlassCard className="stat-card">
            <div className="stat-icon blue"><Activity size={24} /></div>
            <div className="stat-info">
              <span className="stat-value">{dailyCount} / 3</span>
              <span className="stat-label">Activities Today</span>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={itemVariant}>
          <GlassCard className="stat-card" glowColor="0 0 20px rgba(16,185,129,0.25)">
            <div className="stat-icon green"><Leaf size={24} /></div>
            <div className="stat-info">
              <span className="stat-value"><AnimatedCounter target={totalCO2} decimals={2} suffix=" kg" /></span>
              <span className="stat-label">CO₂ Saved</span>
            </div>
          </GlassCard>
        </motion.div>
      </motion.section>

      {/* Quick Actions */}
      <motion.section className="dash-actions" variants={itemVariant}>
        <Link to="/issues" className="quick-action-btn" style={{ background: "#EF4444", color: "white" }}>
          <AlertTriangle size={18} /> Report Issue
        </Link>
        <Link to="/solve-task" className="quick-action-btn action-secondary">
          <CheckCircle size={18} /> Problem Solved
        </Link>
        <Link to="/activities" className="quick-action-btn action-primary">
          <PlusIcon /> Eco Action
        </Link>
      </motion.section>

      <div className="dash-grid-bottom">
        {/* Weekly Chart */}
        <motion.section className="dash-chart-section" variants={itemVariant}>
          <GlassCard className="chart-card">
            <h2 className="section-title">📊 Weekly Progress</h2>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weeklyData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#6B7280" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(255,255,255,0.95)",
                      border: "none",
                      borderRadius: 12,
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar dataKey="points" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7C3AED" />
                      <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.section>

        {/* Right Column */}
        <div className="dash-right-col">
          {/* Active Challenge */}
          <motion.div variants={itemVariant}>
            <GlassCard className="challenge-card">
              <h2 className="section-title">🎯 Weekly Challenge</h2>
              <div className="challenge-info">
                <span className="challenge-icon">{challenge.icon}</span>
                <div className="challenge-text">
                  <h3>{challenge.title}</h3>
                  <p>{challenge.done}/{challenge.target} completed</p>
                </div>
              </div>
              <ProgressBar
                value={challenge.done}
                max={challenge.target}
                color="var(--primary)"
                height={10}
              />
            </GlassCard>
          </motion.div>

          {/* Live Feed */}
          <motion.div variants={itemVariant}>
            <GlassCard className="feed-card">
              <h2 className="section-title">🔴 Live Activity Feed</h2>
              <div className="feed-list">
                {liveFeed.map((item) => (
                  <motion.div
                    key={item.id}
                    className="feed-item"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <span className="feed-text">{item.text}</span>
                    <span className="feed-time">{item.time}</span>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Community Impact */}
          <motion.div variants={itemVariant}>
            <GlassCard className="community-card">
              <p className="community-text">
                🌍 Together, students have saved <strong>{communityTotal} kg CO₂</strong>
              </p>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
