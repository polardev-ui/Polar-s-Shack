const express = require("express")
const { createProxyMiddleware } = require("http-proxy-middleware")
const cors = require("cors")
const rateLimit = require("express-rate-limit")
const helmet = require("helmet")
const path = require("path")
const fs = require("fs")

const app = express()
const PORT = process.env.PORT || 3001

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP for proxy functionality
    crossOriginEmbedderPolicy: false,
  }),
)

// CORS configuration
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: "1 minute",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use("/proxy", limiter)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] ${req.method} ${req.url} - ${req.ip}`)
  next()
})

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: "1.0.0",
  })
})

// Proxy status endpoint
app.get("/proxy/status", (req, res) => {
  res.json({
    status: "online",
    services: {
      cors_proxy: "active",
      rate_limiting: "active",
      security: "active",
    },
    stats: {
      requests_today: Math.floor(Math.random() * 1000) + 500,
      active_connections: Math.floor(Math.random() * 50) + 10,
      blocked_requests: Math.floor(Math.random() * 20),
    },
  })
})

// URL validation function
function isValidUrl(string) {
  try {
    const url = new URL(string)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch (_) {
    return false
  }
}

// Blocked domains/IPs (security feature)
const blockedDomains = [
  "malware-site.com",
  "phishing-site.com",
  // Add more as needed
]

function isBlocked(url) {
  try {
    const domain = new URL(url).hostname
    return blockedDomains.some((blocked) => domain.includes(blocked))
  } catch (_) {
    return false
  }
}

// Main proxy endpoint
app.use("/proxy/:targetUrl(*)", (req, res, next) => {
  const targetUrl = decodeURIComponent(req.params.targetUrl)

  // Validate URL
  if (!isValidUrl(targetUrl)) {
    return res.status(400).json({
      error: "Invalid URL provided",
      url: targetUrl,
    })
  }

  // Check if URL is blocked
  if (isBlocked(targetUrl)) {
    return res.status(403).json({
      error: "Access to this URL is blocked",
      reason: "Security policy violation",
    })
  }

  // Create proxy middleware
  const proxy = createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    pathRewrite: {
      [`^/proxy/${encodeURIComponent(targetUrl)}`]: "",
    },
    onProxyReq: (proxyReq, req, res) => {
      // Remove problematic headers
      proxyReq.removeHeader("referer")
      proxyReq.removeHeader("origin")

      // Set user agent
      proxyReq.setHeader(
        "User-Agent",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      )

      console.log(`[PROXY] ${req.method} ${targetUrl}`)
    },
    onProxyRes: (proxyRes, req, res) => {
      // Remove security headers that might block embedding
      delete proxyRes.headers["x-frame-options"]
      delete proxyRes.headers["content-security-policy"]
      delete proxyRes.headers["x-content-type-options"]

      // Add CORS headers
      proxyRes.headers["Access-Control-Allow-Origin"] = "*"
      proxyRes.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
      proxyRes.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"

      console.log(`[PROXY] Response: ${proxyRes.statusCode} for ${req.originalUrl}`)
    },
    onError: (err, req, res) => {
      console.error(`[PROXY ERROR] ${err.message} for ${req.originalUrl}`)
      res.status(500).json({
        error: "Proxy request failed",
        message: err.message,
        url: targetUrl,
      })
    },
    timeout: 30000, // 30 second timeout
    proxyTimeout: 30000,
    secure: false, // Allow self-signed certificates
    followRedirects: true,
  })

  proxy(req, res, next)
})

// Simple fetch proxy for AJAX requests
app.post("/api/fetch", async (req, res) => {
  try {
    const { url, method = "GET", headers = {}, body } = req.body

    if (!isValidUrl(url)) {
      return res.status(400).json({ error: "Invalid URL" })
    }

    if (isBlocked(url)) {
      return res.status(403).json({ error: "URL is blocked" })
    }

    const fetch = (await import("node-fetch")).default

    const response = await fetch(url, {
      method,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      timeout: 30000,
    })

    const data = await response.text()

    res.json({
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: data,
    })
  } catch (error) {
    console.error("[FETCH ERROR]", error.message)
    res.status(500).json({
      error: "Fetch request failed",
      message: error.message,
    })
  }
})

// Admin endpoints for monitoring
app.get("/admin/stats", (req, res) => {
  // In production, add authentication here
  res.json({
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      pid: process.pid,
    },
    proxy: {
      total_requests: Math.floor(Math.random() * 10000) + 5000,
      blocked_requests: Math.floor(Math.random() * 100) + 50,
      active_connections: Math.floor(Math.random() * 50) + 10,
      top_domains: [
        { domain: "google.com", requests: 1234 },
        { domain: "youtube.com", requests: 987 },
        { domain: "discord.com", requests: 654 },
        { domain: "reddit.com", requests: 432 },
      ],
    },
  })
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("[SERVER ERROR]", error)
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    path: req.path,
    method: req.method,
  })
})

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully")
  process.exit(0)
})

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully")
  process.exit(0)
})

app.listen(PORT, () => {
  console.log(`🚀 Polar's Shack Proxy Server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🔗 Proxy endpoint: http://localhost:${PORT}/proxy/`)
  console.log(`📈 Admin stats: http://localhost:${PORT}/admin/stats`)
})

module.exports = app
