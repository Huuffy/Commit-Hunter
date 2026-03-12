import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
    User, GraduationCap, Users, FileText, Linkedin, Github,
    Camera, ArrowRight, ArrowLeft, ChevronDown,
} from "lucide-react";
import apiClient from "../api/client";
import Background from "../components/background";

/* ─── tiny cn helper (no shadcn needed) ─── */
const cn = (...classes) => classes.filter(Boolean).join(" ");

/* ─── Reusable glass input matching sign-in-card-2 style ─── */
function GlassInput({ icon: Icon, error, className, inputId, ...props }) {
    const [focused, setFocused] = useState(false);
    return (
        <div className="relative">
            <div className="relative flex items-center overflow-hidden rounded-lg">
                {Icon && (
                    <Icon className={cn(
                        "absolute left-3 w-4 h-4 transition-all duration-300 pointer-events-none",
                        focused ? "text-white" : "text-white/40"
                    )} />
                )}
                <input
                    {...props}
                    onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
                    onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
                    className={cn(
                        "w-full bg-white/5 border border-transparent text-white placeholder:text-white/30",
                        /* h-11 = 44px touch target on mobile, h-10 on sm+ */
                        "h-11 sm:h-10 rounded-lg transition-all duration-300",
                        /* text-base (16px) prevents iOS auto-zoom on focus */
                        "text-base sm:text-sm",
                        "focus:border-white/20 focus:bg-white/10 focus:outline-none",
                        Icon ? "pl-10 pr-3" : "px-3",
                        error && "border-red-500/50",
                        className
                    )}
                />
                {focused && (
                    <motion.div
                        layoutId="glass-highlight"
                        className="absolute inset-0 bg-white/5 -z-10 rounded-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    />
                )}
            </div>
            {error && <p className="text-red-400 text-xs mt-1 ml-1">{error}</p>}
        </div>
    );
}

/* ─── Glass textarea ─── */
function GlassTextarea({ icon: Icon, error, className, ...props }) {
    const [focused, setFocused] = useState(false);
    return (
        <div className="relative">
            <div className="relative flex overflow-hidden rounded-lg">
                {Icon && (
                    <Icon className={cn(
                        "absolute left-3 top-3.5 w-4 h-4 transition-all duration-300 pointer-events-none",
                        focused ? "text-white" : "text-white/40"
                    )} />
                )}
                <textarea
                    {...props}
                    onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
                    onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
                    className={cn(
                        "w-full bg-white/5 border border-transparent text-white placeholder:text-white/30",
                        "rounded-lg transition-all duration-300 py-3",
                        /* text-base prevents iOS auto-zoom */
                        "text-base sm:text-sm",
                        "focus:border-white/20 focus:bg-white/10 focus:outline-none resize-none",
                        Icon ? "pl-10 pr-3" : "px-3",
                        error && "border-red-500/50",
                        className
                    )}
                />
            </div>
            {error && <p className="text-red-400 text-xs mt-1 ml-1">{error}</p>}
        </div>
    );
}

/* ─── Glass select ─── */
function GlassSelect({ icon: Icon, error, children, className, ...props }) {
    const [focused, setFocused] = useState(false);
    return (
        <div className="relative">
            <div className="relative flex items-center overflow-hidden rounded-lg">
                {Icon && (
                    <Icon className={cn(
                        "absolute left-3 w-4 h-4 transition-all duration-300 pointer-events-none",
                        focused ? "text-white" : "text-white/40"
                    )} />
                )}
                <ChevronDown className="absolute right-3 w-4 h-4 text-white/40 pointer-events-none" />
                <select
                    {...props}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    className={cn(
                        "w-full bg-white/5 border border-transparent text-white appearance-none",
                        /* h-11 touch target on mobile */
                        "h-11 sm:h-10 rounded-lg transition-all duration-300",
                        /* text-base prevents iOS auto-zoom */
                        "text-base sm:text-sm",
                        "focus:border-white/20 focus:bg-white/10 focus:outline-none",
                        Icon ? "pl-10 pr-8" : "px-3 pr-8",
                        error && "border-red-500/50",
                        className
                    )}
                >
                    {children}
                </select>
            </div>
            {error && <p className="text-red-400 text-xs mt-1 ml-1">{error}</p>}
        </div>
    );
}

/* ─── Section label ─── */
const SectionLabel = ({ children }) => (
    <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-medium mb-2 ml-0.5">
        {children}
    </p>
);

/* ═══════════════════════════════════════════════════════════
   Main component
   ═══════════════════════════════════════════════════════════ */
const NetworkingForm = () => {
    const navigate = useNavigate();
    const fileRef = useRef(null);

    const [loading, setLoading] = useState(false);
    /* Disable 3D tilt on mobile — pointer:coarse covers finger devices,
       width check covers any edge cases where synthetic mouse events fire */
    const [isTouch, setIsTouch] = useState(
        typeof window !== "undefined" &&
        (window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768)
    );
    useEffect(() => {
        const update = () =>
            setIsTouch(window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768);
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [teams, setTeams] = useState([]);
    const [teamCounts, setTeamCounts] = useState({});
    const [errors, setErrors] = useState({});

    const [form, setForm] = useState({
        name: "",
        college: "",
        bio: "",
        linkedin: "",
        github: "",
        teamName: "",
    });

    const LinkedInRegex = /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-_%]+\/?$/;
    const GitHubRegex = /^https:\/\/(www\.)?github\.com\/[a-zA-Z0-9-_%]+\/?$/;

    /* 3D card tilt — mouse-only, locked at 0 on touch so stray synthetic events can't tilt */
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useTransform(mouseY, [-300, 300], [8, -8]);
    const rotateY = useTransform(mouseX, [-300, 300], [-8, 8]);

    const handleMouseMove = (e) => {
        if (isTouch) return;
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left - rect.width / 2);
        mouseY.set(e.clientY - rect.top - rect.height / 2);
    };
    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    useEffect(() => {
        const submitted = localStorage.getItem("networkingFormSubmitted");
        if (submitted) navigate("/networking");
        fetchTeams();
        fetchTeamCounts();
    }, []);

    const fetchTeams = async () => {
        try {
            const res = await apiClient.get("/api/teams/shortlisted");
            const allTeams =
                res.data?.tracks?.flatMap((track) =>
                    track.teams.map((team) => ({
                        _id: team._id,
                        teamName: team.teamName,
                        trackName: track.trackName,
                    }))
                ) || [];
            setTeams(allTeams);
        } catch (error) {
            console.log("Team fetch error:", error);
        }
    };

    const fetchTeamCounts = async () => {
        try {
            const res = await apiClient.get("/api/participants");
            const counts = {};
            res.data.participants.forEach((p) => {
                counts[p.teamName] = (counts[p.teamName] || 0) + 1;
            });
            setTeamCounts(counts);
        } catch (error) {
            console.log("Team count fetch error:", error);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setErrors({ ...errors, image: "Only image files are allowed" });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setErrors({ ...errors, image: "Image must be under 5 MB" });
            return;
        }
        setImage(file);
        setPreview(URL.createObjectURL(file));
        setErrors({ ...errors, image: "" });
    };

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = "Name is required";
        if (!form.college.trim()) e.college = "College is required";
        if (!form.teamName) e.teamName = "Select a team";
        if (!form.bio.trim()) e.bio = "Bio is required";
        if (!LinkedInRegex.test(form.linkedin)) e.linkedin = "Enter a valid LinkedIn profile URL";
        if (!GitHubRegex.test(form.github)) e.github = "Enter a valid GitHub profile URL";
        if (!image) e.image = "Upload a profile photo";
        if (teamCounts[form.teamName] >= 4) e.teamName = "This team already has 4 members";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setLoading(true);
            const imageData = new FormData();
            imageData.append("image", image);
            const uploadRes = await apiClient.post("/api/upload", imageData);
            const imageUrl = uploadRes.data.imageUrl;

            await apiClient.post("/api/participants", { ...form, imageUrl });

            localStorage.setItem("networkingFormSubmitted", "true");
            navigate("/networking");
        } catch (error) {
            console.error(error);
            setErrors({ submit: error.response?.data?.message || "Something went wrong" });
        } finally {
            setLoading(false);
        }
    };

    /* ─── RENDER ─── */
    return (
        <div className="min-h-screen w-full relative overflow-x-hidden flex items-start justify-center pt-6 pb-12 sm:pt-12 px-4">
            <Background />

            {/* ── Card wrapper with 3D tilt (disabled on touch devices) ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-sm sm:max-w-lg relative z-10"
                style={isTouch ? {} : { perspective: 1500 }}
            >
                <motion.div
                    className="relative"
                    style={isTouch ? {} : { rotateX, rotateY }}
                    onMouseMove={isTouch ? undefined : handleMouseMove}
                    onMouseLeave={isTouch ? undefined : handleMouseLeave}
                    whileHover={isTouch ? {} : { z: 10 }}
                >
                    <div className="relative group">
                        {/* Card hover glow */}
                        <motion.div
                            className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-70 transition-opacity duration-700"
                            animate={{
                                boxShadow: [
                                    "0 0 10px 2px rgba(255,255,255,0.03)",
                                    "0 0 15px 5px rgba(255,255,255,0.05)",
                                    "0 0 10px 2px rgba(255,255,255,0.03)",
                                ],
                                opacity: [0.2, 0.4, 0.2],
                            }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
                        />

                        {/* ── Traveling border beams ── */}
                        <div className="absolute -inset-px rounded-2xl overflow-hidden">
                            {/* Top beam */}
                            <motion.div
                                className="absolute top-0 left-0 h-0.75 w-[50%] bg-linear-to-r from-transparent via-white to-transparent opacity-70"
                                initial={{ filter: "blur(2px)" }}
                                animate={{ left: ["-50%", "100%"], opacity: [0.3, 0.7, 0.3], filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"] }}
                                transition={{ left: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror" }, filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror" } }}
                            />
                            {/* Right beam */}
                            <motion.div
                                className="absolute top-0 right-0 h-[50%] w-0.75 bg-linear-to-b from-transparent via-white to-transparent opacity-70"
                                initial={{ filter: "blur(2px)" }}
                                animate={{ top: ["-50%", "100%"], opacity: [0.3, 0.7, 0.3], filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"] }}
                                transition={{ top: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 0.6 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 0.6 }, filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 0.6 } }}
                            />
                            {/* Bottom beam */}
                            <motion.div
                                className="absolute bottom-0 right-0 h-0.75 w-[50%] bg-linear-to-r from-transparent via-white to-transparent opacity-70"
                                initial={{ filter: "blur(2px)" }}
                                animate={{ right: ["-50%", "100%"], opacity: [0.3, 0.7, 0.3], filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"] }}
                                transition={{ right: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 1.2 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 1.2 }, filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 1.2 } }}
                            />
                            {/* Left beam */}
                            <motion.div
                                className="absolute bottom-0 left-0 h-[50%] w-0.75 bg-linear-to-b from-transparent via-white to-transparent opacity-70"
                                initial={{ filter: "blur(2px)" }}
                                animate={{ bottom: ["-50%", "100%"], opacity: [0.3, 0.7, 0.3], filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"] }}
                                transition={{ bottom: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 1.8 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 1.8 }, filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 1.8 } }}
                            />

                            {/* Corner glow dots */}
                            {[
                                { pos: "top-0 left-0", size: "h-[5px] w-[5px]", opacity: "white/40", blur: "blur-[1px]", delay: 0 },
                                { pos: "top-0 right-0", size: "h-[8px] w-[8px]", opacity: "white/60", blur: "blur-[2px]", delay: 0.5 },
                                { pos: "bottom-0 right-0", size: "h-[8px] w-[8px]", opacity: "white/60", blur: "blur-[2px]", delay: 1 },
                                { pos: "bottom-0 left-0", size: "h-[5px] w-[5px]", opacity: "white/40", blur: "blur-[1px]", delay: 1.5 },
                            ].map((dot, i) => (
                                <motion.div
                                    key={i}
                                    className={`absolute ${dot.pos} ${dot.size} rounded-full bg-${dot.opacity} ${dot.blur}`}
                                    animate={{ opacity: [0.2, 0.4, 0.2] }}
                                    transition={{ duration: 2 + i * 0.1, repeat: Infinity, repeatType: "mirror", delay: dot.delay }}
                                />
                            ))}
                        </div>

                        {/* Border glow on hover */}
                        <div className="absolute -inset-[0.5px] rounded-2xl bg-linear-to-r from-white/3 via-white/[0.07] to-white/3 opacity-0 group-hover:opacity-70 transition-opacity duration-500" />

                        {/* ── Glass card body ── */}
                        <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl p-4 sm:p-6 md:p-8 border border-white/5 shadow-2xl overflow-hidden">
                            {/* Inner grid pattern */}
                            <div
                                className="absolute inset-0 opacity-[0.03]"
                                style={{
                                    backgroundImage:
                                        "linear-gradient(135deg, white 0.5px, transparent 0.5px), linear-gradient(45deg, white 0.5px, transparent 0.5px)",
                                    backgroundSize: "30px 30px",
                                }}
                            />

                            {/* ── Header ── */}
                            <div className="text-center space-y-1 mb-6 relative">
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", duration: 0.8 }}
                                    className="mx-auto w-10 h-10 rounded-full border border-white/10 flex items-center justify-center relative overflow-hidden"
                                >
                                    <Users className="w-5 h-5 text-white/80" />
                                    <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent opacity-50" />
                                </motion.div>

                                <motion.h1
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-b from-white to-white/80"
                                >
                                    Join the Hub
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-white/60 text-xs"
                                >
                                    Add your profile to connect with teams
                                </motion.p>
                            </div>

                            {/* ── Form ── */}
                            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 relative">
                                {/* Profile Photo */}
                                <div>
                                    <SectionLabel>Profile Photo</SectionLabel>
                                    <div className="flex flex-col items-center gap-2">
                                        <motion.button
                                            type="button"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => fileRef.current?.click()}
                                            className={cn(
                                                /* w-24 h-24 on mobile for easier tapping */
                                                "w-24 h-24 sm:w-20 sm:h-20 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden transition-all duration-300 relative group/avatar",
                                                errors.image ? "border-red-500/50" : "border-white/20 hover:border-white/40"
                                            )}
                                        >
                                            {preview ? (
                                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <Camera className="w-6 h-6 text-white/40 group-hover/avatar:text-white/70 transition-colors" />
                                            )}
                                            {preview && (
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Camera className="w-5 h-5 text-white/80" />
                                                </div>
                                            )}
                                        </motion.button>
                                        <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                        <p className="text-white/30 text-[10px]">Click to upload · Max 5 MB</p>
                                        {errors.image && <p className="text-red-400 text-xs">{errors.image}</p>}
                                    </div>
                                </div>

                                {/* Personal Info */}
                                <div>
                                    <SectionLabel>Personal Info</SectionLabel>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <GlassInput
                                            icon={User}
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            placeholder="Full Name"
                                            error={errors.name}
                                        />
                                        <GlassInput
                                            icon={GraduationCap}
                                            name="college"
                                            value={form.college}
                                            onChange={handleChange}
                                            placeholder="College"
                                            error={errors.college}
                                        />
                                    </div>
                                </div>

                                {/* Team */}
                                <div>
                                    <SectionLabel>Team</SectionLabel>
                                    <GlassSelect
                                        icon={Users}
                                        name="teamName"
                                        value={form.teamName}
                                        onChange={handleChange}
                                        error={errors.teamName}
                                    >
                                        <option value="" className="bg-black text-white">Select your team</option>
                                        {teams.map((team) => (
                                            <option key={team._id} value={team.teamName} className="bg-black text-white">
                                                {team.teamName} — {team.trackName}
                                                {teamCounts[team.teamName] ? ` (${teamCounts[team.teamName]}/4)` : " (0/4)"}
                                            </option>
                                        ))}
                                    </GlassSelect>
                                </div>

                                {/* About You */}
                                <div>
                                    <SectionLabel>About You</SectionLabel>
                                    <GlassTextarea
                                        icon={FileText}
                                        name="bio"
                                        value={form.bio}
                                        onChange={handleChange}
                                        rows={3}
                                        placeholder="A short bio about yourself..."
                                        error={errors.bio}
                                    />
                                </div>

                                {/* Social Links */}
                                <div>
                                    <SectionLabel>Social Links</SectionLabel>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <GlassInput
                                            icon={Linkedin}
                                            name="linkedin"
                                            value={form.linkedin}
                                            onChange={handleChange}
                                            onBlur={() => {
                                                if (form.linkedin && !LinkedInRegex.test(form.linkedin))
                                                    setErrors((prev) => ({ ...prev, linkedin: "Enter a valid LinkedIn URL  e.g. https://linkedin.com/in/username" }));
                                                else
                                                    setErrors((prev) => ({ ...prev, linkedin: "" }));
                                            }}
                                            placeholder="https://linkedin.com/in/username"
                                            error={errors.linkedin}
                                        />
                                        <GlassInput
                                            icon={Github}
                                            name="github"
                                            value={form.github}
                                            onChange={handleChange}
                                            onBlur={() => {
                                                if (form.github && !GitHubRegex.test(form.github))
                                                    setErrors((prev) => ({ ...prev, github: "Enter a valid GitHub URL  e.g. https://github.com/username" }));
                                                else
                                                    setErrors((prev) => ({ ...prev, github: "" }));
                                            }}
                                            placeholder="https://github.com/username"
                                            error={errors.github}
                                        />
                                    </div>
                                </div>

                                {/* Submit error */}
                                {errors.submit && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-red-400 text-xs text-center bg-red-500/10 rounded-lg py-2"
                                    >
                                        {errors.submit}
                                    </motion.p>
                                )}

                                {/* Submit button — sign-in-card-2 style */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading}
                                    className="w-full relative group/button mt-2"
                                >
                                    <div className="absolute inset-0 bg-white/10 rounded-lg blur-lg opacity-0 group-hover/button:opacity-70 transition-opacity duration-300" />
                                    <div className="relative overflow-hidden bg-white text-black font-medium h-11 sm:h-10 rounded-lg transition-all duration-300 flex items-center justify-center">
                                        {/* Shimmer while loading */}
                                        <motion.div
                                            className="absolute inset-0 bg-linear-to-r from-white/0 via-white/30 to-white/0 -z-10"
                                            animate={{ x: ["-100%", "100%"] }}
                                            transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
                                            style={{ opacity: loading ? 1 : 0, transition: "opacity 0.3s ease" }}
                                        />
                                        <AnimatePresence mode="wait">
                                            {loading ? (
                                                <motion.div
                                                    key="loading"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="flex items-center justify-center"
                                                >
                                                    <div className="w-4 h-4 border-2 border-black/70 border-t-transparent rounded-full animate-spin" />
                                                </motion.div>
                                            ) : (
                                                <motion.span
                                                    key="text"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="flex items-center justify-center gap-1 text-sm font-medium"
                                                >
                                                    Add to Networking Hub
                                                    <ArrowRight className="w-3 h-3 group-hover/button:translate-x-1 transition-transform duration-300" />
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.button>

                                {/* Divider */}
                                <div className="relative flex items-center mt-2">
                                    <div className="grow border-t border-white/5" />
                                    <motion.span
                                        className="mx-3 text-xs text-white/40"
                                        animate={{ opacity: [0.7, 0.9, 0.7] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        or
                                    </motion.span>
                                    <div className="grow border-t border-white/5" />
                                </div>

                                {/* Back to hub link — sign-in-card-2 style */}
                                <Link to="/networking" className="block">
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full relative group/back"
                                    >
                                        <div className="absolute inset-0 bg-white/5 rounded-lg blur opacity-0 group-hover/back:opacity-70 transition-opacity duration-300" />
                                        <div className="relative overflow-hidden bg-white/5 text-white font-medium h-11 sm:h-10 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-2">
                                            <ArrowLeft className="w-4 h-4 text-white/80 group-hover/back:text-white transition-colors duration-300" />
                                            <span className="text-white/80 group-hover/back:text-white transition-colors text-xs">
                                                Go to Networking Hub
                                            </span>
                                            <motion.div
                                                className="absolute inset-0 bg-linear-to-r from-white/0 via-white/5 to-white/0"
                                                initial={{ x: "-100%" }}
                                                whileHover={{ x: "100%" }}
                                                transition={{ duration: 1, ease: "easeInOut" }}
                                            />
                                        </div>
                                    </motion.div>
                                </Link>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default NetworkingForm;