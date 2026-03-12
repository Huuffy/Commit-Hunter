import React, { useState, useEffect } from "react";
import apiClient from "../api/client";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faClock,
    faPlay,
    faStop,
    faRedo,
    faBell,
    faPaperPlane,
    faArrowLeft,
    faCalendarAlt,
    faTrash
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import Background from "../components/background";

const RealtimeAdmin = () => {
    const [startTime, setStartTime] = useState("");
    const [eventState, setEventState] = useState({ isLive: false, startTime: null });
    const [notification, setNotification] = useState("");
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchStatus = async () => {
        try {
            const { data } = await apiClient.get("/api/schedule/event");
            setEventState(data);
            if (data.startTime) {
                // Formatting for datetime-local input
                const date = new Date(data.startTime);
                const offset = date.getTimezoneOffset() * 60000;
                const localISOTime = new Date(date - offset).toISOString().slice(0, 16);
                setStartTime(localISOTime);
            }
        } catch (error) {
            console.error("Fetch status failed:", error);
        }
    };

    const fetchNotifications = async () => {
        try {
            const { data } = await apiClient.get("/api/schedule/notifications");
            setNotifications(data);
        } catch (error) {
            console.error("Fetch notifications failed:", error);
        }
    };

    useEffect(() => {
        fetchStatus();
        fetchNotifications();
    }, []);

    const handleStart = async () => {
        if (!startTime) {
            showToast("Please select a start time", "error");
            return;
        }
        setLoading(true);
        try {
            await apiClient.post("/api/schedule/event/start", { startTime });
            showToast("Timer started successfully");
            fetchStatus();
        } catch (error) {
            showToast("Failed to start timer", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleStop = async () => {
        setLoading(true);
        try {
            await apiClient.post("/api/schedule/event/stop");
            showToast("Timer stopped");
            fetchStatus();
        } catch (error) {
            showToast("Failed to stop timer", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async () => {
        if (!window.confirm("Are you sure you want to reset the timer?")) return;
        setLoading(true);
        try {
            await apiClient.post("/api/schedule/event/reset");
            showToast("Timer reset");
            setStartTime("");
            fetchStatus();
        } catch (error) {
            showToast("Failed to reset timer", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSendNotification = async (e) => {
        e.preventDefault();
        if (!notification.trim()) return;
        try {
            await apiClient.post("/api/schedule/notifications", { message: notification });
            showToast("Notification sent");
            setNotification("");
            fetchNotifications();
        } catch (error) {
            showToast("Failed to send notification", "error");
        }
    };

    const handleDeleteNotification = async (id) => {
        if (!window.confirm("Delete this notification?")) return;
        try {
            await apiClient.delete(`/api/schedule/notifications/${id}`);
            showToast("Notification deleted");
            fetchNotifications();
        } catch (error) {
            showToast("Failed to delete notification", "error");
        }
    };

    return (
        <div className="relative min-h-screen bg-black text-white p-6 md:p-12">
            <Background />

            <div className="relative z-10 max-w-4xl mx-auto">
                <div className="mb-10 flex items-center justify-between">
                    <Link to="/admin" className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2">
                        <FontAwesomeIcon icon={faArrowLeft} />
                        <span>Admin Console</span>
                    </Link>
                    <div className={`px-4 py-1.5 rounded-full border text-xs font-bold tracking-widest uppercase flex items-center gap-2 ${eventState.isLive ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${eventState.isLive ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                        {eventState.isLive ? 'Timer Live' : 'Timer Inactive'}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Timer Controls */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-slate-900/50 border border-white/10 rounded-2xl p-8 backdrop-blur-xl"
                    >
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-purple-400">
                            <FontAwesomeIcon icon={faClock} />
                            Timer Management
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2 uppercase tracking-widest">Set Event Start Time</label>
                                <div className="relative">
                                    <FontAwesomeIcon icon={faCalendarAlt} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400/50" />
                                    <input
                                        type="datetime-local"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-purple-500 transition-all text-white"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-500 mt-2 italic">A 24-hour countdown will automatically begin from this time.</p>
                            </div>

                            <div className="flex flex-wrap gap-4 pt-4">
                                <button
                                    onClick={handleStart}
                                    disabled={loading || eventState.isLive}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition-all shadow-lg shadow-green-900/20 text-white"
                                >
                                    <FontAwesomeIcon icon={faPlay} />
                                    Start
                                </button>
                                <button
                                    onClick={handleStop}
                                    disabled={loading || !eventState.isLive}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition-all shadow-lg shadow-red-900/20 text-white"
                                >
                                    <FontAwesomeIcon icon={faStop} />
                                    Stop
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold transition-all text-white"
                                >
                                    <FontAwesomeIcon icon={faRedo} />
                                    Reset Timer
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Notifications */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-slate-900/50 border border-white/10 rounded-2xl p-8 backdrop-blur-xl flex flex-col h-full"
                    >
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-blue-400">
                            <FontAwesomeIcon icon={faBell} />
                            Announcements
                        </h2>

                        <form onSubmit={handleSendNotification} className="mb-8">
                            <label className="block text-sm text-gray-400 mb-2 uppercase tracking-widest">Broadcast Message</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={notification}
                                    onChange={(e) => setNotification(e.target.value)}
                                    placeholder="Type important update..."
                                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-all text-white"
                                />
                                <button
                                    type="submit"
                                    className="aspect-square w-12 flex items-center justify-center bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-lg shadow-blue-900/20 text-white"
                                >
                                    <FontAwesomeIcon icon={faPaperPlane} />
                                </button>
                            </div>
                        </form>

                        <div className="flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                            <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-4">Message History</h3>
                            <div className="space-y-3">
                                {notifications.length === 0 ? (
                                    <p className="text-center text-gray-600 text-sm py-8 italic">No notifications sent yet.</p>
                                ) : (
                                    notifications.map((notif, idx) => (
                                        <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5 text-sm group relative">
                                            <div className="pr-8">
                                                <p className="text-purple-100">{notif.message}</p>
                                                <p className="text-[10px] text-gray-500 mt-1">{new Date(notif.timestamp).toLocaleString()}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteNotification(notif._id)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500/0 group-hover:text-red-500/60 hover:text-red-500 transition-all p-2"
                                                title="Delete Notification"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className={`fixed bottom-8 right-8 px-6 py-3 rounded-xl shadow-2xl z-50 text-sm font-bold border ${toast.type === 'error' ? 'bg-red-900/80 border-red-500/50 text-red-200' : 'bg-purple-900/80 border-purple-500/50 text-purple-200'}`}
                    >
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RealtimeAdmin;