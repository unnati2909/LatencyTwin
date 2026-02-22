const { classifyNetwork } = require("./networkProfiler");
const { measureActualPerformance } = require("./actualPerformance");

function withTimeout(promise, ms = 10000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), ms)
    ),
  ]);
}

function normalizeUrl(url) {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return "https://" + url;
  }
  return url;
}


/**
 * Fetch HTML of the website
 */
async function fetchHTML(url) {
  const response = await fetch(url, {
    method: "GET",
    redirect: "follow",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      "Accept": "text/html",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch website: ${response.status}`);
  }

  const html = await response.text();

  if (typeof html !== "string") {
    throw new Error("Invalid HTML response");
  }

  return {
    html,
    headers: response.headers, // ✅ IMPORTANT
  };
}



/**
 * Analyze HTML structure
 */
function analyzeStructure(html) {
  const imgCount = (html.match(/<img /gi) || []).length;
  const scriptCount = (html.match(/<script /gi) || []).length;
  const linkCount = (html.match(/<link /gi) || []).length;

  // Rough size estimate (KB)
  const pageSizeKB = Math.round(html.length / 1024);

  return {
    imgCount,
    scriptCount,
    linkCount,
    pageSizeKB,
  };
}

/**
 * Determine site weight using heuristic scoring
 */
function determineSiteWeight(metrics) {
  let score = 0;

  // Images (bandwidth impact)
  if (metrics.imgCount > 15) score += 1;
  if (metrics.imgCount > 40) score += 2;

  // Scripts (JS-heavy apps)
  if (metrics.scriptCount > 8) score += 2;
  if (metrics.scriptCount > 25) score += 3;
  if (metrics.scriptCount > 45) score += 4;

  // HTML size (shell cost, not content)
  if (metrics.pageSizeKB > 300) score += 1;
  if (metrics.pageSizeKB > 800) score += 2;

  // Final classification
  if (score <= 3) return "Light";
  if (score <= 7) return "Medium";
  return "Heavy";
}

function calculateOptimizationScore(metrics) {
  let score = 100;

  // Too many scripts relative to size
  if (
  metrics.pageSizeKB > 0 &&
  metrics.scriptCount / metrics.pageSizeKB > 0.08
) {
  score -= 20;
}

  if (metrics.scriptCount > 40) score -= 20;

  // Too many images
  if (metrics.imgCount > 40) score -= 15;

  // Very large HTML payload
  if (metrics.pageSizeKB > 1500) score -= 20;

  // Penalize extremely bloated pages
  if (metrics.pageSizeKB > 2500) score -= 25;

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  let level = "High";
  if (score < 70) level = "Medium";
  if (score < 40) level = "Low";

  return { score, level };
}


function calculateConfidence(metrics, weight) {
  let confidence = 55;

  // Stronger signals increase confidence
  confidence += Math.min(metrics.scriptCount * 0.8, 25);
  confidence += Math.min(metrics.imgCount * 0.5, 15);

  if (weight === "Heavy") confidence += 15;
  if (weight === "Light") confidence += 10;

  return Math.min(Math.round(confidence), 95);
}



/**
 * Simulate network experience
 */
function simulateNetworks(weight, optimizationLevel) {
  const baseMatrix = {
    Light: { wifi: "Good", "4g": "Good", "3g": "Average" },
    Medium: { wifi: "Good", "4g": "Average", "3g": "Slow" },
    Heavy: { wifi: "Average", "4g": "Slow", "3g": "Very Slow" },
  };

  const networks = { ...baseMatrix[weight] };

  // 🔼 Wi-Fi should feel good for most optimized sites
  if (optimizationLevel === "High" || optimizationLevel === "Medium") {
    if (networks.wifi === "Average") {
      networks.wifi = "Good";
    }
  }

  // 🔼 4G improves only for highly optimized sites
  if (optimizationLevel === "High") {
    if (networks["4g"] === "Slow") {
      networks["4g"] = "Average";
    }
  }

  // 🔽 Poor optimization should still hurt
  if (optimizationLevel === "Low") {
    if (networks.wifi === "Good") {
      networks.wifi = "Average";
    }
    if (networks["4g"] === "Average") {
      networks["4g"] = "Slow";
    }
  }

  return networks;
}

function buildReasoning({ siteWeight, optimization, networkClass, metrics,cdn }) {
  const reasons = [];

  if (siteWeight === "Heavy") {
    reasons.push("Page has high structural complexity");
  }

  if (optimization.level !== "High") {
    reasons.push("Site is not fully optimized for performance");
  }

  if (networkClass?.quality === "Poor") {
    reasons.push("Current network has high latency or low bandwidth");
  }

  if (metrics.scriptCount > 30) {
    reasons.push("Heavy JavaScript execution delays interactivity");
  }

  if (metrics.imgCount > 30) {
    reasons.push("Large number of images increase load time");
  }
  if (cdn) {
    reasons.push(`Content is served via ${cdn}, improving delivery speed`);
  }
  return reasons;
}


/**
 * Identify slow parts
 */
function deriveSlowParts(reasons) {
  const parts = [];

  if (reasons.some(r => r.includes("JavaScript"))) {
    parts.push("JavaScript Execution");
  }

  if (reasons.some(r => r.includes("images"))) {
    parts.push("Images");
  }

  if (reasons.some(r => r.includes("API"))) {
    parts.push("API Calls");
  }

  return parts;
}



function mapNetworkClassToKey(networkClass) {
  if (!networkClass?.label) return "4g";

  const label = networkClass.label.toLowerCase();

  if (label.includes("wifi")) return "wifi";
  if (label.includes("4g")) return "4g";
  return "3g";
}


function suggestImprovements(reasons) {
  const suggestions = [];

  if (reasons.includes("Heavy JavaScript execution delays interactivity")) {
    suggestions.push("Split JavaScript bundles and defer non-critical scripts");
  }

  if (reasons.includes("Large number of images increase load time")) {
    suggestions.push("Use modern image formats and lazy loading");
  }

  if (reasons.includes("Multiple API calls delay rendering")) {
    suggestions.push("Batch API requests or use server-side aggregation");
  }

  return suggestions;
}
function predictLoadTime({ siteWeight, optimization, networkKey }) {
  let base = 1000;

  if (siteWeight === "Light") base -= 300;
  if (siteWeight === "Heavy") base += 500;

  if (optimization.level === "High") base -= 200;
  if (optimization.level === "Low") base += 400;

  if (networkKey === "3g") base += 800;
  if (networkKey === "4g") base += 300;

  return Math.max(300, Math.round(base));
}

function buildVerdictReasons({ siteWeight, optimization, networkClass }) {
  const reasons = [];

  if (siteWeight === "Heavy") {
    reasons.push("Page has high structural complexity");
  }

  if (optimization.level !== "High") {
    reasons.push("Site is not fully optimized for performance");
  }

  if (networkClass?.quality === "Poor") {
    reasons.push("Current network has high latency or low bandwidth");
  }

  return reasons;
}

function buildPredictionReasons(metrics) {
  const reasons = [];

  if (metrics.scriptCount > 30) {
    reasons.push("Heavy JavaScript execution delays interactivity");
  }

  if (metrics.imgCount > 30) {
    reasons.push("Large number of images increase load time");
  }

  if (metrics.pageSizeKB > 1500) {
    reasons.push("Large HTML payload increases initial download time");
  }

  return reasons;
}
function detectCDN(headers) {
  const h = Object.fromEntries(
    Array.from(headers.entries()).map(([k, v]) => [k.toLowerCase(), v])
  );

  if (h["server"]?.includes("cloudflare") || h["cf-ray"]) {
    return "Cloudflare";
  }

  if (h["x-served-by"] || h["x-cache"]?.includes("fastly")) {
    return "Fastly";
  }

  if (h["via"]?.includes("cloudfront") || h["x-amz-cf-id"]) {
    return "CloudFront";
  }

  if (h["x-vercel-cache"]) {
    return "Vercel Edge Network";
  }

  if (h["x-nf-request-id"]) {
    return "Netlify Edge";
  }

  if (h["x-akamai"] || h["akamai-cache-status"]) {
    return "Akamai";
  }

  return null;
}

function calculateAccuracy({ predicted, actual, cdn }) {
  if (typeof predicted !== "number" || typeof actual !== "number") {
    return {
      value: null,
      reason: "Actual performance data restricted by site security policies",
    };
  }

  // If prediction safely covered actual load
  if (actual <= predicted) {
    // Over-prediction is acceptable → high accuracy
    const bufferRatio = (predicted - actual) / predicted;
    return Math.min(100, Math.round(80 + bufferRatio * 20));
  }

  // Under-prediction (dangerous)
  const errorRatio = (actual - predicted) / predicted;

  // CDN reduces penalty because real-world speedups are expected
  const penaltyFactor = cdn ? 0.6 : 1;

  const accuracy =
    100 - Math.min(100, Math.round(errorRatio * 100 * penaltyFactor));

  return Math.max(0, accuracy);
}


function inferCDN({ headers, url, actualMetrics }) {
  const host = new URL(url).hostname;

  // Known header-based detection
  if (headers["cf-ray"]) return "Cloudflare";
  if (headers["x-served-by"] || headers["fastly"]) return "Fastly";
  if (headers["x-vercel-cache"]) return "Vercel";
  if (headers["server"]?.includes("netlify")) return "Netlify";

  // Google / Meta / Big tech inference
  if (
  host.includes("google.") &&
  // actualMetrics &&
  actualMetrics.loadTime < 150 &&
  actualMetrics.domContentLoaded < 100
) {
  return "Google Edge Network (inferred)";
}


  return null;
}

/**
 * MAIN ANALYSIS FUNCTION
 */
async function analyzeSite(url, networkProfile){
  const normalizedUrl = normalizeUrl(url);
  const { html, headers } = await withTimeout(
  fetchHTML(normalizedUrl),
  10000
  );
  let actualMetrics = null;

try {
  actualMetrics = await measureActualPerformance(normalizedUrl);
} catch (err) {
  console.warn("Actual performance measurement failed:", err.message);
}

  const cdn = inferCDN({
  headers: Object.fromEntries(headers.entries()),
  url: normalizedUrl,
  actualMetrics,
});


  const metrics = analyzeStructure(html);
  const siteWeight = determineSiteWeight(metrics);
  const optimization = calculateOptimizationScore(metrics);
  const networks = simulateNetworks(siteWeight, optimization.level);
  
  const networkClass = networkProfile
  ? classifyNetwork(networkProfile)
  : "4G (unknown)";
  
  
  const verdictReasons = buildVerdictReasons({
    siteWeight,
    optimization,
    networkClass,
  });
  
  const predictionReasons = buildPredictionReasons(metrics);
  
  const reasons = buildReasoning({
    siteWeight,
    optimization,
    networkClass,
    metrics,
    cdn,
  });

  const suggestions = suggestImprovements(reasons);
  const slowParts = deriveSlowParts(reasons);
  const networkKey = mapNetworkClassToKey(networkClass);
  const verdict = networks[networkKey];
 
  const predictedLoadTime = predictLoadTime({
    siteWeight,
    optimization,
    networkKey,
  });

  const accuracy = actualMetrics
  ? calculateAccuracy({
      predicted: predictedLoadTime,
      actual: actualMetrics.loadTime,
      cdn,
    })
  : null;


  const description =
    optimization.level === "High"
      ? `This ${siteWeight.toLowerCase()} website is well optimized and performs efficiently on good networks.`
      : `This ${siteWeight.toLowerCase()} website shows noticeable latency on weaker networks due to structural complexity.`;

  const confidence = calculateConfidence(metrics, siteWeight);


return {
  siteWeight,
  optimization,
  verdict,
  confidence,
  reasons: verdictReasons, 
  predictionReasons,
  description,
  suggestions,
  predictedLoadTime,
  accuracy,
  actualMetrics,
  networks,
  slowParts,
  metrics,
  detectedNetwork: networkClass,
  cdn,
};

}

module.exports = { analyzeSite };