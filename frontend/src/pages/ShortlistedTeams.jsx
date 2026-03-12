import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faArrowLeft,
  faUsers,
  faChevronDown,
  faPlus,
  faTrash,
  faBan,
  faUndo,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import Background from "../components/background";
import apiClient from "../api/client";

const TRACK_COLORS = {
  "Health Care": {
    from: "#34d399",
    to: "#06b6d4",
    accent: "rgba(52,211,153,0.15)",
    border: "rgba(52,211,153,0.3)",
  },
  GovTech: {
    from: "#f59e0b",
    to: "#f97316",
    accent: "rgba(245,158,11,0.15)",
    border: "rgba(245,158,11,0.3)",
  },
  EdTech: {
    from: "#a78bfa",
    to: "#6366f1",
    accent: "rgba(167,139,250,0.15)",
    border: "rgba(167,139,250,0.3)",
  },
};

const TRACK_NAMES = ["Health Care", "GovTech", "EdTech"];

const ShortlistedTeams = () => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [expandedTracks, setExpandedTracks] = useState({});

  // Admin mode
  const isAdmin = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const adminAuth = sessionStorage.getItem("adminAuthenticated");
    return params.get("admin") === "mlscmlsc" || adminAuth === "true";
  }, []);

  // Add-team form state
  const [showAddForm, setShowAddForm] = useState(null); // trackName or null
  const [newTeamName, setNewTeamName] = useState("");
  const [newLeaderName, setNewLeaderName] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch shortlisted teams on mount
  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/api/teams/shortlisted");
      const data = res.data;

      if (!data.success)
        throw new Error(data.message || "Failed to fetch teams");
      setTracks(data.tracks);

      // Expand all tracks by default initially
      const initialExpanded = {};
      data.tracks.forEach((track) => {
        initialExpanded[track.trackName] = true;
      });
      setExpandedTracks(initialExpanded);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // --- Admin actions ---
  const handleAddTeam = async (trackName) => {
    if (!newTeamName.trim() || !newLeaderName.trim()) return;
    setActionLoading(true);
    try {
      await apiClient.post("/api/teams/", {
        trackName,
        teamName: newTeamName.trim(),
        leaderName: newLeaderName.trim(),
      });
      setNewTeamName("");
      setNewLeaderName("");
      setShowAddForm(null);
      await fetchTeams();
    } catch (err) {
      alert("Failed to add team: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveTeam = async (trackName, teamId) => {
    if (!window.confirm("Are you sure you want to remove this team?")) return;
    setActionLoading(true);
    try {
      await apiClient.delete(
        `/api/teams/track/${encodeURIComponent(trackName)}/team/${teamId}`
      );
      await fetchTeams();
    } catch (err) {
      alert("Failed to remove team: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleEliminated = async (trackName, teamId) => {
    setActionLoading(true);
    try {
      await apiClient.patch(
        `/api/teams/track/${encodeURIComponent(trackName)}/team/${teamId}/toggle-eliminated`
      );
      await fetchTeams();
    } catch (err) {
      alert("Failed to toggle elimination: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  // Client-side filtering by teamName within each track
  const filteredTracks = useMemo(() => {
    if (!debouncedQuery.trim()) return tracks;

    return tracks
      .map((track) => ({
        ...track,
        teams: track.teams.filter((team) =>
          team.teamName.toLowerCase().includes(debouncedQuery.toLowerCase())
        ),
      }))
      .filter((track) => track.teams.length > 0);
  }, [tracks, debouncedQuery]);

  // Auto-expand tracks that contain search matches
  useEffect(() => {
    if (debouncedQuery.trim()) {
      const newExpanded = { ...expandedTracks };
      tracks.forEach((track) => {
        const hasMatches = track.teams.some((team) =>
          team.teamName.toLowerCase().includes(debouncedQuery.toLowerCase())
        );
        if (hasMatches) newExpanded[track.trackName] = true;
      });
      setExpandedTracks(newExpanded);
    }
  }, [debouncedQuery]);

  const toggleTrack = (trackName) => {
    setExpandedTracks((prev) => ({
      ...prev,
      [trackName]: !prev[trackName],
    }));
  };

  const totalTeams = tracks.reduce((sum, t) => sum + t.teams.length, 0);
  const filteredTotal = filteredTracks.reduce(
    (sum, t) => sum + t.teams.length,
    0
  );

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Background />

      <div className="relative z-10 min-h-screen px-4 md:px-8 py-24">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <motion.a
            href="/"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-purple-300/70 hover:text-white hover:bg-purple-500/20 border border-transparent hover:border-purple-500/30 transition-all duration-300 mb-8"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span className="text-sm tracking-wide">Back to Home</span>
          </motion.a>

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
              <span className="text-white">Shortlisted </span>
              <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-blue-400">
                Teams
              </span>
            </h1>

            {/* Decorative divider */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px w-16 bg-linear-to-r from-transparent to-purple-500/50" />
              <div className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_#a78bfa]" />
              <div className="h-px w-16 bg-linear-to-l from-transparent to-purple-500/50" />
            </div>

            <p className="text-purple-300/60 text-sm tracking-[0.2em] uppercase">
              Teams advancing to the next round
            </p>

            {/* Admin badge */}
            {isAdmin && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  borderColor: "rgba(239,68,68,0.3)",
                }}
              >
                <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <span className="text-red-300 text-xs font-semibold tracking-widest uppercase">
                  Admin Mode
                </span>
              </motion.div>
            )}
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-md mx-auto mb-12"
          >
            <div
              className="relative flex items-center rounded-xl border backdrop-blur-md overflow-hidden"
              style={{
                background: "rgba(139,92,246,0.05)",
                borderColor: "rgba(139,92,246,0.2)",
              }}
            >
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-4 text-purple-400/50"
              />
              <input
                type="text"
                placeholder="Search by team name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent pl-11 pr-4 py-3.5 text-purple-100 placeholder-purple-400/40 focus:outline-none text-sm tracking-wide"
              />
            </div>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24">
              <motion.div
                className="w-16 h-16 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 30% 30%, rgba(147,197,253,0.9) 0%, rgba(167,139,250,0.7) 40%, rgba(99,102,241,0.5) 100%)",
                  boxShadow:
                    "0 0 40px rgba(167,139,250,0.5), 0 0 80px rgba(96,165,250,0.3)",
                }}
                animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                transition={{
                  rotate: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  },
                  scale: { duration: 2, repeat: Infinity },
                }}
              />
              <p className="text-purple-300/50 text-sm mt-6 tracking-widest uppercase">
                Loading teams...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div
                className="inline-block p-6 rounded-2xl border backdrop-blur-md"
                style={{
                  background: "rgba(239,68,68,0.05)",
                  borderColor: "rgba(239,68,68,0.2)",
                }}
              >
                <p className="text-red-300 text-lg font-medium mb-2">
                  Something went wrong
                </p>
                <p className="text-red-300/60 text-sm">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredTracks.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div
                className="inline-block p-8 rounded-2xl border backdrop-blur-md"
                style={{
                  background: "rgba(139,92,246,0.05)",
                  borderColor: "rgba(139,92,246,0.15)",
                }}
              >
                <FontAwesomeIcon
                  icon={faUsers}
                  className="text-purple-400/30 text-4xl mb-4"
                />
                <p className="text-purple-200 text-lg font-medium mb-1">
                  No teams found
                </p>
                <p className="text-purple-300/50 text-sm">
                  {debouncedQuery
                    ? `No results for "${debouncedQuery}"`
                    : "No shortlisted teams yet"}
                </p>
              </div>
            </motion.div>
          )}

          {/* Tracks with Teams */}
          {!loading && !error && filteredTracks.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="max-w-3xl mx-auto flex flex-col gap-6"
            >
              {filteredTracks.map((track, trackIndex) => {
                const colors =
                  TRACK_COLORS[track.trackName] || TRACK_COLORS["EdTech"];
                const isExpanded =
                  expandedTracks[track.trackName] || false;

                return (
                  <motion.div
                    key={track._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: trackIndex * 0.15,
                    }}
                    className="relative bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl"
                  >
                    {/* Track Header - Clickable to toggle */}
                    <button
                      onClick={() => toggleTrack(track.trackName)}
                      className="w-full flex items-center justify-between p-5 md:p-6 transition-colors hover:bg-white/[0.04] text-left outline-none focus-visible:ring-2 focus-visible:ring-purple-500/50 rounded-2xl"
                    >
                      <div className="flex items-center gap-4">
                        {/* Glow dot */}
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            background: colors.from,
                            boxShadow: `0 0 12px ${colors.from}`,
                          }}
                        />
                        <h2
                          className="text-xl md:text-2xl font-bold tracking-wide text-transparent bg-clip-text"
                          style={{
                            backgroundImage: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
                          }}
                        >
                          {track.trackName}
                        </h2>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="hidden sm:inline-block text-xs font-semibold px-3 py-1.5 rounded-full bg-white/5 text-purple-200/80 border border-white/10 uppercase tracking-widest">
                          {track.teams.length} Team
                          {track.teams.length !== 1 ? "s" : ""}
                        </span>
                        {/* Expand/Collapse Chevron */}
                        <motion.div
                          animate={{
                            rotate: isExpanded ? 180 : 0,
                          }}
                          transition={{
                            duration: 0.3,
                            ease: "easeInOut",
                          }}
                          className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-purple-300/70"
                        >
                          <FontAwesomeIcon
                            icon={faChevronDown}
                            className="text-sm"
                          />
                        </motion.div>
                      </div>
                    </button>

                    {/* Expandable Teams List */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          key="content"
                          initial="collapsed"
                          animate="open"
                          exit="collapsed"
                          variants={{
                            open: {
                              opacity: 1,
                              height: "auto",
                            },
                            collapsed: {
                              opacity: 0,
                              height: 0,
                            },
                          }}
                          transition={{
                            duration: 0.4,
                            ease: [0.04, 0.62, 0.23, 0.98],
                          }}
                        >
                          <div className="px-5 pb-6 md:px-6 md:pb-7 flex flex-col gap-3">
                            {/* Subtle divider */}
                            <div className="h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent mb-2" />

                            {track.teams.map((team, index) => {
                              const isEliminated = team.eliminated;

                              return (
                                <motion.div
                                  key={team._id}
                                  initial={{
                                    opacity: 0,
                                    x: -10,
                                  }}
                                  animate={{
                                    opacity: 1,
                                    x: 0,
                                  }}
                                  transition={{
                                    duration: 0.3,
                                    delay: index * 0.03,
                                  }}
                                  className="group relative"
                                >
                                  {/* Left highlight on hover */}
                                  <div
                                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                                    style={{
                                      background: isEliminated
                                        ? "linear-gradient(to bottom, #4b5563, #374151)"
                                        : `linear-gradient(to bottom, ${colors.from}, ${colors.to})`,
                                    }}
                                  />

                                  <div
                                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:pl-6 rounded-xl border backdrop-blur-md transition-all duration-300 group-hover:translate-x-1 ${isEliminated
                                      ? "border-gray-700/40 bg-gray-900/50 hover:bg-gray-900/60"
                                      : "border-white/5 bg-black/20 hover:bg-black/30 hover:border-white/10"
                                      }`}
                                    style={
                                      isEliminated
                                        ? { opacity: 0.5 }
                                        : {}
                                    }
                                  >
                                    {/* Team Name + Eliminated Badge */}
                                    <div className="flex-1 flex items-center gap-3">
                                      <span
                                        className={`text-lg font-semibold tracking-wide transition-colors ${isEliminated
                                          ? "text-gray-500 line-through"
                                          : "text-white/90 group-hover:text-white"
                                          }`}
                                      >
                                        {team.teamName}
                                      </span>
                                      {isEliminated && (
                                        <span
                                          className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border"
                                          style={{
                                            background:
                                              "rgba(107,114,128,0.2)",
                                            borderColor:
                                              "rgba(107,114,128,0.4)",
                                            color:
                                              "#9ca3af",
                                          }}
                                        >
                                          Eliminated
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                      {/* Leader Badge */}
                                      <div
                                        className={`flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-lg border ${isEliminated
                                          ? "bg-gray-800/30 border-gray-700/30"
                                          : "bg-white/5 border-white/5"
                                          }`}
                                      >
                                        <div
                                          className={`w-5 h-5 rounded-full flex items-center justify-center border ${isEliminated
                                            ? "bg-gradient-to-br from-gray-600/30 to-gray-700/30 border-gray-600/20"
                                            : "bg-gradient-to-br from-purple-500/30 to-blue-500/30 border-white/10"
                                            }`}
                                        >
                                          <span
                                            className={`text-[10px] font-bold ${isEliminated
                                              ? "text-gray-500"
                                              : "text-purple-300"
                                              }`}
                                          >
                                            {team.leaderName
                                              .charAt(0)
                                              .toUpperCase()}
                                          </span>
                                        </div>
                                        <span
                                          className={`text-sm font-medium ${isEliminated
                                            ? "text-gray-500"
                                            : "text-purple-200/80"
                                            }`}
                                        >
                                          {team.leaderName}
                                        </span>
                                      </div>

                                      {/* Admin action buttons */}
                                      {isAdmin && (
                                        <div className="flex items-center gap-1.5 ml-2">
                                          {/* Eliminate / Restore toggle */}
                                          <button
                                            onClick={() =>
                                              handleToggleEliminated(
                                                track.trackName,
                                                team._id
                                              )
                                            }
                                            disabled={actionLoading}
                                            title={
                                              isEliminated
                                                ? "Restore team"
                                                : "Eliminate team"
                                            }
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-200 ${isEliminated
                                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                                              : "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                                              } disabled:opacity-30`}
                                          >
                                            <FontAwesomeIcon
                                              icon={
                                                isEliminated
                                                  ? faUndo
                                                  : faBan
                                              }
                                              className="text-xs"
                                            />
                                          </button>

                                          {/* Remove button */}
                                          <button
                                            onClick={() =>
                                              handleRemoveTeam(
                                                track.trackName,
                                                team._id
                                              )
                                            }
                                            disabled={actionLoading}
                                            title="Remove team"
                                            className="w-8 h-8 rounded-lg flex items-center justify-center border bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all duration-200 disabled:opacity-30"
                                          >
                                            <FontAwesomeIcon
                                              icon={faTrash}
                                              className="text-xs"
                                            />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}

                            {/* Admin: Add Team Button / Form */}
                            {isAdmin && (
                              <div className="mt-2">
                                {showAddForm === track.trackName ? (
                                  <motion.div
                                    initial={{
                                      opacity: 0,
                                      y: -10,
                                    }}
                                    animate={{
                                      opacity: 1,
                                      y: 0,
                                    }}
                                    className="flex flex-col sm:flex-row gap-2 p-4 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-md"
                                  >
                                    <input
                                      type="text"
                                      placeholder="Team name"
                                      value={newTeamName}
                                      onChange={(e) =>
                                        setNewTeamName(
                                          e.target.value
                                        )
                                      }
                                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                                    />
                                    <input
                                      type="text"
                                      placeholder="Leader name"
                                      value={newLeaderName}
                                      onChange={(e) =>
                                        setNewLeaderName(
                                          e.target.value
                                        )
                                      }
                                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() =>
                                          handleAddTeam(
                                            track.trackName
                                          )
                                        }
                                        disabled={
                                          actionLoading ||
                                          !newTeamName.trim() ||
                                          !newLeaderName.trim()
                                        }
                                        className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all duration-200 disabled:opacity-30"
                                        style={{
                                          background: `linear-gradient(135deg, ${colors.from}20, ${colors.to}20)`,
                                          borderColor:
                                            colors.border,
                                          color: colors.from,
                                        }}
                                      >
                                        Add
                                      </button>
                                      <button
                                        onClick={() => {
                                          setShowAddForm(null);
                                          setNewTeamName("");
                                          setNewLeaderName("");
                                        }}
                                        className="px-3 py-2 rounded-lg text-sm text-white/50 border border-white/10 hover:bg-white/5 transition-all duration-200"
                                      >
                                        <FontAwesomeIcon
                                          icon={faTimes}
                                        />
                                      </button>
                                    </div>
                                  </motion.div>
                                ) : (
                                  <button
                                    onClick={() =>
                                      setShowAddForm(
                                        track.trackName
                                      )
                                    }
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/10 text-white/30 hover:text-white/60 hover:border-white/20 hover:bg-white/[0.02] transition-all duration-300 text-sm"
                                  >
                                    <FontAwesomeIcon
                                      icon={faPlus}
                                      className="text-xs"
                                    />
                                    <span>Add Team</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Results count */}
          {!loading && !error && totalTeams > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-purple-400/40 text-sm mt-10 tracking-[0.2em] uppercase"
            >
              {filteredTotal} of {totalTeams} teams
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShortlistedTeams;
