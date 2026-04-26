import { useState, useCallback, useEffect } from "react";
import { getStoredData, setStoredData, clearStoredData, getTodayKey } from "../utils/storage";
import { BADGES, ACTIVITIES } from "../utils/constants";
import { calculateStreak } from "../utils/calculations";
import { activityAPI } from "../utils/api";

export default function useEcoData() {
  const [data, setData] = useState(() => getStoredData());

  // Sync to localStorage on every change
  useEffect(() => {
    if (data) setStoredData(data);
  }, [data]);

  // Migration: if they are logged in locally but don't have a backend userId, create one automatically
  useEffect(() => {
    if (data && data.user && !data.userId) {
      console.log("Migrating local session to backend...");
      fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.user, avatar: data.avatar }),
      })
        .then((res) => res.json())
        .then((userData) => {
          if (userData && userData._id) {
            setData(prev => ({ ...prev, userId: userData._id }));
          }
        })
        .catch((err) => console.error("Migration failed:", err));
    }
  }, [data?.user, data?.userId]);

  // Auto-reset daily count if date changed
  useEffect(() => {
    if (!data) return;
    const today = getTodayKey();
    if (data.lastDate !== today) {
      setData((prev) => ({ ...prev, dailyCount: 0, lastDate: today }));
    }
  }, [data?.lastDate]);

  const refresh = useCallback(() => {
    setData(getStoredData());
  }, []);

  const logActivity = useCallback(
    (activityId, quantity) => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      
      console.log("Token:", token);

      if (!data || !token || !user) {
        return { success: false, message: "Session expired, please login again" };
      }

      const today = getTodayKey();
      let currentDailyCount = data.dailyCount;
      let currentLastDate = data.lastDate;

      // Reset daily count if new day
      if (currentLastDate !== today) {
        currentDailyCount = 0;
        currentLastDate = today;
      }

      // Check daily limit — count distinct activity IDs logged today
      const todayActivityIds = new Set(
        (data.activities || [])
          .filter((a) => new Date(a.timestamp).toDateString() === today)
          .map((a) => a.activityId)
      );
      // Add the current one to see if we exceed
      if (!todayActivityIds.has(activityId) && todayActivityIds.size >= 3) {
        return { success: false, message: "⚠️ Daily limit reached! Come back tomorrow." };
      }

      const activity = ACTIVITIES.find((a) => a.id === activityId);
      if (!activity) return { success: false, message: "Activity not found" };

      const pointsEarned = activity.points * quantity;
      const co2Saved = parseFloat((activity.co2 * quantity).toFixed(2));

      const entry = {
        activityId,
        name: activity.name,
        icon: activity.icon,
        quantity,
        unit: activity.unit,
        pointsEarned,
        co2Saved,
        timestamp: new Date().toISOString(),
        category: activity.category,
      };

      const newActivities = [...(data.activities || []), entry];
      const newPoints = (data.points || 0) + pointsEarned;
      const newCO2 = parseFloat(((data.totalCO2 || 0) + co2Saved).toFixed(2));
      const newDailyCount = todayActivityIds.has(activityId)
        ? currentDailyCount
        : currentDailyCount + 1;

      const newData = {
        ...data,
        activities: newActivities,
        points: newPoints,
        totalCO2: newCO2,
        dailyCount: newDailyCount,
        lastDate: today,
        streak: calculateStreak(newActivities),
      };

      setData(newData);

      // Async sync to backend (JWT-auth)
      if (token) {
        activityAPI.sync({ pointsEarned, co2Saved, activityName: activity.name })
          .catch(err => console.error("Sync failed:", err));
      }
      return {
        success: true,
        pointsEarned,
        co2Saved,
        totalPoints: newPoints,
        message: `🎉 +${pointsEarned} points earned! You saved ${co2Saved} kg CO₂`,
      };
    },
    [data]
  );

  const claimBadge = useCallback(
    (badgeId) => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");

      console.log("Token:", token);

      if (!data || !token || !user) return false;
      if ((data.badges || []).includes(badgeId)) return false;

      const badge = BADGES.find((b) => b.id === badgeId);
      if (!badge) return false;

      // Check requirements
      let current = 0;
      if (badge.type === "activities") current = (data.activities || []).length;
      else if (badge.type === "points") current = data.points || 0;
      else if (badge.type === "co2") current = data.totalCO2 || 0;

      if (current < badge.required) return false;

      setData((prev) => ({
        ...prev,
        badges: [...(prev.badges || []), badgeId],
      }));

      // Async sync to backend (JWT-auth)
      if (token) {
        activityAPI.claimBadge(badgeId)
          .catch(err => console.error("Badge sync failed:", err));
      }

      return true;
    },
    [data]
  );

  const logout = useCallback(() => {
    clearStoredData();
    setData(null);
  }, []);

  const updateProfile = useCallback(
    (name) => {
      if (!data) return;
      setData((prev) => ({ ...prev, user: name.trim() }));
    },
    [data]
  );

  const toggleDarkMode = useCallback(() => {
    setData((prev) => ({ ...prev, darkMode: !prev.darkMode }));
  }, []);

  const markFirstLoginDone = useCallback(() => {
    setData((prev) => ({ ...prev, firstLogin: false }));
  }, []);

  const getTodayActivities = useCallback(() => {
    if (!data || !data.activities) return [];
    const today = getTodayKey();
    return data.activities.filter(
      (a) => new Date(a.timestamp).toDateString() === today
    );
  }, [data]);

  const getTodayDistinctCount = useCallback(() => {
    const todayActs = getTodayActivities();
    return new Set(todayActs.map((a) => a.activityId)).size;
  }, [getTodayActivities]);

  return {
    data,
    user: data?.user || "",
    avatar: data?.avatar || "🌿",
    points: data?.points || 0,
    activities: data?.activities || [],
    dailyCount: getTodayDistinctCount(),
    badges: data?.badges || [],
    totalCO2: data?.totalCO2 || 0,
    streak: data ? calculateStreak(data.activities) : 0,
    darkMode: data?.darkMode || false,
    joinDate: data?.joinDate || "",
    firstLogin: data?.firstLogin || false,
    logActivity,
    claimBadge,
    logout,
    updateProfile,
    toggleDarkMode,
    markFirstLoginDone,
    refresh,
    getTodayActivities,
    getTodayDistinctCount,
  };
}
