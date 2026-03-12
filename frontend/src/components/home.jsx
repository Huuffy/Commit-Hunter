import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleUp, faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { faInstagram, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import Background from "./background";
import logo from '../assets/coherence-logo.png';
import HologramSphere from "./sphere";

const Home = () => {
  const targetDate = new Date("March 6, 2026 12:00:00 GMT+0530").getTime();

  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining());
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  function calculateTimeRemaining() {
    const currentDate = new Date().getTime();
    const diff = targetDate - currentDate;

    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowScrollButton(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  return (
    <div id="home" className="relative min-h-screen overflow-x-hidden">
      <Background />
      {/* <HologramSphere /> */}

      {/* Navigation Bar - Glassmorphism Style */}
      <nav className="fixed top-0 w-full z-50 bg-purple-950/30 backdrop-blur-xl border-b border-purple-500/10 px-6 py-3 flex justify-between items-center">
        <button
          onClick={() => setIsMenuOpen(true)}
          className="p-2 hover:bg-purple-500/20 rounded-lg text-purple-300/70 hover:text-purple-200 transition-all duration-300"
        >
          <FontAwesomeIcon icon={faBars} size="lg" />
        </button>

        <div className="flex space-x-4">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-300/70 hover:text-purple-200 hover:drop-shadow-[0_0_8px_rgba(167,139,250,0.5)] transition-all duration-300"
          >
            <FontAwesomeIcon icon={faInstagram} size="lg" />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-300/70 hover:text-purple-200 hover:drop-shadow-[0_0_8px_rgba(167,139,250,0.5)] transition-all duration-300"
          >
            <FontAwesomeIcon icon={faLinkedin} size="lg" />
          </a>
        </div>
      </nav>

      {/* Sidebar - Mystical Style */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60"
            />
            <motion.div
              ref={menuRef}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-72 z-70 p-6 shadow-2xl border-r border-purple-500/20"
              style={{
                background: "linear-gradient(to bottom, rgba(26,16,61,0.95) 0%, rgba(13,13,26,0.98) 100%)",
              }}
            >
              <div className="flex justify-between items-center mb-8">
                <span className="font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-300 to-blue-300">
                  Navigation
                </span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="text-purple-300/70 hover:text-purple-200 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <div className="flex flex-col space-y-2">
                <motion.a
                  href="#home"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0 }}
                  className="text-left px-4 py-3 rounded-lg text-purple-200/70 hover:text-white hover:bg-purple-500/20 capitalize transition-all duration-300 border border-transparent hover:border-purple-500/30"
                >
                  Home
                </motion.a>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  <Link
                    to="/shortlisted-teams"
                    className="block text-left px-4 py-3 rounded-lg text-purple-200/70 hover:text-white hover:bg-purple-500/20 capitalize transition-all duration-300 border border-transparent hover:border-purple-500/30"
                  >
                    Shortlisted Teams
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Link
                    to="/networking"
                    className="block text-left px-4 py-3 rounded-lg text-purple-200/70 hover:text-white hover:bg-purple-500/20 capitalize transition-all duration-300 border border-transparent hover:border-purple-500/30"
                  >
                    Networking
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <Link
                    to="/leaderboard"
                    className="block text-left px-4 py-3 rounded-lg text-purple-200/70 hover:text-white hover:bg-purple-500/20 capitalize transition-all duration-300 border border-transparent hover:border-purple-500/30"
                  >
                    Leaderboard
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Link
                    to="/realtime"
                    className="block text-left px-4 py-3 rounded-lg text-purple-200/70 hover:text-white hover:bg-purple-500/20 capitalize transition-all duration-300 border border-transparent hover:border-purple-500/30"
                  >
                    Timer
                  </Link>
                </motion.div>
                <motion.a
                  href="#about"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-left px-4 py-3 rounded-lg text-purple-200/70 hover:text-white hover:bg-purple-500/20 capitalize transition-all duration-300 border border-transparent hover:border-purple-500/30"
                >
                  About
                </motion.a>
                <motion.a
                  href="#schedule"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-left px-4 py-3 rounded-lg text-purple-200/70 hover:text-white hover:bg-purple-500/20 capitalize transition-all duration-300 border border-transparent hover:border-purple-500/30"
                >
                  Schedule
                </motion.a>

                <motion.a
                  href="#faqs"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                  className="text-left px-4 py-3 rounded-lg text-purple-200/70 hover:text-white hover:bg-purple-500/20 capitalize transition-all duration-300 border border-transparent hover:border-purple-500/30"
                >
                  FAQs
                </motion.a>
                <motion.a
                  href="#contact"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-left px-4 py-3 rounded-lg text-purple-200/70 hover:text-white hover:bg-purple-500/20 capitalize transition-all duration-300 border border-transparent hover:border-purple-500/30"
                >
                  Contact
                </motion.a>
              </div>

              {/* Decorative element in sidebar */}
              <div className="absolute bottom-8 left-6 right-6">
                <div className="h-px bg-linear-to-r from-transparent via-purple-500/30 to-transparent" />
                <p className="text-center text-purple-400/40 text-xs mt-4 tracking-widest">
                  BEYOND THE ASCENSION
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="space-y-6"
        >
          {/* Event Badge */}
          <motion.span
            className="inline-block px-5 py-2 text-xs font-medium tracking-[0.2em] rounded-full border"
            style={{
              background: "linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(59,130,246,0.1) 100%)",
              borderColor: "rgba(139,92,246,0.3)",
              color: "#c4b5fd",
              boxShadow: "0 0 30px rgba(139,92,246,0.2), inset 0 0 20px rgba(139,92,246,0.1)",
            }}
            animate={{
              boxShadow: [
                "0 0 30px rgba(139,92,246,0.2), inset 0 0 20px rgba(139,92,246,0.1)",
                "0 0 40px rgba(139,92,246,0.3), inset 0 0 25px rgba(139,92,246,0.15)",
                "0 0 30px rgba(139,92,246,0.2), inset 0 0 20px rgba(139,92,246,0.1)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            MLSC CODEFEST 2026
          </motion.span>

          {/* Main Title */}
          <motion.p
            className="text-2xl md:text-3xl lg:text-5xl font-extrabold tracking-tight" // made smaller
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <span className="text-transparent bg-clip-text bg-linear-to-b from-white via-purple-100 to-purple-300/80">
              Beyond the
            </span>
            <br />
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: "linear-gradient(135deg, #c4b5fd 0%, #60a5fa 50%, #a78bfa 100%)",
                filter: "drop-shadow(0 0 30px rgba(167,139,250,0.5))",
              }}
            >
              Ascension
            </span>
          </motion.p>

          {/* Coherence Logo */}
          <motion.img
            src={logo} // make sure this path points to your logo
            alt="Coherence Logo"
            className="w-5/6 mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          />

          {/* Tagline */}
          <motion.p
            className="text-lg md:text-xl font-medium tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              background: "linear-gradient(90deg, #a78bfa, #60a5fa, #a78bfa)",
              backgroundSize: "200% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Break Boundaries. Build Beyond.
          </motion.p>

          {/* Countdown Grid */}
          <motion.div
            className="grid grid-cols-4 gap-3 md:gap-4 mt-3 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {Object.entries(timeRemaining).map(([label, value], i) => (
              <motion.div
                key={label}
                className="relative group"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div
                  className="min-w-[70px] md:min-w-[100px] p-4 md:p-5 rounded-xl border backdrop-blur-sm flex flex-col items-center justify-center text-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(59,130,246,0.05) 100%)",
                    borderColor: "rgba(139,92,246,0.2)",
                    boxShadow: "0 0 20px rgba(139,92,246,0.1), inset 0 0 20px rgba(139,92,246,0.05)",
                  }}
                >
                  <div
                    className="text-3xl md:text-5xl font-mono font-bold text-white leading-none"
                    style={{ textShadow: "0 0 20px rgba(167,139,250,0.5)" }}
                  >
                    {String(value).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-purple-300/50 mt-1">
                    {label}
                  </div>
                </div>
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: "radial-gradient(circle at center, rgba(139,92,246,0.3) 0%, transparent 70%)",
                    filter: "blur(20px)",
                  }}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Register Now Button */}
          <motion.a
            href="/shortlisted-teams"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 px-8 py-4 rounded-xl font-semibold text-white relative overflow-hidden group cursor-pointer inline-flex items-center gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            style={{
              background: "linear-gradient(135deg, rgba(139,92,246,0.8) 0%, rgba(99,102,241,0.8) 50%, rgba(59,130,246,0.8) 100%)",
              boxShadow: "0 0 30px rgba(139,92,246,0.4), inset 0 0 20px rgba(255,255,255,0.1)",
            }}
          >
            <span className="relative z-10 flex items-center gap-2">
              Checkout The Shortlisted Teams
              <motion.span
                initial={{ x: 0 }}
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                →
              </motion.span>
            </span>

            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
              }}
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 0.5,
              }}
            />
          </motion.a>

        </motion.div>
      </div>


      {/* Scroll to Top - Mystical Style */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-8 right-8 w-14 h-14 flex items-center justify-center rounded-full z-50 border"
            style={{
              background:
                "linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(59,130,246,0.2) 100%)",
              borderColor: "rgba(139,92,246,0.3)",
              boxShadow: "0 0 30px rgba(139,92,246,0.3)",
              backdropFilter: "blur(10px)",
            }}
            whileHover={{
              scale: 1.1,
              boxShadow: "0 0 40px rgba(139,92,246,0.5)",
            }}
          >
            <FontAwesomeIcon icon={faAngleUp} className="text-purple-200 text-lg" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
