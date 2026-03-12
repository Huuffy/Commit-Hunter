import React, { useState, useEffect } from "react";
import AccessGate from "../components/commit-analyzer/AccessGate";
import Dashboard from "../components/commit-analyzer/Dashboard";
import Background from "../components/background";

const CommitAnalyzer = () => {
    const [hasAccess, setHasAccess] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const access = sessionStorage.getItem("commitAccess");
        const adminAuth = sessionStorage.getItem("adminAuthenticated");
        if (access === "true" || adminAuth === "true") {
            setHasAccess(true);
        }
        setLoading(false);
    }, []);

    const handleAccessGranted = () => {
        sessionStorage.setItem("commitAccess", "true");
        setHasAccess(true);
    };

    if (loading) return null; // Avoid flash

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-black text-white">
            <Background />

            {!hasAccess ? (
                <AccessGate onAccessGranted={handleAccessGranted} />
            ) : (
                <Dashboard />
            )}
        </div>
    );
};

export default CommitAnalyzer;
