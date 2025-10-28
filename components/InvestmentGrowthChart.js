import { useEffect, useState, useRef } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Chart intervals (changed to 24hrs/5% for Daily)
const intervals = [
  { label: "Daily", hours: 24, rate: 0.05 },
  { label: "Weekly", days: 7, rate: 0.20 },
  { label: "Monthly", days: 30, rate: 0.50 }
];

const chartColors = [
  "#1bc6ff", "#ff5e57", "#28a745", "#ffc107", "#6f42c1", "#20c997"
];

function formatTime(date) {
  // Show date as well for long intervals
  return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function InvestmentGrowthChart({ investments: propInvestments }) {
  // Accept investments as prop for better flexibility
  // Fallback for legacy: try user context if not provided
  let investments = propInvestments;
  // If you want to support user context fallback, uncomment below and import useUser
  // const { user } = useUser();
  // if (!investments && user) investments = user?.investments;

  // Only show success investments for growth
  investments = investments?.filter(inv => inv.status === "success") || [];

  // Interval selection
  const [intervalIdx, setIntervalIdx] = useState(0);
  const { label, hours, days, rate } = intervals[intervalIdx];
  // Calculate ms for interval
  let INTERVAL_MS = 0;
  if (typeof hours !== "undefined") INTERVAL_MS = hours * 60 * 60 * 1000;
  else if (typeof days !== "undefined") INTERVAL_MS = days * 24 * 60 * 60 * 1000;
  else INTERVAL_MS = 24 * 60 * 60 * 1000; // fallback

  const chartRef = useRef();

  // Map investments to keys
  const invKeys = investments.map((inv, idx) => ({
    key: `inv${idx + 1}`,
    name: `Investment ${idx + 1}`,
    color: chartColors[idx % chartColors.length],
    initial: inv.amount,
  }));

  // Chart Data: [{ time, inv1: value, inv2: value, ... }]
  const [chartData, setChartData] = useState(() => {
    const now = new Date();
    const row = { time: formatTime(now) };
    invKeys.forEach(inv => {
      row[inv.key] = inv.initial;
    });
    return [row];
  });

  // Keep current values for each investment
  const [currentValues, setCurrentValues] = useState(invKeys.map(inv => inv.initial));

  useEffect(() => {
    // Reset chart when investments or interval change
    if (!investments.length) return;
    const now = new Date();
    const row = { time: formatTime(now) };
    invKeys.forEach(inv => {
      row[inv.key] = inv.initial;
    });
    setChartData([row]);
    setCurrentValues(invKeys.map(inv => inv.initial));
    // eslint-disable-next-line
  }, [intervalIdx, investments.length]);

  useEffect(() => {
    if (!investments.length) return;
    let intervalId = setInterval(() => {
      setCurrentValues(prevVals =>
        prevVals.map(val => Math.round(val * (1 + rate) * 100) / 100)
      );
      setChartData(prev => {
        const now = new Date();
        const row = { time: formatTime(now) };
        currentValues.forEach((val, idx) => {
          row[`inv${idx + 1}`] = Math.round(val * (1 + rate) * 100) / 100;
        });
        return [...prev, row];
      });
    }, INTERVAL_MS);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line
  }, [currentValues, investments.length, intervalIdx]);

  // Custom Tooltip for multi series
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <div><strong>{label}</strong></div>
          {payload.map((p, i) => (
            <div key={i}>
              <span style={{ color: p.color }}>{p.name}: </span>
              <span>${p.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Export as image
  function handleExportImage() {
    html2canvas(chartRef.current).then(canvas => {
      const link = document.createElement('a');
      link.download = 'investment-growth-chart.png';
      link.href = canvas.toDataURL();
      link.click();
    });
  }

  // Export as PDF
  function handleExportPDF() {
    html2canvas(chartRef.current).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('investment-growth-chart.pdf');
    });
  }

  if (!investments.length) return <p className="text-muted">No successful investments yet to show growth.</p>;

  // Display the interval as human readable (e.g., "every 24 hours")
  let intervalText = "";
  if (typeof hours !== "undefined") intervalText = `${hours} hour${hours > 1 ? "s" : ""}`;
  else if (typeof days !== "undefined") intervalText = `${days} day${days > 1 ? "s" : ""}`;

  return (
    <div className="chartCard my-5">
      <div className="chartTitle">Live Investment Growth Chart</div>

      <div className="d-flex flex-wrap gap-2 justify-content-center mb-3">
        {intervals.map((int, idx) => (
          <button
            key={int.label}
            className={`btn btn-sm ${idx === intervalIdx ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setIntervalIdx(idx)}
          >
            {int.label}
          </button>
        ))}
       {/* <button className="btn btn-sm btn-success" onClick={handleExportImage}>Export Image</button>
        <button className="btn btn-sm btn-warning" onClick={handleExportPDF}>Export PDF</button> */}
      </div>

      <div ref={chartRef}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {invKeys.map((inv, idx) => (
              <Line
                key={inv.key}
                dataKey={inv.key}
                name={inv.name}
                stroke={inv.color}
                strokeWidth={3}
                dot={{ r: 4 }}
                isAnimationActive={true}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chartCurrentValue">
        {invKeys.map((inv, idx) => (
          <div key={inv.key}>
            {inv.name} Value: <span style={{ color: inv.color }}>${currentValues[idx]}</span>
          </div>
        ))}
      </div>
      <span className="chartSubtitle">
        Interest: <span style={{ color: "#28a745" }}>+{intervals[intervalIdx].rate * 100}%</span> every {intervalText}
      </span>
    </div>
  );
}