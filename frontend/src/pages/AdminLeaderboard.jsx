import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion"; // eslint-disable-line no-unused-vars
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faTrophy,
  faShieldHalved,
  faMagnifyingGlass,
  faLock,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { io } from "socket.io-client";
import Background from "../components/background";
import apiClient, { API_BASE_URL } from "../api/client";

const ADMIN_PASSWORD = "mlscmlsc";

const RANK_MEDALS = ["🥇", "🥈", "🥉"];

// Module-level cache so data persists across navigations
let _cachedAdminLeaderboard = null;

// ─── Access Gate (same pattern as CommitAnalyzer) ────────────────────────────
const LeaderboardAccessGate = ({ onAccessGranted }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        onAccessGranted();
      } else {
        setError(true);
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        style={{
          background:
            "radial-gradient(circle at center, rgba(139,92,246,0.1) 0%, rgba(0,0,0,0.9) 100%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="relative w-full max-w-md"
      >
        <div
          className="relative overflow-hidden rounded-2xl border backdrop-blur-2xl shadow-2xl"
          style={{
            background: "rgba(30, 27, 75, 0.6)",
            borderColor: "rgba(139,92,246,0.3)",
            boxShadow: "0 0 50px rgba(139,92,246,0.15)",
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />

          <div className="p-8 md:p-10">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/30 blur-xl rounded-full" />
                <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-b from-purple-500/20 to-transparent border border-purple-500/30">
                  <FontAwesomeIcon icon={faLock} className="text-3xl text-purple-200" />
                </div>
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Admin Access</h2>
              <p className="text-purple-300/60 text-sm">
                Enter the access code to manage the leaderboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="Enter Access Code"
                className={`w-full bg-black/40 border rounded-xl px-5 py-4 text-center text-lg text-white placeholder-purple-500/30 outline-hidden transition-all duration-300 focus:border-purple-500/60 focus:bg-black/60 ${error ? "border-red-500/50" : "border-purple-500/20"
                  }`}
                autoFocus
              />

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs text-center font-medium"
                >
                  Incorrect access code. Please try again.
                </motion.p>
              )}

              <button
                type="submit"
                disabled={loading || !password}
                className="w-full relative overflow-hidden group rounded-xl p-[1px] focus:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 group-hover:opacity-100 opacity-80" />
                <div className="relative flex items-center justify-center gap-2 bg-slate-950/90 hover:bg-transparent rounded-[11px] px-4 py-3.5 transition-all duration-200">
                  <span className="font-semibold text-white">
                    {loading ? "Verifying..." : "Unlock Leaderboard"}
                  </span>
                  {!loading && (
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      className="text-white/80 group-hover:translate-x-1 transition-transform"
                    />
                  )}
                </div>
              </button>
            </form>
          </div>
        </div>

        <p className="text-center mt-6 text-xs text-purple-300/30 uppercase tracking-widest">
          Authorized Personnel Only
        </p>
      </motion.div>
    </div>
  );
};

// ─── Score adjustment button ─────────────────────────────────────────────────
const ScoreButton = ({ label, delta, onClick, isPositive }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={() => onClick(delta)}
    className={`w-10 h-8 rounded-lg text-xs font-bold transition-all duration-200 border ${isPositive
        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25"
        : "bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/25"
      }`}
  >
    {label}
  </motion.button>
);

// ─── Toast ───────────────────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 30, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 10, scale: 0.95 }}
    className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-xl border ${type === "error"
        ? "bg-red-900/80 border-red-500/40 text-red-200"
        : "bg-emerald-900/80 border-emerald-500/40 text-emerald-200"
      }`}
  >
    {message}
    <button onClick={onClose} className="ml-4 opacity-60 hover:opacity-100 text-xs">
      ✕
    </button>
  </motion.div>
);

// ─── Main Admin Leaderboard page ────────────────────────────────────────────────────
const AdminLeaderboard = () => {
  const [hasAccess, setHasAccess] = useState(false);
  const [gateLoading, setGateLoading] = useState(true);
  const [teams, setTeams] = useState(_cachedAdminLeaderboard || []);
  const [loading, setLoading] = useState(!_cachedAdminLeaderboard);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);
  const [updatingTeam, setUpdatingTeam] = useState(null);
  const socketRef = useRef(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const applyScoreUpdate = useCallback(({ teamId, teamKey, teamName, leaderName, newScore }) => {
    setTeams((prev) => {
      const updated = [
        ...prev.map((t) => {
          const sameTeamKey = teamKey && t.teamKey === teamKey;
          const sameId = teamId && t._id === teamId;
          const sameName = teamName && t.teamName === teamName;
          const sameLeader = leaderName ? t.leaderName === leaderName : true;
          return sameTeamKey || sameId || (sameName && sameLeader)
            ? { ...t, score: newScore }
            : t;
        }),
      ].sort((a, b) => (b.score || 0) - (a.score || 0));
      _cachedAdminLeaderboard = updated;
      return updated;
    });
  }, []);

  // Check sessionStorage on mount (same as CommitAnalyzer)
  useEffect(() => {
    const access = sessionStorage.getItem("leaderboardAccess");
    const adminAuth = sessionStorage.getItem("adminAuthenticated");
    if (access === "true" || adminAuth === "true") setHasAccess(true);
    setGateLoading(false);
  }, []);

  // Fetch leaderboard data + connect socket
  useEffect(() => {
    apiClient
      .get("/api/teams/shortlisted")
      .then((res) => {
        const tracksData = res.data.tracks || [];
        const flat = tracksData
          .flatMap((track) =>
            track.teams.map((team) => ({ ...team, trackName: track.trackName }))
          )
          .sort((a, b) => (b.score || 0) - (a.score || 0));
        _cachedAdminLeaderboard = flat;
        setTeams(flat);
      })
      .catch(() => {
        if (!_cachedAdminLeaderboard) showToast("Failed to load leaderboard data.", "error");
      })
      .finally(() => setLoading(false));

    const socket = io(API_BASE_URL, { transports: ["polling", "websocket"] });
    socketRef.current = socket;
    socket.on("score-update", applyScoreUpdate);
    return () => {
      socket.off("score-update", applyScoreUpdate);
      socket.disconnect();
    };
  }, [applyScoreUpdate, showToast]);

  const handleAccessGranted = () => {
    sessionStorage.setItem("leaderboardAccess", "true");
    setHasAccess(true);
  };

  const handleScoreUpdate = async (team, delta) => {
    const { trackName, _id: teamId, teamKey, teamName, leaderName } = team;
    const rowKey = teamKey || `${trackName}-${teamId}`;
    const key = `${trackName}-${rowKey}`;
    setUpdatingTeam(key);
    try {
      await apiClient.patch(
        `/api/leaderboard/${encodeURIComponent(trackName)}/${teamId}/score`,
        { delta, teamKey, teamName, leaderName }
      );
    } catch (err) {
      showToast(err.response?.data?.message || "Score update failed.", "error");
    } finally {
      setUpdatingTeam(null);
    }
  };

  if (gateLoading) return null;

  const filteredTeams = teams.filter((team) => {
    const q = searchQuery.toLowerCase();
    return (
      team.teamName.toLowerCase().includes(q) ||
      (team.leaderName || "").toLowerCase().includes(q) ||
      (team.trackName || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black text-white">
      <Background />

      {/* Access gate — same overlay pattern as CommitAnalyzer */}
      {!hasAccess && <LeaderboardAccessGate onAccessGranted={handleAccessGranted} />}

      <div className="relative z-10 min-h-screen px-4 md:px-8 py-20">
        <div className="max-w-5xl mx-auto">

          {/* Back button */}
          <motion.a
            href="/"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-purple-300/70 hover:text-white hover:bg-purple-500/20 border border-transparent hover:border-purple-500/30 transition-all duration-300 mb-8"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span className="text-sm tracking-wide">Home</span>
          </motion.a>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-3 mb-4">
              <FontAwesomeIcon
                icon={faTrophy}
                className="text-amber-400 text-3xl drop-shadow-lg"
              />
              <h1 className="text-4xl md:text-5xl font-extrabold text-white">
                Live{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                  Leaderboard
                </span>
              </h1>
            </div>
            <div className="flex items-center justify-center gap-2 mt-1">
              <p className="text-white/40 text-sm tracking-wide">
                Scores update in real-time &bull; All tracks
              </p>
              {hasAccess && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400">
                  <FontAwesomeIcon icon={faShieldHalved} className="text-[10px]" />
                  Admin
                </span>
              )}
            </div>
          </motion.div>

          {/* Search bar */}
          {!loading && teams.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6"
            >
              <div className="relative">
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm pointer-events-none"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by team name, leader or track…"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-purple-500/40 focus:bg-white/8 transition-all duration-200"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <svg className="animate-spin h-10 w-10 text-purple-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </div>
          ) : teams.length === 0 ? (
            <div className="text-center text-white/40 py-20 text-lg">
              No teams have been shortlisted yet.
            </div>
          ) : (
            <div>
              {/* Count label */}
              <div className="text-right text-white/30 text-xs mb-3">
                {searchQuery
                  ? `${filteredTeams.length} of ${teams.length} teams`
                  : `${teams.length} teams`}
              </div>

              {filteredTeams.length === 0 ? (
                <div className="text-center text-white/40 py-16 text-lg">
                  No teams match &ldquo;{searchQuery}&rdquo;
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="rounded-2xl overflow-hidden border border-white/10"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                >
                  {/* Column headers */}
                  <div
                    className={`grid items-center gap-3 md:gap-4 px-4 md:px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white/30 border-b border-white/8 ${hasAccess
                        ? "grid-cols-[2.5rem_1fr_5rem] md:grid-cols-[3rem_1fr_1fr_6rem_14rem]"
                        : "grid-cols-[2.5rem_1fr_5rem] md:grid-cols-[3rem_1fr_1fr_6rem]"
                      }`}
                  >
                    <span>Rank</span>
                    <span>Team</span>
                    <span className="hidden md:block">Leader</span>
                    <span className="text-right">Score</span>
                    {hasAccess && <span className="hidden md:block text-center">Adjust</span>}
                  </div>

                  {/* Team rows */}
                  <div className="divide-y divide-white/5">
                    {filteredTeams.map((team, idx) => {
                      const globalRank = teams.indexOf(team);
                      const rowKey = team.teamKey || `${team.trackName}-${team._id}`;
                      const isUpdating = updatingTeam === `${team.trackName}-${rowKey}`;

                      return (
                        <motion.div
                          key={rowKey}
                          layout
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.03 }}
                          className={`grid items-center gap-3 md:gap-4 px-4 md:px-6 py-3.5 transition-all duration-200 ${globalRank === 0 ? "bg-white/8" : "hover:bg-white/5"
                            } ${hasAccess
                              ? "grid-cols-[2.5rem_1fr_5rem] md:grid-cols-[3rem_1fr_1fr_6rem_14rem]"
                              : "grid-cols-[2.5rem_1fr_5rem] md:grid-cols-[3rem_1fr_1fr_6rem]"
                            }`}
                        >
                          {/* Rank */}
                          <span className="text-lg text-center">
                            {globalRank < 3 ? (
                              RANK_MEDALS[globalRank]
                            ) : (
                              <span className="text-white/40 text-sm font-bold">#{globalRank + 1}</span>
                            )}
                          </span>

                          {/* Team name */}
                          <div className="min-w-0">
                            <span className="block text-white font-semibold text-sm truncate">
                              {team.teamName}
                            </span>
                            <span className="md:hidden block text-white/50 text-xs truncate mt-0.5">
                              {team.leaderName}
                            </span>
                          </div>

                          {/* Leader */}
                          <span className="hidden md:block text-white/50 text-sm truncate">
                            {team.leaderName}
                          </span>

                          {/* Score */}
                          <div className="text-right">
                            <motion.span
                              key={team.score}
                              initial={{ scale: 1.3, color: "#a78bfa" }}
                              animate={{ scale: 1, color: "#ffffff" }}
                              transition={{ duration: 0.4 }}
                              className="text-lg font-extrabold text-white tabular-nums"
                            >
                              {team.score ?? 0}
                            </motion.span>
                            <span className="text-white/30 text-xs ml-1">pts</span>
                          </div>

                          {/* Admin score buttons */}
                          {hasAccess && (
                            <div className="col-span-3 md:col-span-1 flex items-center justify-end md:justify-center gap-1.5 mt-1 md:mt-0">
                              <ScoreButton label="-10" delta={-10} isPositive={false} onClick={(d) => handleScoreUpdate(team, d)} />
                              <ScoreButton label="-5" delta={-5} isPositive={false} onClick={(d) => handleScoreUpdate(team, d)} />
                              <ScoreButton label="+5" delta={5} isPositive={true} onClick={(d) => handleScoreUpdate(team, d)} />
                              <ScoreButton label="+10" delta={10} isPositive={true} onClick={(d) => handleScoreUpdate(team, d)} />
                              {isUpdating && (
                                <svg className="animate-spin h-4 w-4 text-purple-400 ml-1" viewBox="0 0 24 24" fill="none">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                              )}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminLeaderboard;
