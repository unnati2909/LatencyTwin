import { useNavigate,useLocation } from "react-router-dom";
// import { useEffect } from "react";
import { Zap, Wifi, Signal, Radio, Image, Code, Server, ArrowLeft } from "lucide-react";

function ResultsPage() {
  
  const navigate = useNavigate();
  const location = useLocation();
  console.log("ResultsPage mounted", location.state);
  const data =
  location.state ||
  JSON.parse(localStorage.getItem("latencyResult"));

  
  if (!data) {
  return (
    <div className="text-center text-muted-foreground mt-20">
      No analysis data found. Please analyze a website first.
    </div>
  );
}

  const reasons = Array.isArray(data.reasons) ? data.reasons : [];
  const predictionReasons = Array.isArray(data.predictionReasons)
    ? data.predictionReasons
    : [];
  const slowParts = Array.isArray(data.slowParts) ? data.slowParts : [];
  const suggestions = Array.isArray(data.suggestions) ? data.suggestions : [];

  
  // const detectedNetwork = data.detectedNetwork;

 const verdict = {
  status: data.verdict,
  description: data.description,
};

const networkConditions = [
  {
    type: "Wi-Fi",
    icon: Wifi,
    status: data.networks.wifi,
    statusColor: "text-emerald-600",
    description: "Fast, responsive experience",
  },
  {
    type: "4G",
    icon: Signal,
    status: data.networks["4g"],
    statusColor: "text-amber-600",
    description: "Moderate load times",
  },
  {
    type: "3G",
    icon: Radio,
    status: data.networks["3g"],
    statusColor: "text-red-500",
    description: "Slow experience on mobile data",
  },
];

const slowItems = slowParts.map((item) => {
  if (item === "Images") {
    return {
      icon: Image,
      title: "Images",
      description: "Large images increase load time on slow networks",
    };
  }

  if (item === "API Calls") {
    return {
      icon: Server,
      title: "API Calls",
      description: "Multiple requests delay content visibility",
    };
  }

  return {
    icon: Code,
    title: "JavaScript Execution",
    description: "Heavy scripts slow interactivity",
  };
});



  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12">
      <div className="relative z-10 w-full max-w-2xl">

        {/* Brand */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Zap className="w-5 h-5 text-primary" />
          <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
            LatencyTwin
          </span>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">
            Latency Prediction Results
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Simulated prediction — not a live speed test
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Detected Network:<span className="font-medium ml-1">{data.detectedNetwork.label} — {data.detectedNetwork.quality}</span>
          </p>
          <p className="text-xs text-muted-foreground">{data.detectedNetwork.description}</p>

        {data.cdn ? (
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-medium">
            🚀 CDN detected: {data.cdn}
          </div>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">
            CDN headers not exposed — performance may still benefit from edge delivery
          </p>
        )}

        </div>




        {/* Verdict */}
        <div className="card-elevated text-center px-6 py-6 mb-6">
          <span className="text-xs uppercase text-muted-foreground">
            Overall Experience
          </span>
          <div className="mt-2 text-3xl font-bold text-amber-600">
            {verdict.status}
            <span className="text-base font-medium text-muted-foreground ml-2">
            ({data.confidence}% confidence)
            </span>
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            {verdict.description}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
             Confidence is based on page structure, script load, and resource size
          </p>

        </div>


        {reasons.length > 0 && (
         <div className="card-elevated px-5 py-4 mb-6">
          <h3 className="text-sm font-semibold mb-2">
             Why this verdict?
         </h3>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
           {data.reasons.map((reason, idx) => (
           <li key={idx}>{reason}</li>
             ))}
          </ul>
         </div>
        )}
        
        {/* Why this prediction */}
        {predictionReasons.length > 0 ? (
  <div className="mb-8">
    <h2 className="text-sm uppercase text-muted-foreground mb-3">
      Why this prediction?
    </h2>

    <div className="card-elevated px-5 py-4 space-y-2">
      {data.predictionReasons.map((reason, index) => (
        <div key={index} className="flex items-start gap-2 text-sm">
          <span className="mt-1 text-primary">•</span>
          <span className="text-muted-foreground">{reason}</span>
        </div>
      ))}
  </div>
  </div>
) : null}


        {/* What will feel slow */}
        {slowItems.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm uppercase text-muted-foreground mb-4">
              What will feel slow?
            </h2>
        
            <div className="card-elevated divide-y divide-border/50">
              {slowItems.map((item) => (
                <div key={item.title} className="flex gap-4 px-5 py-4">
                  <item.icon className="w-4 h-4 text-muted-foreground mt-1" />
                  <div>
                    <div className="text-sm font-medium">{item.title}</div>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ✅ Fallback when nothing is wrong */}
        {reasons.length === 0 &&
          predictionReasons.length === 0 &&
          slowItems.length === 0 && (
           <div className="card-elevated px-5 py-4 text-sm text-muted-foreground text-center mb-8">
             <div className="font-medium mb-1">No Performance Bottlenecks Detected</div>
             <p>
               This website is structurally optimized. Performance variations are primarily
               influenced by network conditions.
             </p>
           </div>
          )}

        
        {/* Network cards */}
        <div className="mb-6">
          <h2 className="text-sm uppercase text-muted-foreground mb-4">
            Experience by Network
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {networkConditions.map((net) => (
              <div key={net.type} className="card-elevated px-5 py-5">
                <div className="flex items-center gap-2 mb-2">
                  <net.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{net.type}</span>
                </div>
                <div className={`text-lg font-semibold ${net.statusColor}`}>
                  {net.status}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {net.description}
                </p>
              </div>
            ))}
          </div>
        </div>

       {/* actual vs predicted */}
    <div className="card-elevated px-6 py-5 mb-6">
  <h3 className="text-sm uppercase text-muted-foreground mb-3">
    Prediction vs Actual
  </h3>

  <div className="grid grid-cols-3 gap-4 text-center">
    <div>
      <div className="text-lg font-semibold">
        {data.predictedLoadTime} ms
      </div>
      <p className="text-xs text-muted-foreground">Predicted</p>
    </div>

    <div>
      <div className="text-lg font-semibold">
        {data.actualMetrics?.loadTime
          ? `${data.actualMetrics.loadTime} ms`
          : "N/A"}
      </div>
      <p className="text-xs text-muted-foreground">Actual</p>
    </div>

    <div>
      <div className="text-lg font-semibold text-emerald-600">
        {typeof data.accuracy === "number" && data.accuracy != 0
          ? `${data.accuracy}%`
          : "N/A"}
      </div>
      <p className="text-xs text-muted-foreground">
        Prediction Reliability
      </p>
    </div>
  </div>

  {!data.actualMetrics?.loadTime && (
    <p className="mt-3 text-xs text-muted-foreground text-center">
      Actual load timing could not be measured reliably for this site.
    </p>
  )}
</div>



        
        {/* Optimization Suggestions */}
        {suggestions.length > 0 && (
          <div className="mb-8">
           <h2 className="text-sm uppercase text-muted-foreground mb-3">
           Optimization Suggestions
           </h2>

          <div className="card-elevated px-5 py-4 space-y-3">
            {data.suggestions.map((suggestion, index) => (
          <div key={index} className="flex gap-3 text-sm">
                <span className="text-emerald-500">✔</span>
                <span className="text-muted-foreground">{suggestion}</span>
           </div>
            ))}
          </div>
        </div>
      )}

        {/* CTA */}
        <button
          onClick={() => navigate("/")}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Analyze another website
        </button>

        <p className="mt-6 text-xs text-muted-foreground/60 text-center">
          Predictions are estimates based on static analysis
        </p>
      </div>
    </div>
  );
}

export default ResultsPage;
