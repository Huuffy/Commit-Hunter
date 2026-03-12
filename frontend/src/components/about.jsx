import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import moonbg from '../assets/moon.png'

const rotatingWords = ["Create.", "Innovate.", "Transform."];

const About = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % rotatingWords.length);
    }, 4000); // change word every 2 sec
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="about"
      className="relative min-h-screen py-24 px-4 md:px-8"
    >
      {/* Moon */}
      <div
        className="absolute w-full lg:w-1/2 h-1/2 lg:h-full scale-75 left-0 lg:left-4 top-40 lg:top-1 opacity-50"
        style={{
          backgroundImage: `url(${moonbg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      ></div>

      {/* Background glows */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-purple-600/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.span
            className="inline-block px-4 py-1.5 text-xs font-medium tracking-[0.2em] rounded-full border mb-6"
            style={{
              background:
                "linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(59,130,246,0.1) 100%)",
              borderColor: "rgba(139,92,246,0.3)",
              color: "#c4b5fd",
            }}
          >
            DISCOVER THE JOURNEY
          </motion.span>

          <h2 className="text-4xl md:text-6xl font-extrabold mb-6">
            <span className="text-white">
              About{" "}
            </span>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-blue-400">
              Coherence 2026
            </span>
          </h2>

          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-16 bg-linear-to-r from-transparent to-purple-500/50" />
            <div className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_#a78bfa]" />
            <div className="h-px w-16 bg-linear-to-l from-transparent to-purple-500/50" />
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative mb-16"
        >
          <div className="relative p-8 md:p-12 rounded-3xl overflow-hidden">
            <div className="relative z-10">
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed text-center max-w-4xl mx-auto">
                Welcome to{" "}
                <span className="text-purple-300 font-semibold">
                  Coherence 2026
                </span>
                , where{" "}
                <span className="text-white font-medium">
                  innovation knows no bounds
                </span>
                ! In the heart of our{" "}
                <span className="text-blue-300 font-semibold">
                  24-hour hackathon
                </span>
                , we unite brilliant minds, fueling a{" "}
                <span className="italic text-purple-200">
                  symphony of creativity
                </span>
                .
              </p>

              <div className="my-8 flex justify-center">
                <div className="h-px w-48 bg-linear-to-r from-transparent via-purple-500/40 to-transparent" />
              </div>

              <p className="text-lg md:text-xl text-gray-300 leading-relaxed text-center max-w-4xl mx-auto">
                Join us on a{" "}
                <span className="text-white font-medium">relentless quest</span>{" "}
                to redefine possibilities and amplify the{" "}
                <span className="text-purple-300 font-semibold">
                  pulse of tech brilliance
                </span>
                !
              </p>
            </div>
          </div>
        </motion.div>

        {/* Rotating Text */}
        <div className="flex justify-center mt-12 mb-8 relative">
          <AnimatePresence mode="wait">
            <motion.h3
              key={index}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1.1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              className="text-xl md:text-3xl font-light text-transparent bg-clip-text 
                 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 tracking-widest
                 "
            >
              {rotatingWords[index]}
            </motion.h3>
          </AnimatePresence>

        </div>

        <div className="my-3 flex justify-center">
          <div className="h-px w-48 bg-linear-to-r from-transparent via-purple-500/40 to-transparent" />
        </div>
        {/* Bottom Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-purple-400/40 text-sm tracking-[0.3em] uppercase">
            Where Ideas Transcend Reality
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
