// src/App.tsx
import { useEffect, useState } from "react";
import {
  Leaf,
  UploadCloud,
  BarChart3,
  Share2,
  Download,
  Loader2,
} from "lucide-react";

/**
 * AgriGuard AI — Premium demo UI
 * Single-file React + TypeScript component.
 *
 * Requirements: lucide-react, TailwindCSS.
 */

type LeafResult = {
  diagnosis: string;
  recommendation: string;
  confidence: number; // 0-100
  date: string;
};

type SoilResult = {
  carbonLevel: string;
  creditsUSD: number;
  confidence: number;
  date: string;
};

const LOCAL_KEY = "agri_guard_demo_v1";

export default function App(): React.ReactElement {
  // app state
  const [leafFile, setLeafFile] = useState<File | null>(null);

  const [leafResult, setLeafResult] = useState<LeafResult | null>(null);
  const [soilResult, setSoilResult] = useState<SoilResult | null>(null);

  const [loadingLeaf, setLoadingLeaf] = useState(false);
  const [loadingSoil, setLoadingSoil] = useState(false);

  // synthetic history for charts
  const [healthHistory, setHealthHistory] = useState<number[]>([]);
  const [carbonHistory, setCarbonHistory] = useState<number[]>([]);

  // load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setLeafResult(parsed.leafResult || null);
        setSoilResult(parsed.soilResult || null);
        setHealthHistory(parsed.healthHistory || []);
        setCarbonHistory(parsed.carbonHistory || []);
      }
    } catch (e) {
      console.warn("Could not parse local storage", e);
    }
  }, []);

  // save to localStorage
  useEffect(() => {
    const payload = {
      leafResult,
      soilResult,
      healthHistory,
      carbonHistory,
    };
    localStorage.setItem(LOCAL_KEY, JSON.stringify(payload));
  }, [leafResult, soilResult, healthHistory, carbonHistory]);

  const nowISO = () => new Date().toISOString();

  const pushHistory = (arr: number[], val: number, maxLen = 12) => {
    const copy = [...arr, Math.round(val)];
    if (copy.length > maxLen) copy.shift();
    return copy;
  };

  // Fake AI handlers
  const handleLeafUpload = async (file?: File) => {
    if (!file) return;
    setLeafFile(file);
    setLoadingLeaf(true);

    setTimeout(() => {
      const seed = (file.size % 100) + 20;
      const confidence = Math.min(98, Math.max(60, Math.round(seed)));
      const diag =
        confidence > 80 ? "Nitrogen deficiency" : "Early-stage leaf chlorosis";
      const rec =
        confidence > 80
          ? "Apply 5 kg Urea/acre; monitor water and follow up in 10–14 days."
          : "Top-dress with compost tea; retest in 2 weeks.";

      const result: LeafResult = {
        diagnosis: diag,
        recommendation: rec,
        confidence,
        date: nowISO(),
      };

      setLeafResult(result);
      setHealthHistory((h) => pushHistory(h, 100 - confidence));
      setLoadingLeaf(false);
    }, 1400);
  };

  const handleSoilUpload = async (file?: File) => {
    if (!file) return;
    setLoadingSoil(true);

    setTimeout(() => {
      const seed = (file.size % 100) + 30;
      const confidence = Math.min(99, Math.max(65, Math.round(seed)));
      const levels = ["Low", "Medium", "High"];
      const level = levels[Math.floor((confidence - 65) / 12)] || "Medium";
      const creditsUSD = Math.round((confidence / 100) * 40 * 100) / 100;

      const result: SoilResult = {
        carbonLevel: level,
        creditsUSD,
        confidence,
        date: nowISO(),
      };

      setSoilResult(result);
      setCarbonHistory((c) => pushHistory(c, creditsUSD));
      setLoadingSoil(false);
    }, 1500);
  };

  const handleDownloadReport = () => {
    const printable = document.getElementById("agriguard-report");
    if (!printable) {
      window.print();
      return;
    }
    const w = window.open("", "_blank");
    if (!w) return;
    const html = `
      <html>
        <head>
          <title>AgriGuard AI - Report</title>
          <style>
            body { font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; padding: 20px; color: #073045 }
            h1 { color: #1f7a3a; }
            .card { border-radius: 8px; padding: 12px; border: 1px solid #e6f0ea; margin-bottom: 12px; }
            .small { color: #555; font-size: 0.95rem }
          </style>
        </head>
        <body>
          ${printable.innerHTML}
        </body>
      </html>`;
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  };

  const handleShareWhatsApp = () => {
    const lines: string[] = [];
    lines.push("AgriGuard AI — Quick farm report");
    if (leafResult) {
      lines.push(
        `Leaf: ${leafResult.diagnosis} — ${leafResult.confidence}% confidence. Recommendation: ${leafResult.recommendation}`
      );
    }
    if (soilResult) {
      lines.push(
        `Soil: ${soilResult.carbonLevel} carbon — ${soilResult.creditsUSD}$ credits (est), ${soilResult.confidence}% confidence.`
      );
    }
    if (!leafResult && !soilResult)
      lines.push("No analyses yet — upload leaf or soil samples to get started.");
    const text = encodeURIComponent(lines.join("\n"));
    const url = `https://wa.me/?text=${text}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-sky-50 flex items-center justify-center p-6">
      {/* ... your JSX stays unchanged */}
    </div>
  );
}

/** Progress Ring */
const ProgressRing: React.FC<{ value: number; size?: number }> = ({ value, size = 64 }) => {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg width={size} height={size} className="mx-auto">
      <defs>
        <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <g transform={`translate(${size / 2}, ${size / 2})`}>
        <circle r={radius} fill="none" stroke="#e6f6f0" strokeWidth="8" />
        <circle
          r={radius}
          fill="none"
          stroke="url(#g1)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 600ms ease" }}
          transform={`rotate(-90)`}
        />
        <text y="6" textAnchor="middle" fontSize={14} fill="#044e3c" fontWeight={700}>
          {Math.round(value)}%
        </text>
      </g>
    </svg>
  );
};

/** Sparkline */
const Sparkline: React.FC<{ data: number[] }> = ({ data }) => {
  if (!data || data.length === 0) return <div className="text-xs text-gray-400">no history</div>;
  const w = 120;
  const h = 28;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((d - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  });
  const path = `M${pts.join(" L ")}`;
  return (
    <svg width={w} height={h} className="mx-auto">
      <path d={path} fill="none" stroke="#059669" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/** Wrapper */
const SparklineWrapper: React.FC<{ data: number[] }> = ({ data }) => {
  if (!data || data.length === 0) return <div className="text-xs text-gray-300">—</div>;
  return <div className="inline-block"><Sparkline data={data} /></div>;
};
