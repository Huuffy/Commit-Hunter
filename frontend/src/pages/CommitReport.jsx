import React from "react";
import Background from "../components/background";
import TeamReport from "../components/commit-analyzer/TeamReport";

const CommitReport = () => {
    return (
        <div className="relative min-h-screen overflow-x-hidden bg-black text-white">
             <Background />
             <div className="relative z-10 pt-20">
                <TeamReport />
             </div>
        </div>
    );
};

export default CommitReport;
