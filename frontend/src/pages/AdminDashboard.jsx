import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChartBar,
    faArrowRight,
    faTools,
} from "@fortawesome/free-solid-svg-icons";
import Background from "../components/background";

const AdminDashboard = () => {
    const adminFeatures = [
        {
            title: "Commit Analyzer",
            description: "Monitor GitHub activity and performance metrics.",
            icon: faChartBar,
            path: "/admin/commit-analyzer",
            color: "from-blue-500 to-indigo-600"
        },
    ];

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
