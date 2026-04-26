import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "./context/AuthContext";
import useEcoData from "./hooks/useEcoData";
import Navbar from "./components/Navbar";
import ToastContainer from "./components/Toast";
import Loader from "./components/Loader";

// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Activities = lazy(() => import("./pages/Activities"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Rewards = lazy(() => import("./pages/Rewards"));
const History = lazy(() => import("./pages/History"));
const Profile = lazy(() => import("./pages/Profile"));
const Tickets = lazy(() => import("./pages/Tickets"));
const CreateTicket = lazy(() => import("./pages/CreateTicket"));
const Tasks = lazy(() => import("./pages/Tasks"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="page-loader"><Loader size={48} text="Loading..." /></div>;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <div className="page-loader"><Loader size={48} text="Loading..." /></div>;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  const { isAuthenticated, user, logout } = useAuth();
  const ecoData = useEcoData();
  const location = useLocation();
  const isPublicPage = location.pathname === "/" || location.pathname === "/login" || location.pathname === "/register";
  const showNavbar = isAuthenticated && !isPublicPage;

  // Apply dark mode class
  useEffect(() => {
    document.documentElement.classList.toggle("dark", ecoData.darkMode);
  }, [ecoData.darkMode]);

  return (
    <div className={`app ${ecoData.darkMode ? "dark" : ""}`}>
      <ScrollToTop />
      <ToastContainer />
      {showNavbar && (
        <Navbar
          userName={user?.name || ecoData.user}
          avatar={user?.avatar || ecoData.avatar}
          points={ecoData.points}
          streak={ecoData.streak}
          onLogout={() => { logout(); ecoData.logout(); }}
          darkMode={ecoData.darkMode}
          onToggleDark={ecoData.toggleDarkMode}
          isAdmin={user?.role === "admin"}
        />
      )}

      <main className={showNavbar ? "main-content with-navbar" : "main-content"}>
        <Suspense fallback={<div className="page-loader"><Loader size={48} text="Loading..." /></div>}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Home />} />
              <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login onLoginSuccess={ecoData.refresh} />} />
              <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard ecoData={ecoData} /></ProtectedRoute>} />
              <Route path="/activities" element={<ProtectedRoute><Activities ecoData={ecoData} /></ProtectedRoute>} />
              <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard ecoData={ecoData} /></ProtectedRoute>} />
              <Route path="/rewards" element={<ProtectedRoute><Rewards ecoData={ecoData} /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><History ecoData={ecoData} /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile ecoData={ecoData} /></ProtectedRoute>} />
              <Route path="/tickets" element={<ProtectedRoute><Tickets /></ProtectedRoute>} />
              <Route path="/tickets/create" element={<ProtectedRoute><CreateTicket /></ProtectedRoute>} />
              <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
              <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>

      {showNavbar && (
        <footer className="app-footer">
          <p>Built for HackForge 2.0 · EcoTrack Pro 🌱</p>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
