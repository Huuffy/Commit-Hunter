import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import LoadingScreen from "./components/LoadingScreen";
import About from "./components/about";
import Contact from "./components/contact";
import FAQs from "./components/faqs";
import Tracks from "./components/Tracks.jsx";
import GeneralGuidelines from "./components/GeneralGuildelines.jsx";
import PrizeSection from "./components/PrizeSection.jsx";
import ShortlistedTeams from "./pages/ShortlistedTeams";
import Networking from "./pages/Networking";
import CommitAnalyzer from "./pages/CommitAnalyzer";
import CommitReport from "./pages/CommitReport";
import ParticipantLeaderboard from "./pages/ParticipantLeaderboard";
import AdminLeaderboard from "./pages/AdminLeaderboard";
import Timeline from "./components/Timeline";
import ButterflyBackground from "./components/ButterflyBackground";
import Realtime from "./pages/Realtime.jsx";
import RealtimeAdmin from "./pages/RealtimeAdmin.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import NetworkingForm from "./pages/NetworkingForm.jsx";

// Landing page — home + about sections
const LandingPage = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* <LoadingScreen
        isLoading={isLoading}
        onLoadingComplete={() => setIsLoading(false)}
        minDuration={3000}
      /> */}
      {!isMobile && <ButterflyBackground />}
      <Home />
      <About />
      <Tracks />
      <Timeline />
      <PrizeSection />
      <GeneralGuidelines />
      <FAQs />
      <Contact />

    </>
  );
};



const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/shortlisted-teams" element={<ShortlistedTeams />} />

          <Route path="/networking" element={<Networking />} />
          <Route path="/networking-form" element={<NetworkingForm />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/commit-analyzer" element={
            <AdminRoute><CommitAnalyzer /></AdminRoute>
          } />
          <Route path="/admin/commit-analyzer/report/:team_name" element={
            <AdminRoute><CommitReport /></AdminRoute>
          } />
          <Route path="/admin/leaderboard" element={
            <AdminRoute><AdminLeaderboard /></AdminRoute>
          } />
          <Route path="/admin/realtime" element={
            <AdminRoute><RealtimeAdmin /></AdminRoute>
          } />

          {/* User Features */}
          <Route path="/leaderboard" element={<ParticipantLeaderboard />} />
          <Route path="/realtime" element={<Realtime />} />
          <Route path="/timer" element={<Realtime />} /> {/* Alias for timer redirect requirement */}

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
