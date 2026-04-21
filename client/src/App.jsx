import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup'
import VerifyEmail from "./pages/auth/VerifyEmail";
import MetaVerse from "./pages/metavese/MetaVerse";

// Redirects to "/" only on actual browser refresh (F5 / Ctrl+R)
function RefreshRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Detect if this page load was a browser refresh
    const navEntries = performance.getEntriesByType("navigation");
    const isReload = navEntries.length > 0 && navEntries[0].type === "reload";

    if (isReload && location.pathname !== "/") {
      navigate("/", { replace: true });
    }
  }, []);

  return null;
}

const App = () => {
  return (
    <BrowserRouter>
      <RefreshRedirect />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/metaverse" element={<MetaVerse />} />
        <Route path='/signup' element={<Signup/>} />
        <Route path='/verify-email' element={<VerifyEmail/>} />
        <Route path='/login' element={<Login/>} />
      
      </Routes>
    </BrowserRouter>
  );
};

export default App;