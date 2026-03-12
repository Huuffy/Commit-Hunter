import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Background from "../components/background";

import TeamReport from "../components/commit-analyzer/TeamReport";

const CommitReport = () => {
    const { team_name } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const access = sessionStorage.getItem("commitAccess");
        if (access !== "true") {
            navigate("/commit-analyzer");
        }
        setLoading(false);
    }, [navigate]);

    if (loading) return null;

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
