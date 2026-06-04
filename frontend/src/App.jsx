import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Suspense, lazy } from "react";
import Layout from "./components/Layout";
import LoadingSpinner from "./components/LoadingSpinner";
import { AuthProvider, useAuth } from "./hooks/useAuth.jsx";

// Lazy-load pages
const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DiseaseDetect = lazy(() => import("./pages/DiseaseDetect"));
const Fertilizer = lazy(() => import("./pages/Fertilizer"));
const CropMap = lazy(() => import("./pages/CropMap"));
const Chatbot = lazy(() => import("./pages/Chatbot"));
const News = lazy(() => import("./pages/News"));
const Market = lazy(() => import("./pages/Market"));
const Weather = lazy(() => import("./pages/Weather"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ScanHistory = lazy(() => import("./pages/ScanHistory"));

function ProtectedRoute({ children }) {

  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return user
    ? children
    : <Navigate to="/login" replace />;
}
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{ className: "font-sans text-sm" }}
        />

        <Suspense fallback={<LoadingSpinner />}>
          <Routes>

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route path="/" element={<Layout />}>

              <Route
                index
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />

              <Route
                path="detect"
                element={
                  <ProtectedRoute>
                    <DiseaseDetect />
                  </ProtectedRoute>
                }
              />

              <Route
                path="fertilizer"
                element={
                  <ProtectedRoute>
                    <Fertilizer />
                  </ProtectedRoute>
                }
              />

              <Route
                path="crop-map"
                element={
                  <ProtectedRoute>
                    <CropMap />
                  </ProtectedRoute>
                }
              />

              <Route
                path="chatbot"
                element={
                  <ProtectedRoute>
                    <Chatbot />
                  </ProtectedRoute>
                }
              />

              <Route
                path="news"
                element={
                  <ProtectedRoute>
                    <News />
                  </ProtectedRoute>
                }
              />

              <Route
                path="market"
                element={
                  <ProtectedRoute>
                    <Market />
                  </ProtectedRoute>
                }
              />

              <Route
                path="weather"
                element={
                  <ProtectedRoute>
                    <Weather />
                  </ProtectedRoute>
                }
              />

              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="history"
                element={
                  <ProtectedRoute>
                    <ScanHistory />
                  </ProtectedRoute>
                }
              />

            </Route>

          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
