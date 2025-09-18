class ProxyClient {
  constructor(serverUrl = "https://render-proxy-6x2v.onrender.com") {
    this.serverUrl = serverUrl
    this.isOnline = false
    this.stats = null
    this.init()
  }

  async init() {
    await this.checkStatus()
    this.setupPeriodicChecks()
  }

  async checkStatus() {
    try {
      const response = await fetch(`${this.serverUrl}/healthz`)
      if (response.ok) {
        this.isOnline = true
        console.log("[ProxyClient] Server online")
        return true
      }
    } catch (error) {
      this.isOnline = false
      console.log("[ProxyClient] Server offline:", error.message)
    }
    return false
  }

  async getProxyStatus() {
    try {
      const response = await fetch(`${this.serverUrl}/proxy`)
      if (response.ok) {
        this.stats = await response.json()
        return this.stats
      }
    } catch (error) {
      console.error("[ProxyClient] Failed to get proxy status:", error)
    }
    return null
  }

  async proxyUrl(targetUrl) {
    if (!this.isOnline) {
      throw new Error("Proxy server is offline")
    }

    const proxyUrl = `${this.serverUrl}/proxy/${encodeURIComponent(targetUrl)}`
    return proxyUrl
  }

  async fetchThroughProxy(url, options = {}) {
    try {
      const response = await fetch(`${this.serverUrl}/api/fetch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url,
          method: options.method || "GET",
          headers: options.headers || {},
          body: options.body,
        }),
      })

      if (response.ok) {
        return await response.json()
      } else {
        throw new Error(`Proxy fetch failed: ${response.status}`)
      }
    } catch (error) {
      console.error("[ProxyClient] Fetch through proxy failed:", error)
      throw error
    }
  }

  setupPeriodicChecks() {
    // Check server status every 30 seconds
    setInterval(async () => {
      await this.checkStatus()
    }, 30000)

    // Update stats every 60 seconds
    setInterval(async () => {
      if (this.isOnline) {
        await this.getProxyStatus()
      }
    }, 60000)
  }

  // Admin functions
  async getAdminStats() {
    try {
      const response = await fetch(`${this.serverUrl}/admin/stats`)
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error("[ProxyClient] Failed to get admin stats:", error)
    }
    return null
  }
}

// Make ProxyClient globally available
window.ProxyClient = ProxyClient
