// Advanced Proxy Service Worker
class ProxyService {
    constructor() {
        this.corsProxies = [
            'https://render-proxy-6x2v.onrender.com/proxy?url=',
            'https://api.allorigins.win/raw?url=',
            'https://cors-anywhere.herokuapp.com/',
            'https://thingproxy.freeboard.io/fetch/',
            'https://api.codetabs.com/v1/proxy?quest='
        ];
        this.currentProxyIndex = 0;
    }

    async fetchWithProxy(url, proxyIndex = 0) {
        if (proxyIndex >= this.corsProxies.length) {
            throw new Error('All proxy services failed');
        }

        const proxyUrl = this.corsProxies[proxyIndex] + encodeURIComponent(url);
        
        try {
            const response = await fetch(proxyUrl, {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return await response.text();
        } catch (error) {
            console.log(`Proxy ${proxyIndex} failed:`, error);
            return this.fetchWithProxy(url, proxyIndex + 1);
        }
    }

    rewriteHTML(html, baseUrl) {
        // Rewrite relative URLs to absolute URLs
        const base = new URL(baseUrl);
        
        // Rewrite href attributes
        html = html.replace(/href=["'](?!https?:\/\/|\/\/|#)([^"']+)["']/gi, (match, url) => {
            try {
                const absoluteUrl = new URL(url, base).href;
                return `href="${absoluteUrl}"`;
            } catch {
                return match;
            }
        });

        // Rewrite src attributes
        html = html.replace(/src=["'](?!https?:\/\/|\/\/|data:)([^"']+)["']/gi, (match, url) => {
            try {
                const absoluteUrl = new URL(url, base).href;
                return `src="${absoluteUrl}"`;
            } catch {
                return match;
            }
        });

        // Rewrite action attributes
        html = html.replace(/action=["'](?!https?:\/\/|\/\/)([^"']+)["']/gi, (match, url) => {
            try {
                const absoluteUrl = new URL(url, base).href;
                return `action="${absoluteUrl}"`;
            } catch {
                return match;
            }
        });

        // Inject proxy script
        const proxyScript = `
            <script>
                // Override link clicks to use proxy
                document.addEventListener('click', function(e) {
                    if (e.target.tagName === 'A' && e.target.href) {
                        e.preventDefault();
                        window.parent.postMessage({
                            type: 'navigate',
                            url: e.target.href
                        }, '*');
                    }
                });

                // Override form submissions
                document.addEventListener('submit', function(e) {
                    e.preventDefault();
                    const form = e.target;
                    const formData = new FormData(form);
                    const url = form.action || window.location.href;
                    
                    window.parent.postMessage({
                        type: 'submit',
                        url: url,
                        method: form.method || 'GET',
                        data: Object.fromEntries(formData)
                    }, '*');
                });

                // Override window.location changes
                const originalPushState = history.pushState;
                const originalReplaceState = history.replaceState;
                
                history.pushState = function(state, title, url) {
                    window.parent.postMessage({
                        type: 'navigate',
                        url: new URL(url, window.location.href).href
                    }, '*');
                    return originalPushState.apply(this, arguments);
                };
                
                history.replaceState = function(state, title, url) {
                    window.parent.postMessage({
                        type: 'navigate',
                        url: new URL(url, window.location.href).href
                    }, '*');
                    return originalReplaceState.apply(this, arguments);
                };
            </script>
        `;

        // Inject before closing body tag
        html = html.replace(/<\/body>/i, proxyScript + '</body>');

        return html;
    }

    injectCSS(html) {
        const proxyCSS = `
            <style>
                /* Proxy overlay styles */
                .proxy-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    background: #1a1a1a;
                    color: #00ff00;
                    padding: 5px 10px;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 12px;
                    z-index: 999999;
                    border-bottom: 1px solid #333;
                }
                
                body {
                    margin-top: 30px !important;
                }
                
                /* Hide potential blocking elements */
                [class*="adblock"], [id*="adblock"],
                [class*="popup"], [id*="popup"],
                [class*="overlay"], [id*="overlay"] {
                    display: none !important;
                }
            </style>
        `;

        html = html.replace(/<head>/i, '<head>' + proxyCSS);
        
        // Add proxy indicator
        const proxyIndicator = `
            <div class="proxy-overlay">
                🔒 Browsing through Polar's Proxy - <span id="proxy-url"></span>
            </div>
        `;
        
        html = html.replace(/<body[^>]*>/i, '$&' + proxyIndicator);
        
        return html;
    }
}

// Export for use in main proxy
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProxyService;
} else {
    window.ProxyService = ProxyService;
}
