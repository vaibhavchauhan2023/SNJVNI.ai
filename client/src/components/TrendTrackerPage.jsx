import React, { useMemo, useState } from "react";
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
import { trendTrackerData } from "../data/trendTrackerData";

const RANGE_OPTIONS = [
  { key: "3m", label: "3 months" },
  { key: "6m", label: "6 months" },
  { key: "1y", label: "1 year" },
  { key: "all", label: "All time" },
];

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

function getCutoffDate(rangeKey, latestDate) {
  const latest = new Date(latestDate);

  if (rangeKey === "3m") {
    latest.setMonth(latest.getMonth() - 3);
    return latest;
  }
  if (rangeKey === "6m") {
    latest.setMonth(latest.getMonth() - 6);
    return latest;
  }
  if (rangeKey === "1y") {
    latest.setFullYear(latest.getFullYear() - 1);
    return latest;
  }

  return null;
}

function distanceFromNormal(value, range) {
  if (value < range.min) return range.min - value;
  if (value > range.max) return value - range.max;
  return 0;
}

function getCenterDistance(value, range) {
  const center = (range.min + range.max) / 2;
  return Math.abs(value - center);
}

function getTrendStatus(data, range) {
  if (!data || data.length < 2) return "Stable";

  const first = data[0].value;
  const latest = data[data.length - 1].value;

  const firstDistance = distanceFromNormal(first, range);
  const latestDistance = distanceFromNormal(latest, range);

  if (firstDistance === 0 && latestDistance === 0) {
    const firstCenterDistance = getCenterDistance(first, range);
    const latestCenterDistance = getCenterDistance(latest, range);

    if (latestCenterDistance < firstCenterDistance - 0.1) return "Improving";
    if (latestCenterDistance > firstCenterDistance + 0.1) return "Worsening";
    return "Stable";
  }

  if (latestDistance < firstDistance - 0.1) return "Improving";
  if (latestDistance > firstDistance + 0.1) return "Worsening";
  return "Stable";
}

function getTrendStyles(status) {
  if (status === "Worsening") {
    return {
      badge:
        "border border-[#F4D3CB] bg-[#FFF5F2] text-[#D94F2B]",
      dot: "bg-[#D94F2B]",
      line: "#D94F2B",
    };
  }

  if (status === "Improving") {
    return {
      badge:
        "border border-[#CDEAE2] bg-[#EEF8F5] text-[#167C6B]",
      dot: "bg-[#167C6B]",
      line: "#167C6B",
    };
  }

  return {
    badge:
      "border border-[#CDEAE2] bg-[#EEF8F5] text-[#167C6B]",
    dot: "bg-[#16AFA2]",
    line: "#16AFA2",
  };
}

function getProjectedPoint(data) {
  if (!data || data.length < 3) return null;

  const lastThree = data.slice(-3);
  const slope1 = lastThree[1].value - lastThree[0].value;
  const slope2 = lastThree[2].value - lastThree[1].value;
  const avgSlope = (slope1 + slope2) / 2;

  const date1 = new Date(lastThree[1].date).getTime();
  const date2 = new Date(lastThree[2].date).getTime();
  const averageGap = date2 - date1 || 30 * 24 * 60 * 60 * 1000;

  const nextDate = new Date(new Date(lastThree[2].date).getTime() + averageGap);

  return {
    date: nextDate.toISOString().split("T")[0],
    dateLabel: formatDate(nextDate),
    value: null,
    projectedValue: Number((lastThree[2].value + avgSlope).toFixed(2)),
    status: "Projected",
    isProjected: true,
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
        <p>
          <span className="font-medium text-[#172033]">Status:</span> {row?.status}
        </p>
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
  const [selectedMarker, setSelectedMarker] = useState("ldl");
  const [selectedRange, setSelectedRange] = useState("6m");
  const [showProjection, setShowProjection] = useState(true);

  const marker = useMemo(() => {
    return trendTrackerData.find((item) => item.id === selectedMarker) || trendTrackerData[0];
  }, [selectedMarker]);

  const visibleReports = useMemo(() => {
    const latestDate = marker.reports[marker.reports.length - 1]?.date;
    const cutoff = getCutoffDate(selectedRange, latestDate);

    if (!cutoff) return marker.reports;

    return marker.reports.filter((item) => new Date(item.date) >= cutoff);
  }, [marker, selectedRange]);

  const trendStatus = useMemo(() => {
    return getTrendStatus(visibleReports, marker.referenceRange);
  }, [visibleReports, marker.referenceRange]);

  const trendStyles = getTrendStyles(trendStatus);

  const projectedPoint = useMemo(() => {
    return getProjectedPoint(visibleReports);
  }, [visibleReports]);

  const chartData = useMemo(() => {
    const base = visibleReports.map((item) => ({
      ...item,
      dateLabel: formatDate(item.date),
      projectedValue: null,
    }));

    if (showProjection && projectedPoint && base.length) {
      base[base.length - 1].projectedValue = base[base.length - 1].value;
      base.push({
        ...projectedPoint,
        unit: marker.unit,
        referenceRange: marker.referenceRange,
      });
    }

    return base;
  }, [visibleReports, showProjection, projectedPoint, marker]);

  const latestReport = visibleReports[visibleReports.length - 1];
  const lastThree = visibleReports.slice(-3);

  const summaryText = useMemo(() => {
    if (lastThree.length < 2) return "Not enough past reports yet to describe a trend.";

    const first = lastThree[0].value;
    const latest = lastThree[lastThree.length - 1].value;
    const change = ((latest - first) / first) * 100;
    const absChange = Math.abs(change).toFixed(1);

    if (change > 0) {
      return `Your ${marker.label} has risen ${absChange}% over the last 3 reports.`;
    }

    if (change < 0) {
      return `Your ${marker.label} has dropped ${absChange}% over the last 3 reports.`;
    }

    return `Your ${marker.label} has stayed almost unchanged over the last 3 reports.`;
  }, [lastThree, marker.label]);

  const yDomain = useMemo(() => {
    const values = chartData.flatMap((item) => {
      const arr = [];
      if (typeof item.value === "number") arr.push(item.value);
      if (typeof item.projectedValue === "number") arr.push(item.projectedValue);
      return arr;
    });

    values.push(marker.referenceRange.min, marker.referenceRange.max);

    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.15 || 1;

    return [Math.max(0, min - padding), max + padding];
  }, [chartData, marker.referenceRange]);

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

        {/* Summary strip */}
        <div className="mb-6 rounded-[28px] border border-[#CDEAE2] bg-[#EAF7F4] p-4 sm:p-5">
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#8A9AB5]">
                Current marker
              </p>
              <p className="mt-2 text-lg font-semibold text-[#172033]">{marker.label}</p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#8A9AB5]">
                Latest value
              </p>
              <p className="mt-2 text-lg font-semibold text-[#167C6B]">
                {latestReport?.value} {marker.unit}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#8A9AB5]">
                Current status
              </p>
              <p className="mt-2 text-lg font-semibold text-[#172033]">{latestReport?.status}</p>
            </div>

            <div className="flex items-center xl:justify-end">
              <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${trendStyles.badge}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${trendStyles.dot}`} />
                {trendStatus}
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
                    value={selectedMarker}
                    onChange={(e) => setSelectedMarker(e.target.value)}
                    className="w-full appearance-none rounded-2xl border border-[#D7E0DE] bg-white px-4 py-3 pr-10 text-sm font-medium text-[#172033] outline-none transition focus:border-[#167C6B] focus:ring-4 focus:ring-[#16AFA2]/10"
                  >
                    {trendTrackerData.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
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
                    const isActive = selectedRange === option.key;

                    return (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => setSelectedRange(option.key)}
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
            onClick={() => setShowProjection((prev) => !prev)}
            className="flex items-center justify-between gap-3 rounded-[28px] border border-[#DCE5E3] bg-white px-5 py-4 text-left shadow-sm transition hover:border-[#A8D6CC]"
          >
            <div>
              <p className="text-sm font-semibold text-[#172033]">Projected Path</p>
              <p className="text-xs text-[#8A9AB5]">Show or hide the AI prediction line</p>
            </div>

            <div className="text-[#167C6B]">
              {showProjection ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
            </div>
          </button>
        </div>

        {/* Chart */}
        <div className="rounded-[28px] border border-[#DCE5E3] bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-semibold text-[#172033]">
                  {marker.label} trend
                </h2>

                <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${trendStyles.badge}`}>
                  <span className={`h-2.5 w-2.5 rounded-full ${trendStyles.dot}`} />
                  {trendStatus}
                </div>
              </div>

              <p className="mt-2 text-sm text-[#8A9AB5]">
                Latest reading:{" "}
                <span className="font-semibold text-[#172033]">
                  {latestReport?.value} {marker.unit}
                </span>{" "}
                • {latestReport?.status}
              </p>
            </div>

            <div className="rounded-2xl bg-[#F6F8F7] px-4 py-3 text-sm text-[#6E7F9E]">
              <span className="font-medium text-[#172033]">Normal range:</span>{" "}
              {marker.referenceRange.min} - {marker.referenceRange.max} {marker.unit}
            </div>
          </div>

          <div className="h-[340px] w-full sm:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E6ECEB" />

                <ReferenceArea
                  x1={chartData[0]?.dateLabel}
                  x2={chartData[chartData.length - 1]?.dateLabel}
                  y1={marker.referenceRange.min}
                  y2={marker.referenceRange.max}
                  fill="#EAF7F4"
                  fillOpacity={1}
                />

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
                  dot={{ r: 4, fill: "#167C6B" }}
                  activeDot={{ r: 6 }}
                />

                {showProjection && projectedPoint && (
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

          <div className="mt-4 flex flex-wrap gap-3 text-xs sm:text-sm">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#F5F7F8] px-3 py-2 text-[#5E708F]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#167C6B]" />
              Historical values
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
            text={marker.actionTip}
          />

          <InsightCard
            icon={<Brain size={20} />}
            title="Did you know?"
            text={marker.correlationTip}
          />
        </div>

        {/* Footer note */}
        <div className="mt-6 rounded-[24px] border border-[#DCE5E3] bg-white p-4 text-sm leading-6 text-[#7C8DAA] shadow-sm mb-16">
          This view helps you spot patterns across reports. Lab ranges can differ from one lab to another, so always compare with your actual report and your doctor’s advice.
        </div>
      </div>
    </div>
  );
}
