import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion"; // eslint-disable-line no-unused-vars
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faTrophy,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { io } from "socket.io-client";
import Background from "../components/background";
import apiClient, { API_BASE_URL } from "../api/client";

const RANK_MEDALS = ["🥇", "🥈", "🥉"];

// Module-level cache so data persists across navigations
let _cachedLeaderboard = null;

const Toast = ({ message, type, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 30, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 10, scale: 0.95 }}
    className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-xl border ${
      type === "error"
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

const ParticipantLeaderboard = () => {
  const [teams, setTeams] = useState(_cachedLeaderboard || []);
  const [loading, setLoading] = useState(!_cachedLeaderboard);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);
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
      _cachedLeaderboard = updated;
      return updated;
    });
  }, []);

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
        _cachedLeaderboard = flat;
        setTeams(flat);
      })
      .catch(() => {
        if (!_cachedLeaderboard) showToast("Failed to load leaderboard data.", "error");
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
            className="text-center mb-10"
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
            <p className="text-white/40 text-sm tracking-wide">
              Scores update in real-time &bull; All tracks
            </p>
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
                    className="grid grid-cols-[2.5rem_1fr_5rem] md:grid-cols-[3rem_1fr_1fr_6rem] items-center gap-3 md:gap-4 px-4 md:px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white/30 border-b border-white/8"
                  >
                    <span>Rank</span>
                    <span>Team</span>
                    <span className="hidden md:block">Leader</span>
                    <span className="text-right">Score</span>
                  </div>

                  {/* Team rows */}
                  <div className="divide-y divide-white/5">
                    {filteredTeams.map((team, idx) => {
                      const globalRank = teams.indexOf(team);

                      return (
                        <motion.div
                          key={team._id}
                          layout
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.03 }}
                          className={`grid grid-cols-[2.5rem_1fr_5rem] md:grid-cols-[3rem_1fr_1fr_6rem] items-center gap-3 md:gap-4 px-4 md:px-6 py-3.5 transition-all duration-200 ${
                            globalRank === 0 ? "bg-white/8" : "hover:bg-white/5"
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

export default ParticipantLeaderboard;
