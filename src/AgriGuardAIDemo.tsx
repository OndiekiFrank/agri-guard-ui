import React, { useState, useEffect } from "react";

type ScanResult = {
  diagnosis: string;
  recommendation: string;
  confidence: string;
} | null;

// AgriGuard AI — Enhanced demo UI
export default function AgriGuardAIDemo() {
  const [screen, setScreen] = useState<"home" | "scan" | "carbon">("home");
  const [location] = useState("Kisii, Kenya");
  const [weather] = useState({ temp: 22, condition: "Partly Cloudy", rainProb: 15 });
  const [pestRisk] = useState({ crop: "Maize", level: "High", risk: "maize rust", hours: 48 });
  const [scanResult, setScanResult] = useState<ScanResult>(null);
  const [scanning, setScanning] = useState(false);
  const [carbon] = useState({
    sequesteredTons: 1.2,
    creditsUSD: 20.0,
    practices: ["Cover Crops", "No-burn"],
  });
  const [aiTip, setAiTip] = useState("");

  // Generate smart AI tip
  useEffect(() => {
    if (screen === "home") {
      let tip = "";
      if (pestRisk.level === "High") {
        tip = `⚠️ Alert: ${pestRisk.level} risk of ${pestRisk.risk} detected in ${location}. Treat within ${pestRisk.hours} hours.`;
      } else if (weather.rainProb > 50) {
        tip = `🌧️ Expect rain soon in ${location}. Plan fertilizer application accordingly.`;
      } else {
        tip = `✅ Conditions stable today in ${location}. Good time to plant ${pestRisk.crop}.`;
      }
      setAiTip(tip);
    }
  }, [screen]);

  function fakeScan(file?: File) {
    if (!file) return;
    setScanning(true);
    setScanResult(null);
    setTimeout(() => {
      setScanning(false);
      setScanResult({
        diagnosis: "Nitrogen deficiency",
        recommendation: "Apply 5 kg Urea per acre now; follow up in 14 days",
        confidence: "87%",
      });
    }, 1500);
  }

  const buttonBase =
    "px-3 py-2 rounded-xl text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-1";

  return (
    <div className="max-w-sm mx-auto bg-white shadow-lg rounded-2xl p-4 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-sky-600 bg-clip-text text-transparent">
          AgriGuard AI
        </h1>
        <div className="text-xs text-gray-500">Demo</div>
      </header>

      {/* HOME */}
      {screen === "home" && (
        <main>
          <section className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Location</div>
              <div className="font-semibold">{location}</div>
            </div>
            <button
              onClick={() => setScreen("carbon")}
              className={`${buttonBase} bg-green-100 hover:bg-green-200`}
            >
              Carbon
            </button>
          </section>

          <section className="mb-4 p-3 rounded-xl bg-gradient-to-r from-sky-50 to-white border border-sky-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Weather</div>
                <div className="text-lg font-semibold">
                  {weather.temp}°C · {weather.condition}
                </div>
                <div className="text-xs text-gray-500">
                  Rain chance: {weather.rainProb}%
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Pest Risk</div>
                <div
                  className={`font-bold ${
                    pestRisk.level === "High" ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {pestRisk.level}
                </div>
                <div className="text-xs text-gray-500">{pestRisk.crop}</div>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-700">{aiTip}</div>
          </section>

          <button
            onClick={() => setScreen("scan")}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Scan a leaf / soil
          </button>

          <section className="mt-4 text-sm text-gray-500">
            <div className="mb-2">Quick actions</div>
            <div className="flex gap-2">
              <button className={`${buttonBase} flex-1 bg-gray-100 hover:bg-gray-200`}>
                Advice
              </button>
              <button className={`${buttonBase} flex-1 bg-gray-100 hover:bg-gray-200`}>
                Market Price
              </button>
            </div>
          </section>

          <nav className="mt-4 text-center text-xs text-gray-400">
            AgriGuard AI — Hyperlocal farming advice demo
          </nav>
        </main>
      )}

      {/* SCAN */}
      {screen === "scan" && (
        <main>
          <section className="mb-4 flex items-center justify-between">
            <button
              onClick={() => {
                setScreen("home");
                setScanResult(null);
              }}
              className="text-sm text-gray-600"
            >
              ← Back
            </button>
            <div className="text-sm text-gray-500">Scan</div>
            <div className="text-sm text-gray-500">Demo</div>
          </section>

          <section className="p-3 mb-4 bg-gray-50 rounded-xl text-center">
            <div className="mb-2 text-sm text-gray-600">
              Upload photo of leaf or soil
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => fakeScan(e.target.files?.[0])}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 
              file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </section>

          <section className="mb-4">
            {scanning && (
              <div className="text-center text-blue-600 animate-pulse">
                🔎 AI analyzing your sample...
              </div>
            )}
            {!scanning && !scanResult && (
              <div className="text-center text-gray-400">
                No scan yet — upload a photo to simulate AI diagnosis.
              </div>
            )}
            {scanResult && (
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <div className="text-sm text-gray-500">Diagnosis</div>
                <div className="font-semibold text-lg">
                  {scanResult.diagnosis}
                </div>
                <div className="mt-2 text-sm text-gray-700">
                  {scanResult.recommendation}
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  Confidence: {scanResult.confidence}
                </div>
                <div className="mt-3 flex gap-2">
                  <button className={`${buttonBase} flex-1 bg-green-600 text-white hover:bg-green-700`}>
                    Save to log
                  </button>
                  <button
                    onClick={() => setScanResult(null)}
                    className={`${buttonBase} flex-1 bg-gray-100 hover:bg-gray-200`}
                  >
                    Scan again
                  </button>
                </div>
              </div>
            )}
          </section>

          <nav className="text-center text-xs text-gray-400">
            Model: CNN image classifier (simulated)
          </nav>
        </main>
      )}

      {/* CARBON */}
      {screen === "carbon" && (
        <main>
          <section className="mb-4 flex items-center justify-between">
            <button
              onClick={() => setScreen("home")}
              className="text-sm text-gray-600"
            >
              ← Back
            </button>
            <div className="text-sm text-gray-500">Carbon Dashboard</div>
            <div className="text-sm text-gray-500">Account</div>
          </section>

          <section className="p-3 bg-white rounded-xl shadow-sm mb-4">
            <div className="text-sm text-gray-500">This season</div>
            <div className="font-semibold text-xl">{carbon.sequesteredTons} t CO₂</div>
            <div className="text-sm text-gray-700 mt-2">
              Estimated credits: ${carbon.creditsUSD.toFixed(2)}
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Practices tracked: {carbon.practices.join(", ")}
            </div>
          </section>

          <section className="p-3 bg-green-50 rounded-xl">
            <div className="text-sm text-gray-700">AI Recommendation</div>
            <div className="mt-2 text-sm text-gray-600">
              To increase credits, expand cover crops to 2 acres. Verified credits
              could add <span className="font-semibold">$12</span> next season.
            </div>
            <div className="mt-3">
              <button className="w-full py-2 bg-green-600 text-white rounded-xl hover:bg-green-700">
                Request verification
              </button>
            </div>
          </section>

          <nav className="mt-4 text-center text-xs text-gray-400">
            Credits verified by AI & marketplaces (demo)
          </nav>
        </main>
      )}
    </div>
  );
}
