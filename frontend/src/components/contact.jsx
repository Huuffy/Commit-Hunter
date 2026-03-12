import React from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";

const Contact = () => {
  return (
    <section
      id="contact"
      className="relative min-h-screen py-24 px-4 md:px-8 overflow-hidden"
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-purple-950/20 to-transparent pointer-events-none" />

      {/* Decorative glows */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6">
            <span className="text-white">Reach </span>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-blue-400">
              Us
            </span>
          </h2>

          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-16 bg-linear-to-r from-transparent to-purple-500/50" />
            <div className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_#a78bfa]" />
            <div className="h-px w-16 bg-linear-to-l from-transparent to-purple-500/50" />
          </div>
        </motion.div>

        {/* Content */}
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Left: Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative p-8 rounded-3xl border backdrop-blur-md"
            style={{
              background: "rgba(139,92,246,0.05)",
              borderColor: "rgba(139,92,246,0.15)",
            }}
          >
            <h3 className="text-2xl font-bold text-white mb-6">
              Let’s Connect
            </h3>

            <p className="text-gray-300 mb-8 leading-relaxed">
              Have questions about the event, participation, or partnerships?
              We’re just a message away.
            </p>

            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="text-purple-300"
                  />
                </div>
                <span className="text-gray-300">
                  mlsc@vcet.edu.in
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <FontAwesomeIcon
                    icon={faPhone}
                    className="text-purple-300"
                  />
                </div>
                <span className="text-gray-300">
                  Parth Raut: +91 92246 68114
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <FontAwesomeIcon
                    icon={faPhone}
                    className="text-purple-300"
                  />
                </div>
                <span className="text-gray-300">
                  Dnyanesh Panchal: +91 93216 67147
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <FontAwesomeIcon
                    icon={faPhone}
                    className="text-purple-300"
                  />
                </div>
                <span className="text-gray-300">
                  Gayatri Sabat : +91 98907 40720
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right: Embedded Google Maps */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative p-4 md:p-8 rounded-3xl border backdrop-blur-md h-full"
            style={{
              background: "rgba(139,92,246,0.05)",
              borderColor: "rgba(139,92,246,0.15)",
            }}
          >
            <iframe
              title="College Location"
              className="w-full h-full rounded-2xl border border-purple-500/20"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3763.659991421949!2d72.82615867523565!3d19.383869581885122!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7aec0a4b41bef%3A0xbd1a4ca919d6a613!2sVidyavardhini%27s%20College%20of%20Engineering%20and%20Technology!5e0!3m2!1sen!2sin!4v1701160672294!5m2!1sen!2sin"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
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
            Let’s Build Beyond Together
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
