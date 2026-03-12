import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faStop, faFileAlt, faSearch, faSortAmountDown, faSortAmountUp, faUsers, faSync } from "@fortawesome/free-solid-svg-icons";
import commitAnalyzerClient from "../../api/commitAnalyzerClient";
import SecurityCheckModal from "./SecurityCheckModal";

// Module-level cache so data persists across mounts/navigations
let _cachedTeams = null;

const Dashboard = () => {
    const navigate = useNavigate();
    const [teams, setTeams] = useState(_cachedTeams || []);
    const [loading, setLoading] = useState(!_cachedTeams);
    const [searchQuery, setSearchQuery] = useState("");

    // UI States
    const [eventStatus, setEventStatus] = useState("idle"); // idle, running
    const [showStopModal, setShowStopModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        // LocalStorage Fallback for persistence
        const storedStatus = localStorage.getItem("mlsc_event_status");
        if (storedStatus) {
            setEventStatus(storedStatus);
        }

        fetchTeams();
        fetchEventStatus();

        // Background refresh every 30s
        const interval = setInterval(() => {
            fetchTeamsBackground();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchEventStatus = async () => {
        try {
            console.log("Fetching event status...");
            const res = await commitAnalyzerClient.get("/api/v1/collect/event-status");
            console.log("Event Status Response Raw:", res);
            console.log("Event Status Data:", res.data);

            // Handle text response or JSON
            let status = "idle";
            if (typeof res.data === 'string') {
                status = res.data;
            } else if (res.data) {
                status = res.data.status || res.data.eventStatus || (res.data.isRunning ? "running" : "idle");
            }

            console.log("Derived Status:", status);

            // Logic to prevent backend reset from clearing frontend state if backend is stateless
            // If we have 'running' locally, and backend says 'idle', it might have just restarted.
            // For this specific user request ("not persistent"), we trust local more if backend is idle.
            const stored = localStorage.getItem("mlsc_event_status");
            if (status === "idle" && stored === "running") {
                console.warn("Backend returned idle but localStorage says running. Keeping running.");
            } else {
                setEventStatus(status);
                localStorage.setItem("mlsc_event_status", status);
            }
        } catch (error) {
            console.error("Failed to fetch event status", error);
        }
    };

    const fetchTeams = async () => {
        try {
            if (!_cachedTeams) setLoading(true);
            const res = await commitAnalyzerClient.get("/api/v1/history/teams");
            const data = Array.isArray(res.data) ? res.data : (res.data.teams || []);
            const sorted = data.sort((a, b) => (b.commit_count || 0) - (a.commit_count || 0));
            _cachedTeams = sorted;
            setTeams(sorted);
        } catch (error) {
            console.error("Failed to fetch teams:", error);
        } finally {
            setLoading(false);
        }
    };

    // Silent background refresh — no loading spinner
    const fetchTeamsBackground = async () => {
        try {
            const res = await commitAnalyzerClient.get("/api/v1/history/teams");
            const data = Array.isArray(res.data) ? res.data : (res.data.teams || []);
            const sorted = data.sort((a, b) => (b.commit_count || 0) - (a.commit_count || 0));
            _cachedTeams = sorted;
            setTeams(sorted);
        } catch (error) {
            // Silent fail — don't disrupt UI
        }
    };

    const handleStartEvent = async () => {
        try {
            setActionLoading(true);
            const res = await commitAnalyzerClient.post("/api/v1/collect/start-event", {}); // Send empty body
            console.log("Start Event Response:", res);

            if (res.data.success || res.status === 200 || res.status === 201) {
                // Check multiple potential status fields
                const newStatus = res.data.status || res.data.eventStatus || "running";
                setEventStatus(newStatus);
                localStorage.setItem("mlsc_event_status", newStatus);
            } else {
                alert("Failed to start event: " + (res.data.message || "Unknown error"));
            }
        } catch (error) {
            console.error("Start failed:", error);
            alert("Error starting event: " + (error.response?.data?.message || error.message));
        } finally {
            setActionLoading(false);
        }
    };

    const handleStopEvent = async () => {
        try {
            setActionLoading(true);
            const res = await commitAnalyzerClient.post("/api/v1/collect/end-event", {});
            console.log("Stop Event Response:", res);
            if (res.data.success || res.status === 200) {
                const newStatus = res.data.status || res.data.eventStatus || "idle";
                setEventStatus(newStatus);
                localStorage.setItem("mlsc_event_status", newStatus);
            } else {
                alert("Failed to stop event: " + (res.data.message || "Unknown error"));
            }
        } catch (error) {
            console.error("Stop failed:", error);
            alert("Error stopping event: " + (error.response?.data?.message || error.message));
        } finally {
            setActionLoading(false);
        }
    };

    const handleRefreshEvent = async () => {
        try {
            setActionLoading(true);
            await commitAnalyzerClient.post("/api/v1/collect/refresh");
            // Also refresh team data
            await fetchTeams();
        } catch (error) {
            console.error("Refresh failed:", error);
        } finally {
            setActionLoading(false);
        }
    };

    const unlockReport = () => {
        if (selectedTeam) {
            navigate(`/admin/commit-analyzer/report/${selectedTeam.team_name}`);
        }
    };

    const filteredTeams = teams.filter(t =>
        t.team_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="relative z-10 p-6 md:p-10 max-w-7xl mx-auto text-white">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                        GitHub Commit Analyzer
                    </h1>
                    <p className="text-purple-300/60 mt-1">Hackathon Status & Performance Overview</p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={handleStartEvent}
                        disabled={eventStatus === "running" || actionLoading}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all ${eventStatus === "running"
                                ? "bg-green-500/20 text-green-400 border border-green-500/30 cursor-default"
                                : "bg-green-600 hover:bg-green-500 text-white shadow-lg hover:shadow-green-500/25"
                            }`}
                    >
                        <FontAwesomeIcon icon={faPlay} className="text-sm" />
                        {eventStatus === "running" ? "Event Running" : "Start Event"}
                    </button>

                    <button
                        onClick={() => setShowStopModal(true)}
                        disabled={actionLoading}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 transition-all"
                    >
                        <FontAwesomeIcon icon={faStop} className="text-sm" />
                        Stop Event
                    </button>

                    <button
                        onClick={handleRefreshEvent}
                        disabled={actionLoading}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-500/50 transition-all ml-2"
                        title="Refresh Data"
                    >
                        <FontAwesomeIcon icon={faSync} className={`text-sm ${actionLoading ? "animate-spin" : ""}`} />
                    </button>

                    <button
                        onClick={() => {
                            sessionStorage.removeItem("commitAccess");
                            window.location.reload();
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-slate-800 text-slate-400 hover:text-white transition-all ml-2"
                    >
                        Lock
                    </button>
                </div>
            </div>

            {/* Stats Overview (Optional Placeholder) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white/5 border border-purple-500/10 rounded-2xl p-6 backdrop-blur-md">
                    <h3 className="text-purple-300/70 text-sm font-medium uppercase tracking-wider">Active Teams</h3>
                    <p className="text-3xl font-bold mt-2">{teams.length}</p>
                </div>
                <div className="bg-white/5 border border-purple-500/10 rounded-2xl p-6 backdrop-blur-md">
                    <h3 className="text-purple-300/70 text-sm font-medium uppercase tracking-wider">Total Commits</h3>
                    <p className="text-3xl font-bold mt-2">
                        {teams.reduce((acc, t) => acc + (t.commit_count || 0), 0)}
                    </p>
                </div>
                <div className="bg-white/5 border border-purple-500/10 rounded-2xl p-6 backdrop-blur-md">
                    <h3 className="text-purple-300/70 text-sm font-medium uppercase tracking-wider">Avg. Additions</h3>
                    <p className="text-3xl font-bold mt-2">
                        {teams.length > 0 ? Math.round(teams.reduce((acc, t) => acc + (t.additions || 0), 0) / teams.length) : 0}
                    </p>
                </div>
            </div>

            {/* Teams Table Section */}
            <div className="bg-slate-900/40 border border-purple-500/10 rounded-2xl overflow-hidden backdrop-blur-md">
                {/* Table Toolbar */}
                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between gap-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <FontAwesomeIcon icon={faUsers} className="text-purple-400" />
                        Participating Teams
                    </h2>

                    <div className="relative">
                        <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search teams..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-hidden focus:border-purple-500/50 w-full md:w-64 transition-colors"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 text-purple-200/60 text-xs uppercase tracking-wider">
                                <th className="p-5 font-medium">Team</th>
                                <th className="p-5 font-medium text-center">Commits</th>
                                <th className="p-5 font-medium text-center">Additions / Deletions</th>
                                <th className="p-5 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="p-12 text-center text-gray-500">
                                        Loading team data...
                                    </td>
                                </tr>
                            ) : filteredTeams.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-12 text-center text-gray-500">
                                        No teams found
                                    </td>
                                </tr>
                            ) : (
                                filteredTeams.map((team) => (
                                    <tr key={team._id || team.team_name} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="p-5">
                                            <div className="font-medium text-white">{team.team_name || "Unknown Team"}</div>
                                            <div className="text-xs text-gray-500 mt-1">{team.repo_url || "No Repo"}</div>
                                        </td>
                                        <td className="p-5 text-center">
                                            <span className="inline-block px-3 py-1 bg-purple-500/10 text-purple-300 rounded-full text-xs font-semibold">
                                                {team.commit_count || 0}
                                            </span>
                                        </td>
                                        <td className="p-5 text-center text-sm text-gray-400">
                                            <span className="text-green-400/80">+{team.additions || 0}</span>
                                            <span className="mx-2">/</span>
                                            <span className="text-red-400/80">-{team.deletions || 0}</span>
                                        </td>
                                        <td className="p-5 text-right">
                                            <button
                                                onClick={() => {
                                                    setSelectedTeam(team);
                                                    setShowReportModal(true);
                                                }}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-purple-300 hover:text-white transition-all text-sm font-medium border border-transparent hover:border-purple-500/30"
                                            >
                                                <FontAwesomeIcon icon={faFileAlt} />
                                                Get Report
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            <SecurityCheckModal
                isOpen={showStopModal}
                onClose={() => setShowStopModal(false)}
                onSuccess={handleStopEvent}
                title="Confirm Stop Event"
                actionButtonText="Stop Event"
            />

            <SecurityCheckModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                onSuccess={unlockReport}
                title="Access Sensitive Report"
                actionButtonText="Unlock Report"
            />

        </div>
    );
};

export default Dashboard;
