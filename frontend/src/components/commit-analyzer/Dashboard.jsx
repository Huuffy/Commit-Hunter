import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAlt, faSearch, faUsers } from "@fortawesome/free-solid-svg-icons";
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
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);

    useEffect(() => {
        fetchTeams();
    }, []);

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
                    <span className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                        Static Mode
                    </span>

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
