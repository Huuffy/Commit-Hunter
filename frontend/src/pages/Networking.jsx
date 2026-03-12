import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Users, AlertTriangle, Search, X, UserPlus, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Background from "../components/background";
import ParticipantGrid from "../components/networkingComponents/ParticipantGrid";
import apiClient from "../api/client";

/* ── tiny toast component ── */
function Toast({ message, onClose }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl"
            style={{
                background: "rgba(5,5,20,0.92)",
                border: "1px solid rgba(139,92,246,0.35)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 0 32px rgba(139,92,246,0.2), 0 8px 32px rgba(0,0,0,0.5)",
                whiteSpace: "nowrap",
            }}
        >
            <CheckCircle className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="text-white/90 text-sm font-medium">{message}</span>
            <button onClick={onClose} className="ml-1 text-white/30 hover:text-white/70 transition-colors">
                <X className="w-3.5 h-3.5" />
            </button>
        </motion.div>
    );
}

const NetworkingHub = () => {
    const navigate = useNavigate();
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTeam, setActiveTeam] = useState("All");
    const [searchFocused, setSearchFocused] = useState(false);
    const [toast, setToast] = useState(null);

    const alreadySubmitted = !!localStorage.getItem("networkingFormSubmitted");

    const handleAddProfile = () => {
        if (alreadySubmitted) {
            setToast("You've already added your profile!");
            setTimeout(() => setToast(null), 3500);
        } else {
            navigate("/networking-form");
        }
    };

    useEffect(() => {
        fetchParticipants();
    }, []);

    const fetchParticipants = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiClient.get("/api/participants");
            setParticipants(res.data?.participants || []);
        } catch (err) {
            console.error(err);
            setError("Failed to load participants. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    // Derive unique team names for filter pills
    const teamNames = useMemo(() => {
        const names = [...new Set(participants.map((p) => p.teamName).filter(Boolean))];
        return ["All", ...names.sort()];
    }, [participants]);

    // Filtered participants
    const filtered = useMemo(() => {
        let list = participants;
        if (activeTeam !== "All") {
            list = list.filter((p) => p.teamName === activeTeam);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(
                (p) =>
                    p.name?.toLowerCase().includes(q) ||
                    p.college?.toLowerCase().includes(q) ||
                    p.teamName?.toLowerCase().includes(q) ||
                    p.bio?.toLowerCase().includes(q)
            );
        }
        return list;
    }, [participants, searchQuery, activeTeam]);

    return (
        <div className="relative min-h-screen overflow-x-hidden">
            <Background />

            {/* ── Toast ── */}
            <AnimatePresence>
                {toast && (
                    <Toast message={toast} onClose={() => setToast(null)} />
                )}
            </AnimatePresence>

            <div className="relative z-10 min-h-screen px-4 md:px-8 py-24">
                <div className="max-w-6xl mx-auto">

                    {/* Back Button */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8"
                    >
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-purple-300/70 hover:text-white hover:bg-purple-500/20 transition-all duration-300"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="text-sm tracking-wide">
                                Back to Home
                            </span>
                        </Link>
                    </motion.div>

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-10"
                    >
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
                            <span className="text-white">Networking </span>
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-blue-400">
                                Hub
                            </span>
                        </h1>
                        <p className="text-purple-300/60 text-sm md:text-base max-w-lg mx-auto mb-6">
                            Connect with fellow hackers, find teammates, and grow your network
                        </p>

                        {/* Add profile CTA */}
                        <button
                            onClick={handleAddProfile}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.03]"
                            style={{
                                background: alreadySubmitted
                                    ? "rgba(139,92,246,0.25)"
                                    : "linear-gradient(135deg, rgba(139,92,246,0.6), rgba(59,130,246,0.5))",
                                boxShadow: "0 0 24px rgba(139,92,246,0.2), inset 0 0 16px rgba(255,255,255,0.06)",
                                border: alreadySubmitted ? "1px solid rgba(139,92,246,0.3)" : "none",
                                color: "#fff",
                            }}
                        >
                            <UserPlus className="w-4 h-4" />
                            {alreadySubmitted ? "Profile Added" : "Add Your Profile"}
                        </button>
                    </motion.div>

                    {/* ── Search & Filter Bar ── */}
                    {!loading && !error && participants.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="mb-10"
                        >
                            {/* Glass search panel */}
                            <div
                                className="max-w-2xl mx-auto rounded-2xl p-4 sm:p-5 space-y-4"
                                style={{
                                    background: "rgba(5,5,20,0.6)",
                                    border: "1px solid rgba(255,255,255,0.06)",
                                    backdropFilter: "blur(20px)",
                                    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                                }}
                            >
                                {/* Search Input */}
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/50 pointer-events-none" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search by name, college, or team..."
                                        className="w-full pl-11 pr-10 h-11 sm:h-10 rounded-xl text-base sm:text-sm text-white placeholder-purple-400/35 focus:outline-none transition-all duration-300"
                                        style={{
                                            background: "rgba(139,92,246,0.06)",
                                            border: searchFocused
                                                ? "1px solid rgba(139,92,246,0.45)"
                                                : "1px solid rgba(255,255,255,0.08)",
                                            boxShadow: searchFocused
                                                ? "0 0 0 3px rgba(139,92,246,0.1), 0 0 20px rgba(139,92,246,0.06)"
                                                : "none",
                                        }}
                                        onFocus={() => setSearchFocused(true)}
                                        onBlur={() => setSearchFocused(false)}
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery("")}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400/50 hover:text-purple-200 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                {/* Team Filter Pills */}
                                {teamNames.length > 2 && (
                                    <div className="flex flex-wrap gap-2">
                                        {teamNames.map((name) => (
                                            <button
                                                key={name}
                                                onClick={() => setActiveTeam(name)}
                                                className="px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-200 hover:scale-105"
                                                style={{
                                                    background:
                                                        activeTeam === name
                                                            ? "linear-gradient(135deg,rgba(139,92,246,0.6),rgba(59,130,246,0.5))"
                                                            : "rgba(139,92,246,0.06)",
                                                    border:
                                                        activeTeam === name
                                                            ? "1px solid rgba(167,139,250,0.5)"
                                                            : "1px solid rgba(255,255,255,0.06)",
                                                    color:
                                                        activeTeam === name
                                                            ? "#fff"
                                                            : "rgba(196,181,253,0.6)",
                                                    boxShadow:
                                                        activeTeam === name
                                                            ? "0 0 16px rgba(139,92,246,0.2)"
                                                            : "none",
                                                }}
                                            >
                                                {name}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Result count */}
                                <p className="text-purple-400/35 text-xs tracking-wide">
                                    {filtered.length} participant{filtered.length !== 1 ? "s" : ""}
                                    {activeTeam !== "All" && ` in ${activeTeam}`}
                                    {searchQuery && ` matching \u201C${searchQuery}\u201D`}
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* ── Loading State ── */}
                    {loading && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-50 rounded-2xl animate-pulse"
                                    style={{
                                        background: "rgba(5,5,20,0.6)",
                                        border: "1px solid rgba(255,255,255,0.04)",
                                    }}
                                >
                                    <div className="flex flex-col items-center justify-center h-full gap-4 px-6">
                                        <div className="w-20 h-20 rounded-full bg-purple-500/8" />
                                        <div className="space-y-2 w-full">
                                            <div className="h-4 w-28 mx-auto rounded bg-purple-500/8" />
                                            <div className="h-3 w-20 mx-auto rounded bg-purple-500/6" />
                                        </div>
                                        <div className="h-6 w-24 rounded-full bg-purple-500/6" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── Error State ── */}
                    {!loading && error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-16"
                        >
                            <div
                                className="inline-flex flex-col items-center gap-4 px-8 py-6 rounded-2xl"
                                style={{
                                    background: "rgba(5,5,20,0.7)",
                                    border: "1px solid rgba(239,68,68,0.2)",
                                    backdropFilter: "blur(20px)",
                                }}
                            >
                                <div
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                                    style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
                                >
                                    <AlertTriangle className="w-6 h-6 text-red-400/80" />
                                </div>
                                <p className="text-red-300/80 text-sm font-medium">
                                    {error}
                                </p>
                                <button
                                    onClick={fetchParticipants}
                                    className="mt-2 px-5 py-2 rounded-lg text-sm font-medium text-white transition-all duration-200 hover:scale-105"
                                    style={{
                                        background:
                                            "linear-gradient(135deg,rgba(139,92,246,0.8),rgba(59,130,246,0.8))",
                                    }}
                                >
                                    Retry
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ── Empty State ── */}
                    {!loading && !error && participants.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-center py-16"
                        >
                            <div
                                className="inline-flex flex-col items-center gap-4 px-10 py-8 rounded-2xl"
                                style={{
                                    background: "rgba(5,5,20,0.6)",
                                    border: "1px solid rgba(255,255,255,0.06)",
                                    backdropFilter: "blur(20px)",
                                }}
                            >
                                <div
                                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                                    style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}
                                >
                                    <Users className="w-7 h-7 text-purple-400/50" />
                                </div>
                                <p className="text-purple-200/80 text-lg font-medium">
                                    No participants yet
                                </p>
                                <p className="text-purple-300/40 text-sm">
                                    Be the first to join the networking hub!
                                </p>
                                <button
                                    onClick={handleAddProfile}
                                    className="mt-1 px-5 py-2 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:scale-105"
                                    style={{
                                        background: "linear-gradient(135deg,rgba(139,92,246,0.7),rgba(59,130,246,0.6))",
                                        boxShadow: "0 0 20px rgba(139,92,246,0.2)",
                                    }}
                                >
                                    Add Your Profile
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ── Participant Grid ── */}
                    {!loading && !error && participants.length > 0 && filtered.length > 0 && (
                        <ParticipantGrid key={activeTeam + searchQuery} participants={filtered} />
                    )}

                    {/* ── No Results ── */}
                    {!loading && !error && participants.length > 0 && filtered.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-16"
                        >
                            <div
                                className="inline-flex flex-col items-center gap-4 px-10 py-8 rounded-2xl"
                                style={{
                                    background: "rgba(5,5,20,0.6)",
                                    border: "1px solid rgba(255,255,255,0.06)",
                                    backdropFilter: "blur(20px)",
                                }}
                            >
                                <Search className="w-8 h-8 text-purple-400/25" />
                                <p className="text-purple-200/70 text-base font-medium">
                                    No matches found
                                </p>
                                <p className="text-purple-300/40 text-sm">
                                    Try a different search term or filter
                                </p>
                                <button
                                    onClick={() => {
                                        setSearchQuery("");
                                        setActiveTeam("All");
                                    }}
                                    className="mt-2 px-5 py-2 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:scale-105"
                                    style={{
                                        background:
                                            "linear-gradient(135deg,rgba(139,92,246,0.6),rgba(59,130,246,0.5))",
                                    }}
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NetworkingHub;