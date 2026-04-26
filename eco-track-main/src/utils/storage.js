// ─── localStorage helpers ────────────────────────────────────────

const STORAGE_KEY = "ecotrack_data";

const defaultData = () => ({
  user: "",
  userId: null,
  avatar: "🌿",
  points: 0,
  activities: [],
  dailyCount: 0,
  lastDate: "",
  badges: [],
  totalCO2: 0,
  streak: 0,
  lastStreakDate: "",
  joinDate: new Date().toISOString(),
  darkMode: false,
  challengeProgress: {},
  weeklyPoints: {},
  firstLogin: true,
});

export function getStoredData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearStoredData() {
  localStorage.removeItem(STORAGE_KEY);
}

export function isLoggedIn() {
  const data = getStoredData();
  return data && data.user && data.user.trim().length > 0;
}

export function initUser(name, avatar, userId) {
  const data = {
    ...defaultData(),
    user: name.trim(),
    userId: userId,
    avatar,
    joinDate: new Date().toISOString(),
    lastDate: new Date().toDateString(),
    firstLogin: true,
  };
  setStoredData(data);
  return data;
}

export function getTodayKey() {
  return new Date().toDateString();
}

export function getWeekKey(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

export function getDayOfWeekLabel(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toLocaleDateString("en-US", { weekday: "short" });
}
