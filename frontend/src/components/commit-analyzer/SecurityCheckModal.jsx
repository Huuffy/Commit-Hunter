import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldAlt, faTimes, faCheck } from "@fortawesome/free-solid-svg-icons";

// Reusing the same password as AccessGate
const ACCESS_PASSWORD = "mlscmlsc";

const SecurityCheckModal = ({ isOpen, onClose, onSuccess, title, actionButtonText }) => {
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password === ACCESS_PASSWORD) {
            onSuccess();
            onClose();
            setPassword("");
            setError(false);
        } else {
            setError(true);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-sm overflow-hidden rounded-2xl border bg-slate-900 border-purple-500/20 shadow-xl"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                    <FontAwesomeIcon icon={faShieldAlt} className="text-purple-400" />
                                    {title || "Security Check"}
                                </h3>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">Access Code Required</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setError(false);
                                        }}
                                        className={`w-full bg-black/50 border rounded-lg px-4 py-2.5 text-white focus:outline-hidden focus:border-purple-500/50 transition-colors ${error ? "border-red-500/50" : "border-gray-700"}`}
                                        placeholder="••••••••"
                                        autoFocus
                                    />
                                    {error && <p className="text-red-400 text-xs mt-1">Incorrect code</p>}
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 px-4 py-2 rounded-lg text-gray-300 hover:bg-white/5 transition-colors text-sm font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors text-sm font-medium flex items-center justify-center gap-2"
                                    >
                                        {actionButtonText || "Confirm"}
                                        <FontAwesomeIcon icon={faCheck} className="text-xs" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SecurityCheckModal;
