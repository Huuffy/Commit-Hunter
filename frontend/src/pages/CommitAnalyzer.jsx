import React from "react";
import Dashboard from "../components/commit-analyzer/Dashboard";
import Background from "../components/background";

const CommitAnalyzer = () => {
    return (
        <div className="relative min-h-screen overflow-x-hidden bg-black text-white">
            <Background />
            <Dashboard />
        </div>
    );
};

export default CommitAnalyzer;
