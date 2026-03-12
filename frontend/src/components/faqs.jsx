import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FAQs = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "Who can participate in Coherence ’26?",
      answer: "The hackathon is open to full-time undergraduate engineering students.",
    },
    {
      question: "What is the team size requirement?",
      answer: "Each team must have a minimum of 2 and a maximum of 4 members.",
    },
    {
      question: "Is there a registration fee?",
      answer: "The Initial Judging Round is free. Shortlisted teams must pay ₹600 per team for the Grand Finale.",
    },
    {
      question: "When is the PPT submission deadline?",
      answer: "PPT submissions must be completed before 28th February 2026, 11:59 PM.",
    },
    {
      question: "When will final problem statements be announced?",
      answer: "Final tracks and problem statements will be revealed on the day of the 24-hour offline hackathon.",
    },
    {
      question: "What needs to be submitted at the end?",
      answer: "Teams must submit their GitHub repository link, properly documented source code, demo video, and PPT presentation.",
    },
    {
      question: "Are travel and accommodation covered?",
      answer: "Participants are responsible for managing their own travel and related expenses.",
    },
  ];


  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section
      id="faqs"
      className="relative min-h-screen py-24 px-4 md:px-8 overflow-hidden"
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-purple-950/20 to-transparent pointer-events-none" />

      {/* Decorative glows */}
      <div className="absolute top-24 right-10 w-72 h-72 bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-24 left-10 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6">
            <span className="text-white">Frequently Asked </span>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-blue-400">
              Questions
            </span>
          </h2>

          {/* Decorative line */}
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-linear-to-r from-transparent to-purple-500/50" />
            <div className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_#a78bfa]" />
            <div className="h-px w-16 bg-linear-to-l from-transparent to-purple-500/50" />
          </div>
        </motion.div>

        {/* Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div
                onClick={() => toggleFAQ(index)}
                className="cursor-pointer rounded-2xl border border-purple-500/15 bg-white/5 backdrop-blur-md px-6 py-5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold text-lg">
                    {faq.question}
                  </h3>
                  <motion.span
                    animate={{ rotate: activeIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-purple-400 text-xl"
                  >
                    ▼
                  </motion.span>
                </div>

                <AnimatePresence>
                  {activeIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="mt-4 text-gray-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-purple-400/40 text-sm tracking-[0.3em] uppercase">
            Still Curious? Let’s Build Together
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQs;
