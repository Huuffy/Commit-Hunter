import React, { useState } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faArrowRight } from "@fortawesome/free-solid-svg-icons";

// Configurable password - efficiently hardcoded as per requirements
const ACCESS_PASSWORD = "mlscmlsc";

const AccessGate = ({ onAccessGranted }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    // Simulate a brief check for better UX
    setTimeout(() => {
      if (password === ACCESS_PASSWORD) {
        onAccessGranted();
      } else {
        setError(true);
        // Shake animation trigger could be added here
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        style={{
          background: "radial-gradient(circle at center, rgba(139,92,246,0.1) 0%, rgba(0,0,0,0.9) 100%)"
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="relative w-full max-w-md"
      >
        <div
          className="relative overflow-hidden rounded-2xl border backdrop-blur-2xl shadow-2xl"
          style={{
            background: "rgba(30, 27, 75, 0.6)",
            borderColor: "rgba(139,92,246,0.3)",
            boxShadow: "0 0 50px rgba(139,92,246,0.15)"
          }}
        >
          {/* Decorative top glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />

          <div className="p-8 md:p-10">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/30 blur-xl rounded-full" />
                <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-b from-purple-500/20 to-transparent border border-purple-500/30">
                  <FontAwesomeIcon icon={faLock} className="text-3xl text-purple-200" />
                </div>
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Restricted Access</h2>
              <p className="text-purple-300/60 text-sm">
                Enter the access code to view the Commit Analyzer
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(false);
                  }}
                  placeholder="Enter Access Code"
                  className={`w-full bg-black/40 border rounded-xl px-5 py-4 text-center text-lg text-white placeholder-purple-500/30 outline-hidden transition-all duration-300 focus:border-purple-500/60 focus:bg-black/60 ${error ? 'border-red-500/50' : 'border-purple-500/20'}`}
                  autoFocus
                />
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs text-center font-medium"
                >
                  Incorrect access code. Please try again.
                </motion.p>
              )}

              <button
                type="submit"
                disabled={loading || !password}
                className="w-full relative overflow-hidden group rounded-xl p-[1px] focus:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 group-hover:opacity-100 opacity-80" />
                <div className="relative flex items-center justify-center gap-2 bg-slate-950/90 hover:bg-transparent rounded-[11px] px-4 py-3.5 transition-all duration-200">
                  <span className="font-semibold text-white">
                    {loading ? "Verifying..." : "Unlock Dashboard"}
                  </span>
                  {!loading && <FontAwesomeIcon icon={faArrowRight} className="text-white/80 group-hover:translate-x-1 transition-transform" />}
                </div>
              </button>
            </form>
          </div>
        </div>

        <p className="text-center mt-6 text-xs text-purple-300/30 uppercase tracking-widest">
          Authorized Personnel Only
        </p>
      </motion.div>
    </div>
  );
};

export default AccessGate;
