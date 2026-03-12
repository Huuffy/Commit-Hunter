import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChartBar,
    faLock,
    faArrowRight,
    faTools,
} from "@fortawesome/free-solid-svg-icons";
import Background from "../components/background";

const ADMIN_PASSWORD = "mlscmlsc";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);

    useEffect(() => {
        const auth = sessionStorage.getItem("adminAuthenticated");
        if (auth === "true") {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            sessionStorage.setItem("adminAuthenticated", "true");
            // Also set commitAccess for consistency since it's the same level
            sessionStorage.setItem("commitAccess", "true");
            setIsAuthenticated(true);
            setError(false);
        } else {
            setError(true);
        }
    };

    const adminFeatures = [
        {
            title: "Commit Analyzer",
            description: "Monitor GitHub activity and performance metrics.",
            icon: faChartBar,
            path: "/admin/commit-analyzer",
            color: "from-blue-500 to-indigo-600"
        },
    ];

    if (!isAuthenticated) {
        return (
            <div className="relative min-h-screen flex items-center justify-center bg-black text-white px-4">
                <Background />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 w-full max-w-md p-8 rounded-2xl border border-purple-500/20 bg-slate-900/50 backdrop-blur-xl shadow-2xl text-center"
                >
                    <div className="w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-purple-500/30">
                        <FontAwesomeIcon icon={faLock} className="text-3xl text-purple-400" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Admin Access</h1>
                    <p className="text-purple-300/60 mb-8 uppercase tracking-widest text-xs">Enter code to proceed</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter Admin Password"
                            className={`w-full bg-black/40 border ${error ? 'border-red-500' : 'border-purple-500/30'} rounded-xl px-4 py-3 text-center text-white focus:outline-none focus:border-purple-500 transition-all`}
                            autoFocus
                        />
                        {error && <p className="text-red-400 text-xs">Incorrect password</p>}
                        <button
                            type="submit"
                            className="w-full bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 py-3 rounded-xl font-bold transition-all shadow-lg shadow-purple-900/20"
                        >
                            Unlock Console
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-black text-white p-8 md:p-16">
            <Background />

            <div className="relative z-10 max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-purple-400 to-pink-400 flex items-center gap-4">
                            <FontAwesomeIcon icon={faTools} className="text-purple-500" />
                            Admin Console
                        </h1>
                        <p className="text-purple-300/60 mt-2 tracking-widest uppercase text-sm">Control Center for Coherence '26</p>
                    </div>

                    <button
                        onClick={() => {
                            sessionStorage.removeItem("adminAuthenticated");
                            sessionStorage.removeItem("commitAccess");
                            window.location.reload();
                        }}
                        className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all text-sm font-medium"
                    >
                        Lock Console
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {adminFeatures.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -5 }}
                        >
                            <Link
                                to={feature.path}
                                className="block h-full p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 backdrop-blur-md transition-all group"
                            >
                                <div className={`w-14 h-14 bg-linear-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 shadow-lg`}>
                                    <FontAwesomeIcon icon={feature.icon} className="text-2xl text-white" />
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">{feature.title}</h2>
                                        <p className="text-gray-400 leading-relaxed max-w-xs">{feature.description}</p>
                                    </div>
                                    <FontAwesomeIcon icon={faArrowRight} className="text-gray-600 group-hover:text-purple-500 transition-all group-hover:translate-x-1" />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;
