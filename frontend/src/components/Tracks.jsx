import React, { useState } from "react";
import { motion } from "framer-motion";
import { Code, Megaphone, Brain } from "lucide-react";
import smartgov from "../assets/tracks/track1.jpeg";
import health from "../assets/tracks/track2.jpg";
import student from "../assets/tracks/track3.jpeg";
// Placeholder images — replace with track-specific ones later

const trackIcons = {
  "Smart Governance & Public Platforms": Code,
  "HealthTech & Digital Wellbeing": Brain,
  "Sales & Outreach Systems": Megaphone,
};

const Tracks = () => {
  const tracks = [
    {
      title: "Smart Governance & Public Platforms",
      tagline: "Shape Public Systems",
      description:
        "Build platforms that make governance smarter, transparent, and more accessible for everyone.",
      image: smartgov, // replace with real track image
      accentFrom: "rgba(59,130,246,0.8)",
      accentTo: "rgba(99,102,241,0.6)",
      accentColor: "#3b82f6",
    },
    {
      title: "HealthTech & Digital Wellbeing",
      tagline: "Empower Wellness",
      description:
        "Develop technologies that improve health, wellness, and digital wellbeing for users worldwide.",
      image: health, // replace with real track image
      accentFrom: "rgba(167,139,250,0.8)",
      accentTo: "rgba(236,72,153,0.6)",
      accentColor: "#a78bfa",
    },
    {
      title: "Sales & Outreach Systems",
      tagline: "Accelerate Growth & Engagement",
      description:
        "Build intelligent sales and outreach solutions that streamline lead management, automate communication, and drive meaningful customer engagement.",
      image: student, // replace with real track image
      accentFrom: "rgba(52,211,153,0.8)",
      accentTo: "rgba(59,130,246,0.6)",
      accentColor: "#34d399",
    },
  ];

  return (
    <section
      id="tracks"
      className="relative min-h-screen py-24 px-4 md:px-8 overflow-hidden"
    >
      {/* Section background overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-purple-950/20 to-transparent pointer-events-none" />

      {/* Decorative blurs */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-purple-600/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6">
            <span className="text-white">Choose Your </span>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-blue-400">
              Track
            </span>
          </h2>

          <p className="max-w-xl mx-auto text-gray-300 text-lg leading-relaxed">
            Pick your path to reshape the systems of tomorrow.
          </p>
        </motion.div>

        {/* Track Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-15">
          {tracks.map((track, index) => (
            <DomainCard
              key={index}
              domain={track}
              index={index}
              domainIcons={trackIcons}
            />
          ))}
        </div>

        {/* Bottom tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-purple-400/40 text-sm tracking-[0.3em] uppercase">
            Beyond the Ascension
          </p>
        </motion.div>
      </div>
    </section>
  );
};

/* ─── Flip Card ─── */
const DomainCard = ({ domain, index, domainIcons }) => {
  const IconComponent = domainIcons[domain.title];
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        delay: index * 0.15,
        duration: 0.6,
        type: "spring",
        stiffness: 60,
      }}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      style={{ perspective: "1200px" }}
    >
      <div
        className="relative w-full h-[400px]"
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.7s ease-in-out",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* FRONT FACE */}
        <div
          className="absolute inset-0 rounded-tr-2xl rounded-bl-2xl border-2 backdrop-blur-sm bg-purple-300/40 overflow-hidden flex flex-col items-center justify-center shadow-md shadow-purple-200/10"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            background: "rgba(139,92,246,0.05)",
            borderColor: "rgba(139,92,246,0.15)",
          }}
        >
          <div
            className="absolute w-48 h-48 rounded-full blur-[80px] opacity-20 animate-pulse"
            style={{
              background: `linear-gradient(135deg, ${domain.accentFrom}, ${domain.accentTo})`,
            }}
          />
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-purple-400/30 animate-pulse"
                style={{
                  top: `${15 + i * 14}%`,
                  left: `${10 + ((i * 17) % 80)}%`,
                  animationDelay: `${i * 0.4}s`,
                  animationDuration: `${2 + i * 0.5}s`,
                }}
              />
            ))}
          </div>
          <div className="relative z-10 mb-8 transition-transform duration-500 group-hover:scale-90" style={{ color: "white" }}>
            {IconComponent && <IconComponent size={65} strokeWidth={1} />}
          </div>
          <h3
            className="relative z-10 text-3xl md:text-3xl font-extrabold text-transparent bg-clip-text mb-3"
            style={{
              backgroundImage: `linear-gradient(135deg, ${domain.accentFrom}, ${domain.accentTo})`,
              textAlign: "center",
            }}
          >
            {domain.title}
          </h3>
        </div>

        {/* BACK FACE */}
        <div
          className="absolute inset-0 rounded-tl-2xl rounded-br-2xl border-2 backdrop-blur-sm overflow-hidden  shadow-md shadow-purple-200/10"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "rgba(139,92,246,0.05)",
            borderColor: "rgba(139,92,246,0.15)",
          }}
        >
          <div className="absolute inset-0">
            <div className="absolute inset-0 z-20 bg-linear-to-t from-[#0a0a20] via-[#0a0a20]/70 to-[#0a0a20]/30" />
            <img
              src={domain.image}
              alt={domain.title}
              className="w-full h-full object-cover opacity-100 scale-110 grayscale-[30%]"
            />
          </div>

          <div className="absolute inset-0 z-30 p-8 flex flex-col justify-end">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="h-0.5 w-8"
                style={{
                  background: `linear-gradient(90deg, ${domain.accentFrom}, ${domain.accentTo})`,
                }}
              />
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-purple-300/70">
                {domain.tagline}
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
              {domain.title}
            </h3>
            <p className="text-purple-200/60 text-sm leading-relaxed mb-4">
              {domain.description}
            </p>
          </div>

          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              boxShadow:
                "inset 0 0 30px rgba(139,92,246,0.1), 0 0 40px rgba(139,92,246,0.15)",
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Tracks;
