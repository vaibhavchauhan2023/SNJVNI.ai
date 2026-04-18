import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
} from "recharts";
import {
  Activity,
  Brain,
  ChevronDown,
  Lightbulb,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { supabase } from "../lib/supabase.js";

const RANGE_OPTIONS = [
  { key: "3months", label: "3 months" },
  { key: "6months", label: "6 months" },
  { key: "1year", label: "1 year" },
  { key: "all", label: "All time" },
];

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

function getTrendStyles(status) {
  if (status === "worsening") {
    return {
      badge: "border border-[#F4D3CB] bg-[#FFF5F2] text-[#DC2626]",
      dot: "bg-[#DC2626]",
      line: "#DC2626",
    };
  }

  if (status === "improving") {
    return {
      badge: "border border-[#CDEAE2] bg-[#EEF8F5] text-[#0F6E56]",
      dot: "bg-[#0F6E56]",
      line: "#0F6E56",
    };
  }

  return {
    badge: "border border-[#FEF3C7] bg-[#FFFBEB] text-[#D97706]",
    dot: "bg-[#D97706]",
    line: "#D97706",
  };
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  const row = payload[0]?.payload;
  const shownValue =
    row?.value !== null && row?.value !== undefined ? row.value : row?.projectedValue;

  return (
    <div className="rounded-2xl border border-[#DCE5E3] bg-white p-4 shadow-[0_10px_24px_rgba(16,24,40,0.08)]">
      <p className="text-sm font-semibold text-[#172033]">{label}</p>
      <div className="mt-2 space-y-1 text-sm text-[#7587A6]">
        <p>
          <span className="font-medium text-[#172033]">Value:</span> {shownValue} {row?.unit}
        </p>
        <p>
          <span className="font-medium text-[#172033]">Date:</span> {label}
        </p>
        {row?.status && (
          <p>
            <span className="font-medium text-[#172033]">Status:</span> {row.status}
          </p>
        )}
      </div>
    </div>
  );
}

function InsightCard({ icon, title, text }) {
  return (
    <div className="rounded-[24px] border border-[#DCE5E3] bg-white p-5 shadow-sm">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF7F4] text-[#167C6B]">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-[#172033]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#7C8DAA]">{text}</p>
    </div>
  );
}

export default function TrendTrackerPage() {
  const navigate = useNavigate();
  
  const [allMarkers, setAllMarkers] = useState([]);
  const [selectedMarkerName, setSelectedMarkerName] = useState("");
  const [timeRange, setTimeRange] = useState("6months");
  const [showProjected, setShowProjected] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalReports, setTotalReports] = useState(0);

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/trends`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch trends");

      const data = await res.json();
      console.log("Trends data:", data);

      setAllMarkers(data.markers || []);
      setTotalReports(data.totalReports || 0);

      if (data.markers?.length > 0) {
        const firstFlagged = data.markers.find((m) => m.latestStatus !== "normal");
        setSelectedMarkerName(firstFlagged?.name || data.markers[0].name);
      }
    } catch (err) {
      console.error("Trends fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedMarker = allMarkers.find((m) => m.name === selectedMarkerName);

  const getFilteredDataPoints = () => {
    if (!selectedMarker) return [];

    const now = new Date();
    const points = selectedMarker.dataPoints;

    return points.filter((p) => {
      const date = new Date(p.date);
      if (timeRange === "3months") {
        const cutoff = new Date();
        cutoff.setMonth(cutoff.getMonth() - 3);
        return date >= cutoff;
      }
      if (timeRange === "1year") {
        const cutoff = new Date();
        cutoff.setFullYear(cutoff.getFullYear() - 1);
        return date >= cutoff;
      }
      return true;
    });
  };

  const filteredPoints = getFilteredDataPoints();

  const parseRange = (rangeStr) => {
    if (!rangeStr) return { min: null, max: null };
    const parts = rangeStr.split(/[-–]/).map((s) => parseFloat(s.trim()));
    if (parts.length === 2 && !isNaN(parts[0])) {
      return { min: parts[0], max: parts[1] };
    }
    if (rangeStr.includes("<")) {
      return { min: 0, max: parseFloat(rangeStr.replace("<", "").trim()) };
    }
    if (rangeStr.includes(">")) {
      return { min: parseFloat(rangeStr.replace(">", "").trim()), max: null };
    }
    return { min: null, max: null };
  };

  const referenceRange = parseRange(selectedMarker?.referenceRange);

  const chartData = useMemo(() => {
    if (!selectedMarker) return [];
    
    const base = filteredPoints.map((p) => ({
      dateLabel: new Date(p.date).toLocaleDateString("en-IN"),
      value: p.value,
      reportId: p.reportId,
      status: p.status,
      unit: selectedMarker.unit,
      projectedValue: null
    }));

    if (showProjected && selectedMarker.projectedPoints && base.length > 0) {
      base[base.length - 1].projectedValue = base[base.length - 1].value;
      selectedMarker.projectedPoints.forEach((p) => {
        base.push({
          dateLabel: new Date(p.date).toLocaleDateString("en-IN"),
          value: null,
          projectedValue: Math.round(p.value * 10) / 10,
          status: "Projected",
          unit: selectedMarker.unit
        });
      });
    }

    return base;
  }, [filteredPoints, showProjected, selectedMarker]);

  const trendStyles = selectedMarker ? getTrendStyles(selectedMarker.trend) : getTrendStyles("stable");

  const summaryText = useMemo(() => {
    if (!selectedMarker) return "";
    if (selectedMarker.trend === "improving") {
      return `Your ${selectedMarker.name} has dropped/improved ${selectedMarker.trendPercent?.toFixed(
        1
      )}% over the last ${filteredPoints.length} reports.`;
    }
    if (selectedMarker.trend === "worsening") {
      return `Your ${selectedMarker.name} has worsened by ${selectedMarker.trendPercent?.toFixed(
        1
      )}% over the last ${filteredPoints.length} reports. Consider consulting your doctor.`;
    }
    return `Your ${selectedMarker.name} has remained stable across your last ${filteredPoints.length} reports.`;
  }, [selectedMarker, filteredPoints.length]);

  const didYouKnow = {
    Thyroid: "TSH levels can be affected by stress, sleep, and certain medications.",
    Blood: "Haemoglobin levels are naturally lower in women and can improve with iron-rich foods.",
    Heart: "High LDL is strongly correlated with a higher risk of heart disease and stroke.",
    Kidney: "Creatinine levels can temporarily rise after intense exercise.",
    Metabolic: "Fasting glucose levels are best tested in the morning before eating.",
    Immunity: "Vitamin D deficiency is extremely common in India due to indoor lifestyles.",
    Liver: "Liver enzymes can be elevated by certain medications and fatty foods.",
    Hormones: "Hormone levels fluctuate throughout the day — timing of tests matters.",
  };

  const yDomain = useMemo(() => {
    if (!selectedMarker) return [0, 100];
    
    const values = chartData.flatMap((item) => {
      const arr = [];
      if (typeof item.value === "number") arr.push(item.value);
      if (typeof item.projectedValue === "number") arr.push(item.projectedValue);
      return arr;
    });

    if (referenceRange.min !== null) values.push(referenceRange.min);
    if (referenceRange.max !== null) values.push(referenceRange.max);

    const min = values.length > 0 ? Math.min(...values) : 0;
    const max = values.length > 0 ? Math.max(...values) : 100;
    const padding = (max - min) * 0.15 || 1;

    return [Math.max(0, min - padding), max + padding];
  }, [chartData, referenceRange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFBF8] px-4 py-8 pt-24 sm:px-6 lg:px-8 xl:pt-[100px]">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 h-8 w-48 animate-pulse rounded bg-gray-200"></div>
          <div className="mb-6 h-[100px] animate-pulse rounded-[28px] bg-gray-200"></div>
          <div className="mb-6 h-[400px] animate-pulse rounded-[28px] bg-gray-200"></div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-[150px] animate-pulse rounded-[24px] bg-gray-200"></div>
            <div className="h-[150px] animate-pulse rounded-[24px] bg-gray-200"></div>
            <div className="h-[150px] animate-pulse rounded-[24px] bg-gray-200"></div>
          </div>
        </div>
      </div>
    );
  }

  if (totalReports === 0) {
    return (
      <div className="min-h-screen bg-[#FAFBF8] px-4 py-8 pt-24 sm:px-6 lg:px-8 xl:pt-[100px]">
        <div className="mx-auto max-w-7xl text-center flex flex-col items-center justify-center min-h-[60vh]">
          <h2 className="text-2xl font-bold tracking-tight text-[#172033] sm:text-3xl">No trend data yet</h2>
          <p className="mt-4 max-w-lg text-base leading-7 text-[#8A9AB5]">
            Upload at least 2 reports to see how your markers change over time.
          </p>
          <button
            onClick={() => navigate('/upload')}
            className="mt-6 rounded-full bg-[#167C6B] px-6 py-3 text-sm font-semibold text-white shadow hover:bg-[#126456]"
          >
            Upload report
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFBF8] px-4 py-8 pt-24 sm:px-6 lg:px-8 xl:pt-[100px]">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBF8] px-4 py-8 pt-24 sm:px-6 lg:px-8 xl:pt-[100px]">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#CDEAE2] bg-[#EEF8F5] px-3 py-1 text-sm font-medium text-[#167C6B]">
            <Activity size={16} />
            Trend Tracker
          </div>

          <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#172033] sm:text-3xl">
            Track your health marker over time
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#8A9AB5] sm:text-base">
            See how each marker is moving, whether it is inside the normal range, and what simple habit may help.
          </p>
        </div>

        {selectedMarker ? (
          <>
            {/* Summary strip */}
            <div className="mb-6 rounded-[28px] border border-[#CDEAE2] bg-[#EAF7F4] p-4 sm:p-5">
              <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#8A9AB5]">
                    Current marker
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[#172033]">
                    {selectedMarker?.plainName || selectedMarker?.name}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#8A9AB5]">
                    Latest value
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[#167C6B]">
                    {selectedMarker?.latestValue} {selectedMarker?.unit}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#8A9AB5]">
                    Current status
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[#172033]">
                    {selectedMarker?.latestStatus === 'normal' 
                      ? 'Normal' 
                      : selectedMarker?.latestStatus === 'critical'
                      ? 'Critical'
                      : selectedMarker?.latestStatus === 'high'
                      ? 'High'
                      : 'Low'}
                  </p>
                </div>

                <div className="flex items-center xl:justify-end">
                  <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold flex-shrink-0 ${trendStyles.badge}`}>
                    <span className={`h-2.5 w-2.5 rounded-full ${trendStyles.dot}`} />
                    {selectedMarker?.trend === 'improving' 
                      ? 'Improving' 
                      : selectedMarker?.trend === 'worsening'
                      ? 'Worsening'
                      : 'Stable'}
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto]">
              <div className="rounded-[28px] border border-[#DCE5E3] bg-white p-4 shadow-sm">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#172033]">
                      Choose a marker
                    </label>

                    <div className="relative">
                      <select
                        value={selectedMarkerName}
                        onChange={(e) => setSelectedMarkerName(e.target.value)}
                        className="w-full appearance-none rounded-2xl border border-[#D7E0DE] bg-white px-4 py-3 pr-10 text-sm font-medium text-[#172033] outline-none transition focus:border-[#167C6B] focus:ring-4 focus:ring-[#16AFA2]/10"
                      >
                        {allMarkers.map((m) => (
                          <option key={m.name} value={m.name}>
                            {m.plainName || m.name}
                          </option>
                        ))}
                      </select>

                      <ChevronDown
                        size={18}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8A9AB5]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#172033]">
                      Time range
                    </label>

                    <div className="flex flex-wrap gap-2">
                      {RANGE_OPTIONS.map((option) => {
                        const isActive = timeRange === option.key;

                        return (
                          <button
                            key={option.key}
                            type="button"
                            onClick={() => setTimeRange(option.key)}
                            className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                              isActive
                                ? "bg-[#167C6B] text-white shadow-sm"
                                : "border border-[#D7E0DE] bg-white text-[#5E708F] hover:border-[#A8D6CC] hover:text-[#167C6B]"
                            }`}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowProjected((prev) => !prev)}
                className="flex items-center justify-between gap-3 rounded-[28px] border border-[#DCE5E3] bg-white px-5 py-4 text-left shadow-sm transition hover:border-[#A8D6CC]"
              >
                <div>
                  <p className="text-sm font-semibold text-[#172033]">Projected Path</p>
                  <p className="text-xs text-[#8A9AB5]">Show or hide the AI prediction line</p>
                </div>

                <div className="text-[#167C6B]">
                  {showProjected ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                </div>
              </button>
            </div>

            {/* Chart */}
            <div className="rounded-[28px] border border-[#DCE5E3] bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-semibold text-[#172033]">
                      {selectedMarker?.name} trend
                    </h2>

                    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${trendStyles.badge}`}>
                      <span className={`h-2.5 w-2.5 rounded-full ${trendStyles.dot}`} />
                      {selectedMarker?.trend === 'improving' 
                        ? 'Improving' 
                        : selectedMarker?.trend === 'worsening'
                        ? 'Worsening'
                        : 'Stable'}
                    </div>
                  </div>

                  <p className="mt-2 text-sm text-[#8A9AB5]">
                    Latest reading:{" "}
                    <span className="font-semibold text-[#172033]">
                      {selectedMarker?.latestValue} {selectedMarker?.unit}
                    </span>{" "}
                    • {selectedMarker?.latestStatus}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#F6F8F7] px-4 py-3 text-sm text-[#6E7F9E]">
                  <span className="font-medium text-[#172033]">Normal range:</span>{" "}
                  {selectedMarker?.referenceRange}
                </div>
              </div>

              {totalReports === 1 ? (
                <div className="h-[340px] w-full sm:h-[400px] flex items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                  <div className="text-center p-6">
                    <div className="text-4xl mb-4">📈</div>
                    <p className="text-[#172033] font-medium mb-2">Upload more reports to see your trend line.</p>
                    <p className="text-[#8A9AB5] text-sm">You need at least 2 reports to track changes.</p>
                  </div>
                </div>
              ) : (
                <div className="h-[340px] w-full sm:h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E6ECEB" />

                      {referenceRange.min !== null && referenceRange.max !== null && (
                        <ReferenceArea
                          y1={referenceRange.min}
                          y2={referenceRange.max}
                          fill="#EAF7F4"
                          fillOpacity={1}
                        />
                      )}

                      <XAxis
                        dataKey="dateLabel"
                        tick={{ fill: "#7F90AC", fontSize: 12 }}
                        axisLine={{ stroke: "#D7E0DE" }}
                        tickLine={false}
                      />

                      <YAxis
                        domain={yDomain}
                        tick={{ fill: "#7F90AC", fontSize: 12 }}
                        axisLine={{ stroke: "#D7E0DE" }}
                        tickLine={false}
                        width={54}
                      />

                      <Tooltip content={<CustomTooltip />} />

                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#167C6B"
                        strokeWidth={3}
                        dot={{
                          r: 4,
                          fill: "#167C6B",
                          onClick: (e, payload) => {
                            if (payload?.payload?.reportId) {
                              navigate(`/report/${payload.payload.reportId}`);
                            }
                          }
                        }}
                        activeDot={{
                          r: 6,
                          onClick: (e, payload) => {
                            if (payload?.payload?.reportId) {
                              navigate(`/report/${payload.payload.reportId}`);
                            }
                          }
                        }}
                        className="cursor-pointer"
                      />

                      {showProjected && (
                        <Line
                          type="monotone"
                          dataKey="projectedValue"
                          stroke="#172033"
                          strokeWidth={2.5}
                          strokeDasharray="6 6"
                          dot={{ r: 3, fill: "#172033" }}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-3 text-xs sm:text-sm">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#F5F7F8] px-3 py-2 text-[#5E708F]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#167C6B]" />
                  Historical values (clickable)
                </div>

                <div className="inline-flex items-center gap-2 rounded-full bg-[#F5F7F8] px-3 py-2 text-[#5E708F]">
                  <span className="h-0.5 w-6 border-t-2 border-dashed border-[#172033]" />
                  Projected path
                </div>

                <div className="inline-flex items-center gap-2 rounded-full bg-[#EEF8F5] px-3 py-2 text-[#167C6B]">
                  <span className="h-3 w-3 rounded-sm bg-[#CDEAE2]" />
                  Normal range
                </div>
              </div>
            </div>

            {/* Insight cards */}
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <InsightCard
                icon={<Sparkles size={20} />}
                title="Trend Summary"
                text={summaryText}
              />

              <InsightCard
                icon={<Lightbulb size={20} />}
                title="Actionable Habit"
                text={selectedMarker?.explanation || 'Track more reports to see personalized habits.'}
              />

              <InsightCard
                icon={<Brain size={20} />}
                title="Did you know?"
                text={didYouKnow[selectedMarker?.bodySystem] || 'Regular testing helps you spot health trends before they become serious.'}
              />
            </div>
          </>
        ) : (
          <div className="mt-6 rounded-[24px] bg-white p-8 text-center text-[#7C8DAA] shadow-sm">
            No markers found that match the criteria.
          </div>
        )}

        {/* Footer note */}
        <div className="mt-6 rounded-[24px] border border-[#DCE5E3] bg-white p-4 text-sm leading-6 text-[#7C8DAA] shadow-sm mb-16">
          This view helps you spot patterns across reports. Lab ranges can differ from one lab to another, so always compare with your actual report and your doctor’s advice.
        </div>
      </div>
    </div>
  );
}
