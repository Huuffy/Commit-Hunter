import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faRobot,
  faCode,
  faFileCode,
  faChartBar,
  faExclamationTriangle,
  faUsers,
  faFolderOpen,
  faTachometerAlt,
  faStar,
  faPrint,
} from "@fortawesome/free-solid-svg-icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import commitAnalyzerClient from "../../api/commitAnalyzerClient";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#0088FE",
  "#00C49F",
  "#FF6B6B",
  "#4ECDC4",
];

// Module-level cache per team — persists across navigations
const _analyticsCache = {};

const TeamReport = () => {
  const { team_name } = useParams();
  const cached = _analyticsCache[team_name];
  const [analytics, setAnalytics] = useState(cached || null);
  const [loading, setLoading] = useState(!cached);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState(null);
  const reportRef = useRef(null);

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    fetchAnalytics();
  }, [team_name]);

  const parseAnalyticsResponse = (res) => {
    let dataToUse = res.data;
    if (dataToUse.data) dataToUse = dataToUse.data;
    if (Array.isArray(dataToUse)) dataToUse = dataToUse[0];
    if (
      dataToUse &&
      dataToUse.analytics &&
      (dataToUse.analytics.hourly_commits || dataToUse.analytics.commit_count)
    ) {
      dataToUse = { ...dataToUse, ...dataToUse.analytics };
    }
    return dataToUse;
  };

  const fetchAnalytics = async () => {
    try {
      if (!_analyticsCache[team_name]) setLoading(true);
      setError(null);
      const res = await commitAnalyzerClient.get(
        `/api/v1/history/analytics/${team_name}`
      );
      const dataToUse = parseAnalyticsResponse(res);
      _analyticsCache[team_name] = dataToUse;
      setAnalytics(dataToUse);
    } catch (err) {
      console.error("Fetch Analytics Error:", err);
      if (!_analyticsCache[team_name]) {
        setError(
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch analytics."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Silent background refresh — no spinner
  const fetchAnalyticsBackground = async () => {
    try {
      const res = await commitAnalyzerClient.get(
        `/api/v1/history/analytics/${team_name}`
      );
      const dataToUse = parseAnalyticsResponse(res);
      _analyticsCache[team_name] = dataToUse;
      setAnalytics(dataToUse);
    } catch (err) {
      // Silent fail
    }
  };

  const handleGenerateReview = async () => {
    try {
      setAiLoading(true);
      const res = await commitAnalyzerClient.post(
        `/api/v1/collect/finalize-team/${team_name}`
      );
      if (res.data.success || res.status === 200) {
        await fetchAnalytics();
      } else {
        alert(
          "Failed to generate: " + (res.data.message || "Unknown error")
        );
      }
    } catch (err) {
      console.error("Generate Review Error:", err);
      alert(
        "Failed to generate review: " +
        (err.response?.data?.message || err.message)
      );
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-purple-300">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mr-4"></div>
        Loading Analytics...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-10 text-red-400">
        <FontAwesomeIcon
          icon={faExclamationTriangle}
          className="text-4xl mb-4"
        />
        <p>{error}</p>
        <Link
          to="/commit-analyzer"
          className="text-purple-400 underline mt-4 block"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!analytics) return null;

  // --- Data Transformations ---

  // Convert flat hourly_commits array [3, 0, 0, ...] to chart data [{hour: "00:00", commits: 3}, ...]
  const hourlyCommitsData = (analytics.hourly_commits || []).map(
    (count, i) => ({
      hour: `${String(i).padStart(2, "0")}:00`,
      commits: count,
    })
  );

  // Convert flat hourly_volume array to chart data
  const hourlyVolumeData = (analytics.hourly_volume || []).map((vol, i) => ({
    hour: `${String(i).padStart(2, "0")}:00`,
    volume: vol,
  }));

  // Merge hourly data for combined chart
  const hourlyMergedData = hourlyCommitsData.map((item, i) => ({
    ...item,
    volume: hourlyVolumeData[i]?.volume || 0,
  }));

  // top_contributors: [{name: "Saragorule13", commits: 3}, ...]
  const topContributors = analytics.top_contributors || [];

  // recent_commits: [{message, author_name, score, summary, url, date}, ...]
  const recentCommits = analytics.recent_commits || [];

  // Score color helper
  const getScoreColor = (score) => {
    if (score >= 8) return "text-green-400";
    if (score >= 5) return "text-yellow-400";
    if (score >= 3) return "text-orange-400";
    return "text-red-400";
  };

  const getScoreBg = (score) => {
    if (score >= 8) return "bg-green-500/20 border-green-500/30";
    if (score >= 5) return "bg-yellow-500/20 border-yellow-500/30";
    if (score >= 3) return "bg-orange-500/20 border-orange-500/30";
    return "bg-red-500/20 border-red-500/30";
  };

  return (
    <>
      {/* Print Styles */}
      <style>{`
        @media print {
          /* ===== Page Setup ===== */
          @page {
            size: A4;
            margin: 15mm 12mm 20mm 12mm;
          }

          /* Global Resets: Break out of any screen-height containers */
          html, body, #root, main, div {
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
          }
          
          /* Hide everything first */
          body * {
            visibility: hidden;
          }

          /* Show the report and its children */
          .team-report-printable,
          .team-report-printable * {
            visibility: visible;
          }
          
          /* Position the report at the very top */
          .team-report-printable {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto !important;
            margin: 0;
            padding: 0;
            background: #ffffff !important;
            color: #1e293b !important;
            font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
            z-index: 9999;
          }

          /* Hide interactive / web-only elements */
          .no-print,
          .team-report-printable .commit-view-link {
            display: none !important;
          }

          /* ===== Typography ===== */
          .team-report-printable h1 {
            color: #1e293b !important;
            font-size: 26pt !important;
            font-weight: 800 !important;
            letter-spacing: -0.5px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .team-report-printable h3 {
            color: #334155 !important;
            font-size: 13pt !important;
            font-weight: 700 !important;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 8px;
            margin-bottom: 16px !important;
          }
          .team-report-printable p,
          .team-report-printable span,
          .team-report-printable div {
            color: #334155 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* ===== Report Header Accent ===== */
          .print-header-section {
            border-top: 4px solid #6366f1 !important;
            padding-top: 12px !important;
            margin-bottom: 24px !important;
          }
          .print-header-section h1 span {
            color: #6366f1 !important;
            -webkit-text-fill-color: #6366f1 !important;
            background: none !important;
          }

          /* ===== Stats Row ===== */
          .print-stats-row {
            display: flex !important;
            gap: 0 !important;
            background: #f8fafc !important;
            border: 1.5px solid #e2e8f0 !important;
            border-radius: 8px !important;
            padding: 12px 16px !important;
            margin-bottom: 24px !important;
          }
          .print-stats-row > div {
            border-color: #cbd5e1 !important;
          }
          .print-stats-row .text-2xl {
            font-size: 16pt !important;
            font-weight: 800 !important;
          }
          /* Preserve stat accent colors */
          .print-stats-row .text-green-400 { color: #16a34a !important; }
          .print-stats-row .text-red-400   { color: #dc2626 !important; }
          .print-stats-row .text-blue-400  { color: #2563eb !important; }
          .print-stats-row .text-yellow-400 { color: #ca8a04 !important; }
          .print-stats-row .text-green-300,
          .print-stats-row .text-red-300,
          .print-stats-row .text-blue-300,
          .print-stats-row .text-yellow-300,
          .print-stats-row .text-purple-300 { color: #64748b !important; }

          /* ===== Card Sections ===== */
          .team-report-printable .print-card {
            background: #ffffff !important;
            border: 1.5px solid #e2e8f0 !important;
            border-radius: 8px !important;
            box-shadow: none !important;
            padding: 16px !important;
            margin-bottom: 16px !important;
          }

          /* ===== AI Review ===== */
          .team-report-printable .print-ai-review {
            background: #faf5ff !important;
            border: 1.5px solid #d8b4fe !important;
            border-left: 4px solid #a855f7 !important;
            border-radius: 8px !important;
            page-break-inside: avoid;
          }
          .team-report-printable .print-ai-review .prose p {
            color: #374151 !important;
            font-size: 10pt !important;
            line-height: 1.7 !important;
          }

          /* ===== Contributors Grid ===== */
          .team-report-printable .print-contributor-card {
            background: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 6px !important;
          }
          .team-report-printable .print-contributor-card .bg-gradient-to-br {
            background: #6366f1 !important;
            color: white !important;
          }
          .team-report-printable .print-contributor-card .bg-gradient-to-br * {
            color: white !important;
          }

          /* ===== Charts ===== */
          .recharts-wrapper,
          .recharts-surface {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .recharts-cartesian-grid-horizontal line,
          .recharts-cartesian-grid-vertical line {
            stroke: #e2e8f0 !important;
          }
          .recharts-text {
            fill: #475569 !important;
          }

          /* ===== Commit List ===== */
          .team-report-printable .print-commit-item {
            background: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 6px !important;
            page-break-inside: avoid;
          }
          /* Score badge colors in print */
          .team-report-printable .text-green-400  { color: #16a34a !important; }
          .team-report-printable .text-yellow-400 { color: #ca8a04 !important; }
          .team-report-printable .text-orange-400 { color: #ea580c !important; }
          .team-report-printable .text-red-400    { color: #dc2626 !important; }
          .team-report-printable .text-blue-300   { color: #2563eb !important; }
          .team-report-printable .text-pink-400   { color: #db2777 !important; }
          .team-report-printable .text-blue-400   { color: #2563eb !important; }
          .team-report-printable .text-purple-400,
          .team-report-printable .text-purple-300 { color: #7c3aed !important; }
          .team-report-printable .text-orange-400 { color: #ea580c !important; }

          /* Score badge backgrounds */
          .team-report-printable .bg-green-500\\/20  { background: #dcfce7 !important; border-color: #86efac !important; }
          .team-report-printable .bg-yellow-500\\/20 { background: #fef9c3 !important; border-color: #fde047 !important; }
          .team-report-printable .bg-orange-500\\/20 { background: #ffedd5 !important; border-color: #fdba74 !important; }
          .team-report-printable .bg-red-500\\/20    { background: #fee2e2 !important; border-color: #fca5a5 !important; }

          /* ===== Page Breaks ===== */
          .team-report-printable .grid {
            break-inside: avoid;
          }
          .team-report-printable .print-card {
            break-inside: avoid;
          }
          .team-report-printable .print-section-break {
            break-before: page;
          }

          /* ===== Footer ===== */
          .print-footer {
            display: block !important;
            margin-top: 32px;
            padding-top: 12px;
            border-top: 1px solid #cbd5e1;
            text-align: center;
            font-size: 8pt;
            color: #94a3b8 !important;
          }

          /* ===== Pie Chart Legend ===== */
          .team-report-printable .print-legend-dot {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <div className="relative z-10 p-6 md:p-10 max-w-7xl mx-auto text-white team-report-printable" ref={reportRef}>
        <Link
          to="/admin/commit-analyzer"
          className="inline-flex items-center gap-2 text-purple-300 hover:text-white mb-8 transition-colors no-print"
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4 print-header-section">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                {analytics.team_name}
              </span>{" "}
              Report
            </h1>
            <button
              onClick={handlePrint}
              className="no-print mt-2 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-sm font-medium hover:opacity-90 transition-all shadow-lg shadow-purple-900/20"
            >
              <FontAwesomeIcon icon={faPrint} />
              Print Report
            </button>
          </div>

          <div className="flex gap-4 flex-wrap print-stats-row">
            <div className="text-right">
              <p className="text-xs text-purple-300 uppercase tracking-widest">
                Total Commits
              </p>
              <p className="text-2xl font-bold">
                {analytics.commit_count || 0}
              </p>
            </div>
            <div className="text-right border-l border-white/10 pl-4">
              <p className="text-xs text-green-300 uppercase tracking-widest">
                Additions
              </p>
              <p className="text-2xl font-bold text-green-400">
                +{analytics.additions || 0}
              </p>
            </div>
            <div className="text-right border-l border-white/10 pl-4">
              <p className="text-xs text-red-300 uppercase tracking-widest">
                Deletions
              </p>
              <p className="text-2xl font-bold text-red-400">
                -{analytics.deletions || 0}
              </p>
            </div>
            <div className="text-right border-l border-white/10 pl-4">
              <p className="text-xs text-blue-300 uppercase tracking-widest">
                Churn Rate
              </p>
              <p className="text-2xl font-bold text-blue-400">
                {(analytics.churn_rate || 0).toFixed(1)}%
              </p>
            </div>
            <div className="text-right border-l border-white/10 pl-4">
              <p className="text-xs text-yellow-300 uppercase tracking-widest">
                Productivity
              </p>
              <p className="text-2xl font-bold text-yellow-400">
                {(analytics.productivity_score || 0).toFixed(1)}
              </p>
            </div>
          </div>
        </div>

        {/* AI Review Section */}
        <div
          className={`mb-10 rounded-2xl p-8 border backdrop-blur-md transition-all print-ai-review ${analytics.final_review
            ? "bg-purple-900/10 border-purple-500/30"
            : "bg-white/5 border-white/10"
            }`}
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-purple-500/20 text-purple-300">
              <FontAwesomeIcon icon={faRobot} className="text-2xl" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">
                AI Code Review Analysis
              </h3>

              {analytics.final_review ? (
                <div className="prose prose-invert max-w-none text-gray-300">
                  <p className="whitespace-pre-line leading-relaxed">
                    {analytics.final_review}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-400 mb-4">
                    No AI review available. Reviews require a live backend with Ollama.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Contributors */}
        {topContributors.length > 0 && (
          <div className="mb-10 bg-slate-900/50 border border-white/10 rounded-2xl p-6 print-card">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <FontAwesomeIcon icon={faUsers} className="text-yellow-400" />
              Top Contributors
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {topContributors.map((contributor, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-yellow-500/30 transition-colors print-contributor-card"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold">
                    {contributor.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">
                      {contributor.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {contributor.commits} commit
                      {contributor.commits !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Simplified Grid */}
        <div className="grid grid-cols-1 gap-8 mb-10 print-section-break">
          {/* Hourly Activity */}
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 print-card">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <FontAwesomeIcon icon={faChartBar} className="text-blue-400" />
              Commit Activity
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyMergedData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                  />
                  <XAxis
                    dataKey="hour"
                    stroke="#9ca3af"
                    fontSize={10}
                    interval={2}
                  />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      borderColor: "#334155",
                      color: "#fff",
                    }}
                    cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  />
                  <Bar
                    dataKey="commits"
                    fill="#8884d8"
                    radius={[4, 4, 0, 0]}
                    name="Commits"
                  />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Commits List */}
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 print-card print-section-break">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <FontAwesomeIcon icon={faCode} className="text-pink-400" />
            Recent Commits
          </h3>
          <div className="space-y-4">
            {recentCommits.length > 0 ? (
              recentCommits.map((commit, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/30 transition-colors print-commit-item"
                >
                  {/* Score Badge */}
                  <div
                    className={`flex flex-col items-center justify-center min-w-[48px] px-2 py-1.5 rounded-lg border ${getScoreBg(
                      commit.score
                    )}`}
                  >
                    <FontAwesomeIcon
                      icon={faStar}
                      className={`text-xs mb-0.5 ${getScoreColor(
                        commit.score
                      )}`}
                    />
                    <span
                      className={`text-lg font-bold ${getScoreColor(
                        commit.score
                      )}`}
                    >
                      {commit.score}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">
                      {commit.message}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span className="text-blue-300">
                        {commit.author_name}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(commit.date).toLocaleString()}
                      </span>
                    </div>
                    {commit.summary && (
                      <p className="mt-2 text-xs text-gray-400 italic">
                        {commit.summary}
                      </p>
                    )}
                  </div>

                  <a
                    href={commit.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-purple-300 transition-colors whitespace-nowrap commit-view-link"
                  >
                    View
                  </a>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">
                No commit data available.
              </p>
            )}
          </div>
        </div>

        {/* Print-only footer */}
        <div className="print-footer hidden">
          Report generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} • Coherence Commit Analyzer
        </div>
      </div >
    </>
  );
};

export default TeamReport;
