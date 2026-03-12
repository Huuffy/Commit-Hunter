import React from "react";
import { motion } from "framer-motion";
import firstPriceImage from "../assets/firstPrice.png";
import secondPriceImage from "../assets/secondPrice.png";

const prizes = [
  {
    rank: "Winner",
    image: firstPriceImage,
    amount: "₹ 15,000",
    perks: "Certificate + Internship Opportunity + Goodies",
    accentFrom: "rgba(250,204,21,0.8)",
    accentTo: "rgba(234,179,8,0.5)",
    glowColor: "rgba(250,204,21,0.3)",
    size: "large",
  },
  {
    rank: "1st Runner-up",
    image: secondPriceImage,
    amount: "₹ 7,500",
    perks: "Certificate + Internship Opportunity + Goodies",
    accentFrom: "rgba(167,139,250,0.8)",
    accentTo: "rgba(99,102,241,0.5)",
    glowColor: "rgba(167,139,250,0.3)",
    size: "medium",
  },
];

const PrizeSection = () => {
  return (
    <section
      id="prizes"
      className="relative py-24 px-4 md:px-8 overflow-hidden"
    >
      {/* Background overlays */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-purple-950/20 to-transparent pointer-events-none" />
      <div className="absolute top-20 left-10 w-64 h-64 bg-purple-600/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6">
            <span className="text-white">Prizes </span>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-blue-400">
              Up for Grabs
            </span>
          </h2>

          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-16 bg-linear-to-r from-transparent to-purple-500/50" />
            <div className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_#a78bfa]" />
            <div className="h-px w-16 bg-linear-to-l from-transparent to-purple-500/50" />
          </div>

          {/* <p className="max-w-lg mx-auto text-gray-300 text-base leading-relaxed">
            Glory awaits the worthy. Claim your place at the summit.
          </p> */}
        </motion.div>

        {/* Total Prize Pool Highlight */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex justify-center mb-2"
        >
          <div className="relative px-10 py-6 rounded-2xl backdrop-blur-xl border border-purple-500/20 bg-white/5 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-purple-500/10 to-blue-500/10 blur-2xl opacity-70 pointer-events-none" />

            <p className="text-sm uppercase tracking-widest text-purple-300/70 mb-2">
              Total Prize Pool
            </p>

            <h3 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-purple-400 to-blue-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]">
              ₹ 1,00,000
            </h3>

            <p className="text-xs text-purple-200/50 mt-2">
              Across all tracks
            </p>
          </div>
        </motion.div>

        {/* Prize Cards */}
        <div className="flex flex-col md:flex-row justify-center items-end gap-8 md:gap-10 mb-10">
          {prizes.map((prize, index) => (
            <PrizeCard key={index} prize={prize} index={index} />
          ))}
        </div>

        {/* Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-purple-400 to-blue-400 font-bold text-lg md:text-xl drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]"
        >
          *Prizes are for each track
        </motion.p>

        {/* Bottom tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-14"
        >
          <p className="text-purple-400/40 text-sm tracking-[0.3em] uppercase">
            Where Brilliance Meets Recognition
          </p>
        </motion.div>
      </div>
    </section>
  );
};

const PrizeCard = ({ prize, index }) => {
  const isLarge = prize.size === "large";

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        delay: index * 0.2,
        duration: 0.7,
        type: "spring",
        stiffness: 60,
      }}
      whileHover={{ scale: 1.05, y: -10 }}
      className="group relative w-full md:w-auto text-center"
    >
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${prize.glowColor}, transparent 70%)`,
        }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-8">
        <motion.div
          className={`block mb-6 ${isLarge ? "w-48 h-48" : "w-40 h-40"}`}
          whileHover={{ scale: 1.1, rotate: [0, -8, 8, 0] }}
          transition={{ duration: 0.5 }}
        >
          <img
            src={prize.image}
            alt={prize.rank}
            className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(139,92,246,0.4)]"
          />
        </motion.div>

        <h3
          className={`font-bold text-white mb-3 ${
            isLarge ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"
          }`}
        >
          {prize.rank}
        </h3>

        <div
          className="h-0.5 w-12 mb-4 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${prize.accentFrom}, ${prize.accentTo})`,
          }}
        />

        <p
          className={`font-extrabold mb-3 text-transparent bg-clip-text ${
            isLarge ? "text-5xl md:text-6xl" : "text-4xl md:text-5xl"
          }`}
          style={{
            backgroundImage: `linear-gradient(135deg, ${prize.accentFrom}, ${prize.accentTo})`,
            filter: `drop-shadow(0 0 15px ${prize.glowColor})`,
          }}
        >
          {prize.amount}
        </p>

        <p className="text-purple-200/60 text-sm leading-relaxed text-center max-w-xs">
          {prize.perks}
        </p>
      </div>
    </motion.div>
  );
};

export default PrizeSection;
