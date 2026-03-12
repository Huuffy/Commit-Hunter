import React from "react";
import { motion } from "framer-motion";
import { Linkedin, Github, GraduationCap, Users, Quote, ExternalLink, User } from "lucide-react";

/**
 * Premium Participant Card
 * Features: 
 * - Deep glassmorphism
 * - Animated border hover effect
 * - Subtle tilt on desktop
 * - Clear visual hierarchy
 */
const ParticipantCard = ({ user }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
            className="group relative h-full flex flex-col rounded-[24px] overflow-hidden"
            style={{
                background: "rgba(13, 13, 25, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(24px)",
                boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.5)",
            }}
        >
            {/* ── Animated Gradient Border (Hover Only) ── */}
            <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-[-2px] bg-linear-to-r from-purple-500 via-blue-500 to-purple-500 animate-pulse blur-[1px]" />
                <div className="absolute inset-[1px] bg-[#0d0d19] rounded-[23px]" />
            </div>

            {/* ── Top Decoration: Mesh Glow ── */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[60px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/5 blur-[50px] pointer-events-none" />

            <div className="relative z-10 p-6 flex flex-col h-full gap-5">
                {/* ── Header: Identity Section ── */}
                <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                        {/* Avatar Ring */}
                        <div className="absolute -inset-1 rounded-full bg-linear-to-tr from-purple-500/50 via-blue-500/50 to-purple-500/50 blur-[2px] opacity-40 group-hover:opacity-100 group-hover:rotate-180 transition-all duration-700" />

                        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 bg-black/40">
                            {user.imageUrl ? (
                                <img
                                    src={user.imageUrl}
                                    alt={user.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-purple-500/5">
                                    <User className="w-8 h-8 text-purple-400/30" />
                                </div>
                            )}
                        </div>

                        {/* Status Dot */}
                        <div className="absolute bottom-0 right-1 w-3.5 h-3.5 rounded-full border-2 border-[#0d0d19] bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                    </div>

                    <div className="min-w-0 flex-1 pt-1">
                        <h3 className="text-lg font-bold text-white tracking-tight leading-tight group-hover:text-purple-300 transition-colors duration-300 truncate">
                            {user.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-purple-200/40 text-[11px] font-medium mt-1 uppercase tracking-wider">
                            <GraduationCap className="w-3 h-3 text-purple-400/70" />
                            <span className="truncate">{user.college}</span>
                        </div>
                    </div>
                </div>

                {/* ── Team Section ── */}
                {user.teamName && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 group-hover:border-purple-500/30 transition-colors duration-300 w-fit">
                        <Users className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-[11px] font-bold text-white/70 tracking-wide uppercase">
                            {user.teamName}
                        </span>
                    </div>
                )}

                {/* ── Bio Section ── */}
                <div className="relative flex-1 group/bio">
                    <Quote className="absolute -top-2 -left-3 w-8 h-8 text-purple-500/10 rotate-180" />
                    <p className="text-white/60 text-sm leading-relaxed line-clamp-3 italic relative z-10 px-1 font-medium">
                        {user.bio || "No bio available. Just here for the hackathon vibes!"}
                    </p>
                </div>

                {/* ── Footer: Connectivity ── */}
                <div className="pt-5 mt-auto border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {user.linkedin && (
                            <motion.a
                                whileHover={{ scale: 1.1, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                href={user.linkedin}
                                target="_blank"
                                rel="noreferrer"
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 border border-blue-500/20 transition-all"
                                title="LinkedIn Profile"
                            >
                                <Linkedin className="w-4 h-4" />
                            </motion.a>
                        )}
                        {user.github && (
                            <motion.a
                                whileHover={{ scale: 1.1, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                href={user.github}
                                target="_blank"
                                rel="noreferrer"
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 text-white/50 hover:text-white hover:bg-white/10 border border-white/10 transition-all"
                                title="GitHub Repository"
                            >
                                <Github className="w-4 h-4" />
                            </motion.a>
                        )}
                    </div>

                    <button
                        className="group/btn flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 hover:text-white transition-all duration-300 overflow-hidden relative"
                    >
                        <span className="relative z-10">Connect</span>
                        <ExternalLink className="w-3 h-3 relative z-10 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />

                        <div className="absolute inset-0 bg-linear-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                    </button>
                </div>
            </div>

            {/* ── Subtle Background Pattern ── */}
            <div
                className="absolute inset-0 opacity-[0.02] pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(#fff 1px, transparent 1px)`,
                    backgroundSize: '20px 20px'
                }}
            />
        </motion.div>
    );
};

export default ParticipantCard;
