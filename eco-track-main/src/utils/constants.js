// ─── Activity Data ───────────────────────────────────────────────
export const ACTIVITIES = [
  { id: "cyc", name: "Cycled to college", icon: "🚲", points: 30, co2: 0.8, unit: "trip", category: "Transport", description: "Skip the bike, save the air" },
  { id: "walk", name: "Walked instead of auto", icon: "🚶", points: 20, co2: 0.5, unit: "km", category: "Transport", description: "Every km counts" },
  { id: "light", name: "Turned off lights/fans", icon: "💡", points: 15, co2: 0.3, unit: "hour", category: "Energy", description: "Small habits, big impact" },
  { id: "ac", name: "Avoided AC for 1 hour", icon: "❄️", points: 25, co2: 0.6, unit: "hour", category: "Energy", description: "Cool down naturally" },
  { id: "bottle", name: "Used reusable bottle", icon: "🍶", points: 10, co2: 0.2, unit: "use", category: "Waste", description: "Say no to plastic" },
  { id: "plastic", name: "Refused single-use plastic", icon: "♻️", points: 20, co2: 0.4, unit: "item", category: "Waste", description: "One less plastic today" },
  { id: "tree", name: "Participated in tree plantation", icon: "🌱", points: 50, co2: 2.0, unit: "tree", category: "Green", description: "Plant for the future" },
  { id: "carpool", name: "Carpooled to college", icon: "🚗", points: 25, co2: 0.7, unit: "trip", category: "Transport", description: "Share the ride, halve the footprint" },
  { id: "compost", name: "Composted food waste", icon: "🍂", points: 30, co2: 0.9, unit: "kg", category: "Waste", description: "Close the food loop" },
  { id: "bus", name: "Used public transport", icon: "🚌", points: 20, co2: 0.5, unit: "trip", category: "Transport", description: "The greenest commute" },
  { id: "solar", name: "Used solar charging station", icon: "☀️", points: 35, co2: 1.0, unit: "session", category: "Energy", description: "Powered by the sun" },
  { id: "veg", name: "Had a plant-based meal", icon: "🥗", points: 15, co2: 0.4, unit: "meal", category: "Green", description: "Eat green, live green" },
];

export const CATEGORIES = ["All", "Transport", "Energy", "Waste", "Green"];

// ─── Badge Data ──────────────────────────────────────────────────
export const BADGES = [
  { id: "first_step", icon: "👣", name: "First Step", desc: "Log your first activity", type: "activities", required: 1 },
  { id: "on_a_roll", icon: "🎲", name: "On a Roll", desc: "Log 3 activities in one day", type: "daily", required: 3 },
  { id: "green_week", icon: "🌿", name: "Green Week", desc: "Log 7 activities total", type: "activities", required: 7 },
  { id: "eco_warrior", icon: "⚔️", name: "Eco Warrior", desc: "Reach 500 points", type: "points", required: 500 },
  { id: "carbon_100", icon: "💪", name: "Carbon Crusher", desc: "Save 5 kg CO₂", type: "co2", required: 5 },
  { id: "century", icon: "💯", name: "Century Club", desc: "Reach 1000 points", type: "points", required: 1000 },
  { id: "streak_7", icon: "🔥", name: "Week Warrior", desc: "Maintain 7-day streak", type: "streak", required: 7 },
  { id: "planet_guard", icon: "🌍", name: "Planet Guardian", desc: "Save 20 kg CO₂", type: "co2", required: 20 },
  { id: "solver", icon: "🛠️", name: "Problem Solver", desc: "Solve 3 campus issues", type: "tasks", required: 3 },
  { id: "legend", icon: "🏆", name: "Eco Legend", desc: "Reach 5000 points", type: "points", required: 5000 },
];

// ─── Level System ────────────────────────────────────────────────
export const LEVELS = [
  { name: "Eco Newbie", min: 0, max: 199, icon: "🌱", color: "#6B7280" },
  { name: "Green Walker", min: 200, max: 499, icon: "🚶", color: "#10B981" },
  { name: "Eco Rider", min: 500, max: 999, icon: "🚲", color: "#3B82F6" },
  { name: "Nature Guard", min: 1000, max: 2499, icon: "🌿", color: "#8B5CF6" },
  { name: "Eco Warrior", min: 2500, max: 4999, icon: "⚔️", color: "#F59E0B" },
  { name: "Planet Hero", min: 5000, max: 9999, icon: "🦸", color: "#EF4444" },
  { name: "Eco Legend", min: 10000, max: Infinity, icon: "🏆", color: "#7C3AED" },
];

// ─── Reward Tiers ────────────────────────────────────────────────
export const REWARD_TIERS = [
  { points: 100, reward: "Eco Starter Kit 🌱" },
  { points: 500, reward: "Reusable Bottle 🍶" },
  { points: 1000, reward: "Campus Café Voucher ☕" },
  { points: 2500, reward: "College Store Discount 🛒" },
  { points: 5000, reward: "Sustainability Champion Certificate 🏆" },
];

// ─── Departments ─────────────────────────────────────────────────
export const DEPARTMENTS = ["CSE", "Mechanical", "Electrical", "Civil", "Hostel", "Mess", "Library", "Other"];

// ─── Fake Users ──────────────────────────────────────────────────
export const FAKE_USERS = [
  { name: "Priya Sharma", dept: "CSE", avatar: "🌟", points: 2840, co2: 18.4, streak: 12, weeklyPts: 340 },
  { name: "Arjun Mehta", dept: "Mechanical", avatar: "⚡", points: 2650, co2: 16.2, streak: 8, weeklyPts: 290 },
  { name: "Sneha Patel", dept: "CSE", avatar: "🌸", points: 2410, co2: 15.0, streak: 15, weeklyPts: 410 },
  { name: "Rohan Singh", dept: "Electrical", avatar: "🔥", points: 2200, co2: 13.8, streak: 5, weeklyPts: 180 },
  { name: "Kavya Nair", dept: "Civil", avatar: "💫", points: 1980, co2: 12.1, streak: 9, weeklyPts: 260 },
  { name: "Amit Kumar", dept: "CSE", avatar: "🎯", points: 1750, co2: 10.8, streak: 4, weeklyPts: 150 },
  { name: "Ishaan Gupta", dept: "Hostel", avatar: "🌈", points: 1540, co2: 9.2, streak: 7, weeklyPts: 200 },
  { name: "Pooja Reddy", dept: "Mess", avatar: "🦋", points: 1320, co2: 8.0, streak: 3, weeklyPts: 120 },
  { name: "Dhruv Joshi", dept: "Library", avatar: "🎮", points: 1100, co2: 6.5, streak: 2, weeklyPts: 90 },
  { name: "Ananya Das", dept: "Mechanical", avatar: "🌊", points: 890, co2: 5.2, streak: 6, weeklyPts: 170 },
];

// ─── Avatar Options ──────────────────────────────────────────────
export const AVATARS = ["🌱", "🌿", "🦋", "⚡", "🌊", "🔥", "🌍", "💫"];

// ─── Live Feed Templates ─────────────────────────────────────────
export const FEED_TEMPLATES = [
  { prefix: "🔥", action: "saved {co2} kg CO₂" },
  { prefix: "🌱", action: "planted a tree" },
  { prefix: "🚲", action: "cycled to campus" },
  { prefix: "♻️", action: "avoided single-use plastic" },
  { prefix: "💡", action: "saved energy today" },
  { prefix: "🚶", action: "walked instead of driving" },
  { prefix: "🍶", action: "used a reusable bottle" },
];

// ─── Weekly Challenges ───────────────────────────────────────────
export const WEEKLY_CHALLENGES = [
  { id: 1, title: "Walk 5 times this week", target: 5, activityId: "walk", icon: "🚶" },
  { id: 2, title: "Use bicycle 3 times", target: 3, activityId: "cyc", icon: "🚲" },
  { id: 3, title: "Save energy 4 times", target: 4, activityId: "light", icon: "💡" },
  { id: 4, title: "Use reusable bottle 5 times", target: 5, activityId: "bottle", icon: "🍶" },
  { id: 5, title: "Compost waste 3 times", target: 3, activityId: "compost", icon: "🍂" },
];
