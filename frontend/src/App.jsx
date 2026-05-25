import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Suspense, lazy } from "react";
import Layout from "./components/Layout";
import LoadingSpinner from "./components/LoadingSpinner";
import { AuthProvider, useAuth } from "./hooks/useAuth.jsx";

// Lazy-load pages for performance
const Home          = lazy(() => import("./pages/Home"));
const Dashboard     = lazy(() => import("./pages/Dashboard"));
const DiseaseDetect = lazy(() => import("./pages/DiseaseDetect"));
const Fertilizer    = lazy(() => import("./pages/Fertilizer"));
const CropMap       = lazy(() => import("./pages/CropMap"));
const Chatbot       = lazy(() => import("./pages/Chatbot"));
const News          = lazy(() => import("./pages/News"));
const Market        = lazy(() => import("./pages/Market"));
const Weather       = lazy(() => import("./pages/Weather"));
const Login         = lazy(() => import("./pages/Login"));
const Register      = lazy(() => import("./pages/Register"));
const ScanHistory   = lazy(() => import("./pages/ScanHistory"));

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ className: "font-sans text-sm" }} />
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="detect"     element={<DiseaseDetect />} />
              <Route path="fertilizer" element={<Fertilizer />} />
              <Route path="crop-map"   element={<CropMap />} />
              <Route path="chatbot"    element={<Chatbot />} />
              <Route path="news"       element={<News />} />
              <Route path="market"     element={<Market />} />
              <Route path="weather"    element={<Weather />} />
              <Route path="dashboard"  element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="history"    element={<ProtectedRoute><ScanHistory /></ProtectedRoute>} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
