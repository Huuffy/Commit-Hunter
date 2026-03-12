import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle, faHome } from "@fortawesome/free-solid-svg-icons";
import Background from "../components/background";

const NotFound = () => {
    return (
        <div className="relative min-h-screen overflow-hidden flex items-center justify-center bg-black text-white px-6">
            <Background />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 text-center max-w-lg"
            >
                <div className="mb-8 relative inline-block">
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0],
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="text-8xl md:text-9xl font-black text-white/5 selection:bg-none pointer-events-none absolute inset-0 flex items-center justify-center"
                    >
                        404
                    </motion.div>
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-6xl text-purple-500 relative z-10 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                </div>

                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-linear-to-r from-purple-400 to-pink-400">
                    Lost in the Ascension?
                </h1>

                <p className="text-purple-300/60 text-lg mb-10 leading-relaxed">
                    The page you are looking for has ascended beyond our reach or never existed in this dimension.
                </p>

                <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold transition-all shadow-lg shadow-purple-900/20 group hover:scale-105 active:scale-95"
                >
                    <FontAwesomeIcon icon={faHome} className="group-hover:-translate-y-0.5 transition-transform" />
                    Back to Reality
                </Link>
            </motion.div>
        </div>
    );
};

export default NotFound;
