import React, { useState, useEffect, useRef } from "react";
import apiClient, { API_BASE_URL } from "../api/client";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faClock,
    faBell,
    faCheckCircle,
    faFlagCheckered,
    faForward,
    faInfoCircle
} from "@fortawesome/free-solid-svg-icons";
import { io } from "socket.io-client";
import Background from "../components/background";

const Realtime = () => {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [eventState, setEventState] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [timerStatus, setTimerStatus] = useState("starting_soon");
    const [notifications, setNotifications] = useState([]);
    const [flashNotification, setFlashNotification] = useState(null);

    const [currentTask, setCurrentTask] = useState(null);
    const [nextTask, setNextTask] = useState(null);
    const [previousTask, setPreviousTask] = useState(null);

    const socketRef = useRef(null);

    /* ===============================
       DATA FETCHING
    =============================== */
    const fetchEverything = async () => {
        try {
            setLoading(true);
            const [scheduleRes, stateRes, notifRes] = await Promise.all([
                apiClient.get("/api/schedule"),
                apiClient.get("/api/schedule/event"),
                apiClient.get("/api/schedule/notifications")
            ]);
            setTasks(scheduleRes.data);
            setEventState(stateRes.data);
            setNotifications(notifRes.data);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    /* ===============================
       SOCKET INTEGRATION
    =============================== */
    useEffect(() => {
        const socket = io(API_BASE_URL, { transports: ["polling", "websocket"] });
        socketRef.current = socket;

        socket.on("timer-update", (data) => {
            setEventState(data);
        });

        socket.on("new-notification", (data) => {
            setFlashNotification(data);
            setNotifications(prev => [data, ...prev]);

            // Auto-hide flash notification
            setTimeout(() => setFlashNotification(null), 10000);
        });

        return () => socket.disconnect();
    }, []);

    useEffect(() => {
        fetchEverything();
    }, []);

    /* ===============================
       TIMER ENGINE
    =============================== */
    useEffect(() => {
        if (!eventState) return;

        const interval = setInterval(() => {
            const now = Date.now();
            const start = eventState.startTime;
            const end = start + (eventState.duration || 86400000);

            if (!eventState.isLive || !start) {
                setTimerStatus("starting_soon");
                setTimeLeft(0);
                return;
            }

            if (now < start) {
                setTimerStatus("starting_soon");
                setTimeLeft(Math.floor((start - now) / 1000));
                return;
            }

            if (now >= end) {
                setTimerStatus("event_ended");
                setTimeLeft(0);
                return;
            }

            setTimerStatus("running");
            setTimeLeft(Math.floor((end - now) / 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, [eventState]);

    const formatTime = (seconds) => {
        if (timerStatus === "starting_soon" && timeLeft <= 0) return "00:00:00";
        if (timerStatus === "event_ended") return "ELAPSED";

        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    };

    /* ===============================
       TASK ENGINE
    =============================== */
    useEffect(() => {
        const updateTaskStatus = () => {
            if (tasks.length === 0 || !eventState?.startTime) return;

            const now = Date.now();
            const eventStart = eventState.startTime;

            const sorted = [...tasks].sort((a, b) => a.offsetMinutes - b.offsetMinutes);

            let cur = null;
            let nxt = null;
            let prev = null;

            sorted.forEach((task, idx) => {
                const taskTime = eventStart + (task.offsetMinutes * 60000);
                const nextTaskTime = sorted[idx + 1] ? eventStart + (sorted[idx + 1].offsetMinutes * 60000) : Infinity;

                if (now >= taskTime && now < nextTaskTime) {
                    cur = task;
                    prev = sorted[idx - 1] || null;
                    nxt = sorted[idx + 1] || null;
                }
            });

            // If event hasn't started yet, first task is next
            if (!cur && sorted.length > 0 && now < (eventStart + sorted[0].offsetMinutes * 60000)) {
                nxt = sorted[0];
            }

            setCurrentTask(cur);
            setNextTask(nxt);
            setPreviousTask(prev);
        };

        updateTaskStatus();
        const intv = setInterval(updateTaskStatus, 10000);
        return () => clearInterval(intv);
    }, [tasks, eventState]);

    return (
        <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
            <Background />

            {/* Flash Notification Overlay */}
            <AnimatePresence>
                {flashNotification && (
                    <motion.div
                        initial={{ opacity: 0, x: 100, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100 }}
                        className="fixed top-24 right-6 z-50 w-full max-w-sm"
                    >
                        <div className="bg-purple-900/40 border border-purple-500/50 backdrop-blur-2xl rounded-2xl p-6 shadow-[0_0_30px_rgba(168,85,247,0.3)] relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center shrink-0 border border-purple-500/30">
                                    <FontAwesomeIcon icon={faBell} className="text-purple-400 text-xl animate-bounce" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-purple-400 mb-1">New Announcement</h4>
                                    <p className="text-white text-sm leading-relaxed">{flashNotification.message}</p>
                                    <button
                                        onClick={() => setFlashNotification(null)}
                                        className="mt-3 text-[10px] text-purple-300/60 hover:text-purple-300 transition-colors uppercase font-bold"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative z-10 p-6 md:p-12 lg:p-20 max-w-7xl mx-auto flex flex-col items-center">

                {/* Header Section */}
                <div className="w-full flex justify-between items-center mb-12">
                    <button
                        onClick={() => navigate("/")}
                        className="group flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="text-purple-400 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-semibold tracking-wide">Home</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${eventState?.isLive ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
                        <span className="text-[10px] uppercase font-black tracking-widest text-white/40">{eventState?.isLive ? 'Live Track' : 'Static Mode'}</span>
                    </div>
                </div>

                {/* Main Countdown Wheel */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative mb-24"
                >
                    <div className="absolute inset-0 blur-[100px] bg-purple-600/10 rounded-full" />
                    <div className="relative text-center">
                        <h1 className="text-xs font-black tracking-[0.4em] uppercase text-purple-400 mb-6 flex items-center justify-center gap-3">
                            <span className="w-12 h-[1px] bg-linear-to-r from-transparent to-purple-500" />
                            {timerStatus === 'starting_soon' ? 'Starting In' : timerStatus === 'running' ? 'Time Remaining' : 'Hackathon Ended'}
                            <span className="w-12 h-[1px] bg-linear-to-l from-transparent to-purple-500" />
                        </h1>
                        <div className="text-[16vw] md:text-[8rem] font-black leading-none tabular-nums flex items-center justify-center gap-2 drop-shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                            <span className="bg-clip-text text-transparent bg-linear-to-b from-white via-white to-white/20">
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                        {timerStatus === 'running' && (
                            <div className="mt-8 flex justify-center gap-6">
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-1">Status</span>
                                    <span className="text-xs font-bold text-green-400 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                        In Progress
                                    </span>
                                </div>
                                <div className="w-[1px] h-8 bg-white/10" />
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-1">Total Duration</span>
                                    <span className="text-xs font-bold text-white/80">24 Hours</span>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">

                    {/* Schedule Column */}
                    <div className="lg:col-span-2 space-y-8">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <FontAwesomeIcon icon={faClock} className="text-purple-500" />
                            Timeline
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Previous Task */}
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 opacity-40">
                                <span className="text-[10px] uppercase font-black tracking-widest text-white/30 mb-4 block">Last Stage</span>
                                {previousTask ? (
                                    <>
                                        <h3 className="font-bold text-white mb-2">{previousTask.title}</h3>
                                        <p className="text-xs text-white/40">{previousTask.description || 'Completed successfully'}</p>
                                    </>
                                ) : (
                                    <p className="text-xs text-white/20 italic">No previous records</p>
                                )}
                            </div>

                            {/* Current Task - Highlighted */}
                            <div className="p-6 rounded-2xl bg-purple-600/5 border border-purple-500/30 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <FontAwesomeIcon icon={faCheckCircle} className="text-5xl" />
                                </div>
                                <span className="text-[10px] uppercase font-black tracking-widest text-purple-400 mb-4 block">Current Stage</span>
                                {currentTask ? (
                                    <>
                                        <h3 className="font-bold text-white text-lg mb-2">{currentTask.title}</h3>
                                        <p className="text-xs text-white/60 leading-relaxed">{currentTask.description || 'Activity in progress'}</p>
                                    </>
                                ) : (
                                    <p className="text-xs text-white/20 italic">Searching for active stage...</p>
                                )}
                            </div>

                            {/* Next Task */}
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                <span className="text-[10px] uppercase font-black tracking-widest text-white/30 mb-4 block flex items-center gap-2">
                                    Upcoming
                                    <FontAwesomeIcon icon={faForward} className="text-[8px] text-purple-500" />
                                </span>
                                {nextTask ? (
                                    <>
                                        <h3 className="font-bold text-white mb-2">{nextTask.title}</h3>
                                        <p className="text-xs text-white/40">{nextTask.description || 'Prepare for next phase'}</p>
                                    </>
                                ) : (
                                    <p className="text-xs text-white/20 italic">Event final approach</p>
                                )}
                            </div>
                        </div>

                        {/* Recent History / Notification List for Users */}
                        <div className="pt-8">
                            <h2 className="text-2xl font-bold flex items-center gap-3 mb-6">
                                <FontAwesomeIcon icon={faInfoCircle} className="text-blue-500" />
                                Notifications
                            </h2>
                            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                                {notifications.length === 0 ? (
                                    <div className="py-12 text-center">
                                        <FontAwesomeIcon icon={faBell} className="text-white/5 text-4xl mb-4" />
                                        <p className="text-white/20 text-sm">No new announcements yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {notifications.map((notif, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-5 rounded-xl bg-white/5 hover:bg-white/[0.08] transition-colors border border-transparent hover:border-white/10"
                                            >
                                                <div className="flex justify-between items-start gap-4">
                                                    <p className="text-sm text-white/80 leading-relaxed">{notif.message}</p>
                                                    <span className="text-[10px] font-bold text-white/20 whitespace-nowrap bg-black/40 px-2 py-1 rounded-md">
                                                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats / Info Sidebar */}
                    <div className="space-y-6">
                        <div className="p-8 rounded-3xl bg-linear-to-br from-indigo-600/20 to-purple-600/20 border border-purple-500/30 backdrop-blur-xl">
                            <FontAwesomeIcon icon={faFlagCheckered} className="text-3xl text-purple-400 mb-6" />
                            <h3 className="text-xl font-bold mb-2">Coherence '26</h3>
                            {/* <p className="text-sm text-white/60 leading-relaxed mb-6">
                                Welcome to the most intense 24 hours of creation. Stay tuned to this dashboard for real-time updates and schedule changes.
                            </p> */}
                            {/* <div className="space-y-4">
                                <div className="flex items-center justify-between text-xs p-3 rounded-lg bg-black/40">
                                    <span className="text-white/40">Track Status</span>
                                    <span className="text-green-400 font-bold">OPTIMIZED</span>
                                </div>
                                <div className="flex items-center justify-between text-xs p-3 rounded-lg bg-black/40">
                                    <span className="text-white/40">Real-time Feed</span>
                                    <span className="text-blue-400 font-bold">CONNECTED</span>
                                </div>
                            </div> */}
                        </div>

                        {/* <div className="p-8 rounded-3xl bg-white/5 border border-white/10">
                            <h4 className="text-xs uppercase tracking-widest font-black text-white/30 mb-6">Need Help?</h4>
                            <p className="text-sm text-white/50 mb-6">If you encounter issues during the event, reach out to the nearest MLSC coordinator or visit the HQ.</p>
                            <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 transition-all text-xs font-bold uppercase tracking-widest">
                                Contact Organizers
                            </button>
                        </div> */}
                    </div>

                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(168, 85, 247, 0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(168, 85, 247, 0.4);
                }
            `}</style>
        </div>
    );
};

export default Realtime;