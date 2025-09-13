// src/App.tsx
import React, { useEffect, useState } from "react";
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

export default function App(): JSX.Element {
  // app state
  const [leafFile, setLeafFile] = useState<File | null>(null);
  const [soilFile, setSoilFile] = useState<File | null>(null);

  const [leafResult, setLeafResult] = useState<LeafResult | null>(null);
  const [soilResult, setSoilResult] = useState<SoilResult | null>(null);

  const [loadingLeaf, setLoadingLeaf] = useState(false);
  const [loadingSoil, setLoadingSoil] = useState(false);

  // small synthetic history for charts (keeps demo lively)
  const [healthHistory, setHealthHistory] = useState<number[]>([]);
  const [carbonHistory, setCarbonHistory] = useState<number[]>([]);

  // load from localStorage on start
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

  // save to localStorage on result change
  useEffect(() => {
    const payload = {
      leafResult,
      soilResult,
      healthHistory,
      carbonHistory,
    };
    localStorage.setItem(LOCAL_KEY, JSON.stringify(payload));
  }, [leafResult, soilResult, healthHistory, carbonHistory]);

  // utils
  const nowISO = () => new Date().toISOString();

  const pushHistory = (arr: number[], val: number, maxLen = 12) => {
    const copy = [...arr, Math.round(val)];
    if (copy.length > maxLen) copy.shift();
    return copy;
  };

  // Fake AI handlers (simulate delay + analysis)
  const handleLeafUpload = async (file?: File) => {
    if (!file) return;
    setLeafFile(file);
    setLoadingLeaf(true);

    // simulate server processing
    setTimeout(() => {
      // produce a plausible result based on a pseudo-random seed using file size
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
      setHealthHistory((h) => pushHistory(h, 100 - confidence)); // lower health -> higher value
      setLoadingLeaf(false);
    }, 1400);
  };

  const handleSoilUpload = async (file?: File) => {
    if (!file) return;
    setSoilFile(file);
    setLoadingSoil(true);

    setTimeout(() => {
      const seed = (file.size % 100) + 30;
      const confidence = Math.min(99, Math.max(65, Math.round(seed)));
      const levels = ["Low", "Medium", "High"];
      const level = levels[Math.floor((confidence - 65) / 12)] || "Medium";
      const creditsUSD = Math.round((confidence / 100) * 40 * 100) / 100; // fake dollars

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

  // Download printable report (uses a print-friendly div)
  const handleDownloadReport = () => {
    // open print dialog for printable area
    const printable = document.getElementById("agriguard-report");
    if (!printable) {
      window.print();
      return;
    }

    // open new window and print content (keeps styling simple)
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
    if (!leafResult && !soilResult) lines.push("No analyses yet — upload leaf or soil samples to get started.");
    const text = encodeURIComponent(lines.join("\n"));
    const url = `https://wa.me/?text=${text}`;
    window.open(url, "_blank");
  };

  // small visual components
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

  const Sparkline: React.FC<{ data: number[] }> = ({ data }) => {
    if (!data || data.length === 0) {
      return <div className="text-xs text-gray-400">no history</div>;
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-sky-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* CARD: HERO */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-5 mb-5 border border-emerald-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-emerald-800">AgriGuard AI 🌱</h1>
              <p className="text-sm text-gray-600 mt-1">Mobile-first demo • Offline-friendly • Pitch-ready</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400">Demo</div>
              <div className="text-sm text-gray-600 mt-2">v1</div>
            </div>
          </div>
        </div>

        {/* CARD: SCAN LEAF */}
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-5 border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Leaf className="w-6 h-6 text-emerald-600" />
              <h2 className="text-lg font-semibold text-emerald-800">Scan Leaf</h2>
            </div>
            <div className="text-sm text-gray-500">Crop health</div>
          </div>

          <p className="text-sm text-gray-600 mb-3">Upload a leaf image for instant AI diagnosis.</p>

          <label className="inline-flex items-center gap-2 cursor-pointer">
            <div className="inline-flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-lg shadow hover:bg-emerald-700 transition">
              <UploadCloud className="w-4 h-4" /> Upload Leaf
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files && handleLeafUpload(e.target.files[0])}
            />
          </label>

          {/* preview and result */}
          <div className="mt-4 grid grid-cols-3 gap-3 items-center">
            <div className="col-span-1">
              {leafFile ? (
                <img src={URL.createObjectURL(leafFile)} className="w-20 h-20 rounded-lg object-cover shadow-sm" alt="leaf preview" />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-emerald-50 flex items-center justify-center text-xs text-gray-400">No file</div>
              )}
            </div>

            <div className="col-span-2">
              {loadingLeaf ? (
                <div className="flex items-center gap-2 text-emerald-600">
                  <Loader2 className="animate-spin w-5 h-5" /> <span>Analyzing leaf…</span>
                </div>
              ) : leafResult ? (
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-emerald-700 font-semibold">{leafResult.diagnosis}</div>
                      <div className="text-xs text-gray-600">{leafResult.recommendation}</div>
                    </div>
                    <div className="w-20">
                      <ProgressRing value={leafResult.confidence} />
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">Analyzed: {new Date(leafResult.date).toLocaleString()}</div>
                </div>
              ) : (
                <div className="text-xs text-gray-400">No analysis yet</div>
              )}
            </div>
          </div>
        </div>

        {/* CARD: SOIL CARBON */}
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-5 border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-emerald-600" />
              <h2 className="text-lg font-semibold text-emerald-800">Soil Carbon</h2>
            </div>
            <div className="text-sm text-gray-500">Carbon & credits</div>
          </div>

          <p className="text-sm text-gray-600 mb-3">Upload a soil photo or short video for carbon estimate.</p>

          <label className="inline-flex items-center gap-2 cursor-pointer">
            <div className="inline-flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-lg shadow hover:bg-emerald-700 transition">
              <UploadCloud className="w-4 h-4" /> Upload Soil
            </div>
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => e.target.files && handleSoilUpload(e.target.files[0])}
            />
          </label>

          <div className="mt-4">
            {loadingSoil ? (
              <div className="flex items-center gap-2 text-emerald-600">
                <Loader2 className="animate-spin w-5 h-5" /> <span>Estimating carbon…</span>
              </div>
            ) : soilResult ? (
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-emerald-700">{soilResult.carbonLevel} carbon</div>
                    <div className="text-xs text-gray-600">Estimated credits: ${soilResult.creditsUSD.toFixed(2)}</div>
                  </div>
                  <div className="w-20">
                    <ProgressRing value={soilResult.confidence} />
                  </div>
                </div>
                <div className="mt-1 text-xs text-gray-500">Analyzed: {new Date(soilResult.date).toLocaleString()}</div>
              </div>
            ) : (
              <div className="text-xs text-gray-400">No analysis yet</div>
            )}
          </div>
        </div>

        {/* CARD: DASHBOARD + ACTIONS */}
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-5 border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Leaf className="w-5 h-5 text-emerald-600" />
              <h3 className="text-md font-semibold text-emerald-800">Dashboard</h3>
            </div>
            <div className="text-xs text-gray-500">Summary</div>
          </div>

          <div className="mb-3">
            <div className="text-sm text-gray-600 mb-2">Farm snapshot</div>
            <div className="bg-gray-50 rounded-lg p-3">
              {leafResult ? (
                <div className="text-sm mb-1">🌱 {leafResult.diagnosis} ({leafResult.confidence}%)</div>
              ) : (
                <div className="text-sm text-gray-400 mb-1">No leaf data</div>
              )}
              {soilResult ? (
                <div className="text-sm">🌍 {soilResult.carbonLevel} — ${soilResult.creditsUSD.toFixed(2)} ({soilResult.confidence}%)</div>
              ) : (
                <div className="text-sm text-gray-400">No soil data</div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleDownloadReport} className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 transition">
              <Download className="w-4 h-4" /> Download Report
            </button>
            <button onClick={handleShareWhatsApp} className="flex-1 inline-flex items-center justify-center gap-2 bg-yellow-400 text-emerald-900 px-3 py-2 rounded-lg hover:bg-yellow-300 transition">
              <Share2 className="w-4 h-4" /> Share (WhatsApp)
            </button>
          </div>

          <div id="agriguard-report" className="sr-only" aria-hidden>
            {/* printable report content */}
            <h1>AgriGuard AI — Quick Report</h1>
            <p>Generated: {new Date().toLocaleString()}</p>
            {leafResult && (
              <div>
                <h2>Leaf Analysis</h2>
                <p>{leafResult.diagnosis} — {leafResult.confidence}%</p>
                <p>{leafResult.recommendation}</p>
              </div>
            )}
            {soilResult && (
              <div>
                <h2>Soil Analysis</h2>
                <p>{soilResult.carbonLevel} — ${soilResult.creditsUSD.toFixed(2)}</p>
              </div>
            )}
          </div>

          <div className="mt-4 text-xs text-gray-400">
            <div className="mb-2">Recent health trend</div>
            <div className="flex items-center gap-2">
              <div className="w-28">
                <SparklineWrapper data={healthHistory} />
              </div>
              <div className="text-xs text-gray-500">Carbon credit trend</div>
              <div className="w-28 ml-auto">
                <SparklineWrapper data={carbonHistory} />
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500 mt-3">
          🌍 Built with Vite · React · Tailwind
        </div>
      </div>
    </div>
  );
}

/** tiny wrapper to show sparkline with fallback */
const SparklineWrapper: React.FC<{ data: number[] }> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-xs text-gray-300">—</div>;
  }
  return <div className="inline-block"><Sparkline data={data} /></div>;
};

function Sparkline({ data }: { data: number[] }) {
  // Render a tiny sparkline - reusing algorithm from main component
  const w = 96;
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
    <svg width={w} height={h}>
      <path d={path} stroke="#059669" strokeWidth={2} fill="none" strokeLinecap="round" />
    </svg>
  );
}
