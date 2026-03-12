import { useState } from "react";
import { Linkedin, Github, UserRound, RotateCcw } from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

/* ═══════════════════════════════════════════════════════════════
   FlippingCard — 1:1 match of 21st.dev reference structure
   CRITICAL: face divs must NOT have overflow-hidden or
   backdrop-filter — both break backface-visibility:hidden
   Desktop: hover to flip  ·  Mobile: tap to flip
   ═══════════════════════════════════════════════════════════════ */
function FlippingCard({ frontContent, backContent, height = 200, width }) {
    const [flipped, setFlipped] = useState(false);

    return (
        <div
            className="group/flipping-card perspective-[1000px] cursor-pointer select-none"
            style={{ "--height": `${height}px`, ...(width ? { "--width": `${width}px` } : {}) }}
            onClick={() => setFlipped((f) => !f)}
        >
            <div
                className={cn(
                    /* Rotating container — border + shadow live HERE, not on faces */
                    "relative rounded-xl transition-all duration-700 transform-3d",
                    "shadow-[0_4px_24px_rgba(100,60,200,0.25),0_1px_6px_rgba(0,0,0,0.5)]",
                    "h-(--height)",
                    width ? "w-(--width)" : "w-full",
                    "border border-[rgba(139,92,246,0.22)] bg-[rgba(20,10,48,0.88)]",
                    /* Hover flip on desktop */
                    "group-hover/flipping-card:transform-[rotateY(180deg)]",
                    /* State flip for mobile tap */
                    flipped && "transform-[rotateY(180deg)]"
                )}
            >
                {/* ── Front Face ── (NO overflow-hidden, NO backdrop-filter) */}
                <div className="absolute inset-0 h-full w-full rounded-[inherit] bg-[rgba(20,10,48,0.88)] text-white transform-3d backface-hidden transform-[rotateY(0deg)]">
                    <div className="transform-[translateZ(70px)_scale(.93)] h-full w-full">
                        {frontContent}
                    </div>
                </div>

                {/* ── Back Face ── (NO overflow-hidden, NO backdrop-filter) */}
                <div className="absolute inset-0 h-full w-full rounded-[inherit] bg-[rgba(26,14,58,0.95)] text-white transform-3d backface-hidden transform-[rotateY(180deg)]">
                    <div className="transform-[translateZ(70px)_scale(.93)] h-full w-full">
                        {backContent}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   Front Face Content — compact card, full-size avatar
   ═══════════════════════════════════════════════════════════════ */
function CardFront({ user }) {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full px-4 pt-3 pb-2 gap-1">
            {/* Gradient ring avatar — original large size */}
            <div className="relative shrink-0">
                <div
                    className="absolute -inset-0.75 rounded-full"
                    style={{ background: "linear-gradient(135deg, #a855f7, #6366f1, #22d3ee)" }}
                />
                {user.imageUrl ? (
                    <img
                        src={user.imageUrl}
                        alt={user.name}
                        className="relative w-19 h-19 rounded-full object-cover"
                        style={{ background: "rgb(20,10,48)" }}
                    />
                ) : (
                    <div
                        className="relative w-19 h-19 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(139,92,246,0.12)" }}
                    >
                        <UserRound className="w-9 h-9 text-purple-400/50" />
                    </div>
                )}
            </div>

            {/* Name + college */}
            <div className="text-center min-w-0 w-full">
                <h3 className="text-white font-semibold text-sm leading-tight truncate px-2">
                    {user.name}
                </h3>
                <p className="text-purple-300/55 text-[10px] mt-0.5 truncate px-2">
                    {user.college}
                </p>
            </div>

            {/* Team badge */}
            {user.teamName && (
                <span
                    className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-medium tracking-wide truncate max-w-[90%]"
                    style={{
                        background: "rgba(139,92,246,0.15)",
                        border: "1px solid rgba(139,92,246,0.3)",
                        color: "rgba(196,181,253,0.85)",
                    }}
                >
                    {user.teamName}
                </span>
            )}

            {/* Flip hint */}
            <div className="flex items-center gap-1 mt-auto">
                <RotateCcw className="w-2.5 h-2.5 text-purple-400/25" />
                <p className="text-purple-400/25 text-[8px] tracking-widest uppercase">
                    flip for more
                </p>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   Back Face Content — compact card, original text sizes
   ═══════════════════════════════════════════════════════════════ */
function CardBack({ user }) {
    return (
        <div className="flex flex-col h-full w-full px-4 py-3 gap-1.5">
            {/* Name strip */}
            <div className="flex items-center gap-2">
                <div
                    className="w-0.5 h-4 rounded-full shrink-0"
                    style={{ background: "linear-gradient(to bottom, #a855f7, #6366f1, #22d3ee)" }}
                />
                <span className="text-white/90 font-semibold text-sm truncate">{user.name}</span>
            </div>

            {/* Bio */}
            <div className="flex-1 overflow-hidden">
                <p className="text-purple-200/55 text-[12px] leading-relaxed line-clamp-4">
                    {user.bio || "No bio provided yet."}
                </p>
            </div>

            {/* Social links */}
            <div className="flex flex-col gap-1.5 mt-auto">
                {user.linkedin && (
                    <a
                        href={user.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 hover:scale-[1.02] hover:brightness-125"
                        style={{
                            color: "rgba(96,165,250,0.9)",
                            background: "rgba(59,130,246,0.08)",
                            border: "1px solid rgba(59,130,246,0.2)",
                        }}
                    >
                        <Linkedin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">LinkedIn</span>
                    </a>
                )}
                {user.github && (
                    <a
                        href={user.github}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 hover:scale-[1.02] hover:brightness-125"
                        style={{
                            color: "rgba(216,180,254,0.9)",
                            background: "rgba(139,92,246,0.08)",
                            border: "1px solid rgba(139,92,246,0.2)",
                        }}
                    >
                        <Github className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">GitHub</span>
                    </a>
                )}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   Main Export — wraps content in FlippingCard
   ═══════════════════════════════════════════════════════════════ */
export default function ParticipantCard({ user }) {
    return (
        <FlippingCard
            frontContent={<CardFront user={user} />}
            backContent={<CardBack user={user} />}
        />
    );
}