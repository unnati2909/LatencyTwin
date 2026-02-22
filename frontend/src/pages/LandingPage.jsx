import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Globe, Zap } from "lucide-react";
import { useNetworkProfile } from "../hooks/useNetworkProfile";
function LandingPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { profile, loading: networkLoading } = useNetworkProfile();
  const navigate = useNavigate();

  const handleAnalyze = async () => {
  if (!url.trim()) {
  setError("Please enter a website URL");
  return;
}

try {
  new URL(url.startsWith("http") ? url : `https://${url}`);
} catch {
  setError("Please enter a valid URL (e.g. https://example.com)");
  return;
}


  const networkToSend = profile || {
  effectiveType: "4g",
  rtt: 200,
  downlink: 3,
  };


  try {
  setLoading(true);

  const response = await fetch("http://localhost:8000/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, networkProfile: networkToSend,}),
  });

  const data = await response.json();

   if (!response.ok) {
     console.error("API error:", data);
     setError(data.details || "Analysis failed");
     return; // ⛔ STOP
   }
   
   localStorage.setItem("latencyResult", JSON.stringify(data));
   navigate("/results", { state: data });

} catch(error) {
  console.error(error)
  setError("Analysis failed. Try again.");
} finally {
  setLoading(false);
}


};


  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAnalyze();
    }
  };
  

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="relative z-10 w-full max-w-md">

        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="p-2 rounded-lg bg-primary/10">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xs font-medium text-muted-foreground tracking-widest uppercase">
            Developer Tool
          </span>
        </div>

        {/* Card */}
        <div className="card-elevated px-8 py-10 md:px-10 md:py-12">

          <h1 className="text-3xl md:text-4xl font-bold text-center">
            LatencyTwin
          </h1>

          <p className="text-xs text-muted-foreground text-center mt-2">
            {networkLoading
              ? "Detecting network conditions…"
               : "Network detected automatically"}
          </p>


          <div className="mt-10 space-y-3">
            <div className="relative">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground/60" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter a URL (e.g., example.com)"
                className="input-styled pl-11"
                disabled={loading}
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "Analyzing…" : "Analyze Website"}
            </button>

            {error && (
              <p className="text-sm text-red-500 text-center mt-2">
                {error}
              </p>
            )}
          </div>

          <p className="mt-5 text-[13px] text-muted-foreground/70 text-center">
            Free • No signup • Results in seconds
          </p>
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-[13px] text-muted-foreground/60">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
          <span>Trusted by developers worldwide</span>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
