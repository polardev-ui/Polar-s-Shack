class MaintenanceMode {
  constructor() {
    this.isMaintenanceMode = false
    this.maintenanceMessage = ""
    this.popup = null
    this.apiUrl = "https://api.jsonbin.io/v3/b/67a0f1e5e41b4d34e4684c8a" // JSONBin.io endpoint for cross-device state
    this.apiKey = "$2a$10$FyO6Rk61cFF8tkXtzyZ61O4RM4VR4SwRvSRhbyUtCuIvO6e6OXRHq" // Read-only key
    this.init()
  }

  init() {
    this.checkMaintenanceStatus()
    this.setupStorageListener()

    setInterval(() => {
      this.checkServerMaintenanceStatus()
    }, 15000)

    this.checkServerMaintenanceStatus()
  }

  async checkServerMaintenanceStatus() {
    try {
      const response = await fetch(`${this.apiUrl}/latest`, {
        headers: {
          "X-Master-Key": this.apiKey,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const serverState = data.record

        if (serverState.maintenanceMode || serverState.lockdownMode) {
          const message =
            serverState.maintenanceMessage ||
            "Polar's Shack is currently receiving a new update, and we're trying to push it to your device. This is marked as a beta update, so if anything is broken, please report the game or issue thru the play page when you select a game or app, or directly from the games / apps page. Thank you."

          if (!this.isMaintenanceMode) {
            this.showMaintenancePopup(message, serverState.lockdownMode)
          }
        } else if (
          this.isMaintenanceMode &&
          !localStorage.getItem("maintenanceMode") &&
          !localStorage.getItem("lockdownMode")
        ) {
          this.hideMaintenancePopup()
        }
      }
    } catch (error) {
      console.log("[v0] Server maintenance check failed, using local storage fallback")
      this.checkMaintenanceStatus() // Fallback to local storage
    }
  }

  checkMaintenanceStatus() {
    const maintenanceMode = localStorage.getItem("maintenanceMode") === "true"
    const lockdownMode = localStorage.getItem("lockdownMode") === "true"
    const message =
      localStorage.getItem("maintenanceMessage") ||
      "Polar's Shack is currently receiving a new update, and we're trying to push it to your device. This is marked as a beta update, so if anything is broken, please report the game or issue thru the play page when you select a game or app, or directly from the games / apps page. Thank you."

    if ((maintenanceMode || lockdownMode) && !this.isMaintenanceMode) {
      this.showMaintenancePopup(message, lockdownMode)
    } else if (!maintenanceMode && !lockdownMode && this.isMaintenanceMode) {
      this.hideMaintenancePopup()
    }
  }

  setupStorageListener() {
    window.addEventListener("storage", (e) => {
      if (e.key === "maintenanceMode" || e.key === "lockdownMode") {
        this.checkMaintenanceStatus()
      }
    })
  }

  showMaintenancePopup(message, isLockdown = false) {
    if (this.popup) return

    this.isMaintenanceMode = true
    this.maintenanceMessage = message

    this.popup = document.createElement("div")
    this.popup.className = "maintenance-popup-overlay"
    this.popup.innerHTML = `
            <div class="maintenance-popup">
                <div class="maintenance-header">
                    <i class='bx bx-wrench'></i>
                    <h2>${isLockdown ? "Emergency Lockdown" : "Site Maintenance"}</h2>
                </div>
                <div class="maintenance-content">
                    <p class="maintenance-title">This site is currently undergoing maintenance.</p>
                    <p class="maintenance-message">${message}</p>
                    <div class="maintenance-progress">
                        <div class="progress-bar">
                            <div class="progress-fill"></div>
                        </div>
                        <p class="progress-text">Please wait while we update the system...</p>
                    </div>
                </div>
                <div class="maintenance-footer">
                    <button class="maintenance-btn" onclick="maintenanceMode.dismissPopup()">
                        <i class='bx bx-x'></i> Dismiss
                    </button>
                    ${
                      isLockdown
                        ? ""
                        : `
                        <button class="maintenance-btn primary" onclick="maintenanceMode.checkAgain()">
                            <i class='bx bx-refresh'></i> Check Again
                        </button>
                    `
                    }
                </div>
            </div>
        `

    this.addMaintenanceStyles()

    document.body.appendChild(this.popup)

    setTimeout(() => {
      this.popup.classList.add("active")
    }, 100)

    this.animateProgress()

    if (isLockdown) {
      document.body.style.pointerEvents = "none"
      this.popup.style.pointerEvents = "auto"
    }
  }

  hideMaintenancePopup() {
    if (!this.popup) return

    this.isMaintenanceMode = false
    this.popup.classList.remove("active")

    document.body.style.pointerEvents = ""

    setTimeout(() => {
      if (this.popup && this.popup.parentNode) {
        this.popup.parentNode.removeChild(this.popup)
      }
      this.popup = null
    }, 300)
  }

  dismissPopup() {
    const allowDismissal = localStorage.getItem("allowMaintenanceDismissal") === "true"
    const lockdownMode = localStorage.getItem("lockdownMode") === "true"

    if (!lockdownMode || allowDismissal) {
      this.hideMaintenancePopup()
    }
  }

  checkAgain() {
    this.checkMaintenanceStatus()
  }

  animateProgress() {
    if (!this.popup) return

    const progressFill = this.popup.querySelector(".progress-fill")
    if (progressFill) {
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 2
        if (progress > 95) progress = 95

        progressFill.style.width = progress + "%"

        if (!this.isMaintenanceMode) {
          clearInterval(interval)
        }
      }, 500)
    }
  }

  addMaintenanceStyles() {
    if (document.getElementById("maintenance-styles")) return

    const styles = document.createElement("style")
    styles.id = "maintenance-styles"
    styles.textContent = `
            .maintenance-popup-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                backdrop-filter: blur(10px);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
                font-family: 'JetBrains Mono', 'Courier New', monospace;
            }

            .maintenance-popup-overlay.active {
                opacity: 1;
            }

            .maintenance-popup {
                background: #2a2a2a;
                border: 1px solid #333;
                border-radius: 12px;
                max-width: 500px;
                width: 90%;
                margin: 2rem;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
                transform: translateY(20px);
                transition: transform 0.3s ease;
                overflow: hidden;
            }

            .maintenance-popup-overlay.active .maintenance-popup {
                transform: translateY(0);
            }

            .maintenance-header {
                background: #333;
                padding: 1.5rem;
                border-bottom: 1px solid #444;
                display: flex;
                align-items: center;
                gap: 1rem;
            }

            .maintenance-header i {
                font-size: 1.5rem;
                color: #ffa500;
                animation: spin 2s linear infinite;
            }

            .maintenance-header h2 {
                color: #fff;
                font-size: 1.2rem;
                margin: 0;
                font-weight: 500;
            }

            .maintenance-content {
                padding: 2rem;
            }

            .maintenance-title {
                color: #fff;
                font-size: 1.1rem;
                font-weight: 600;
                margin-bottom: 1rem;
                text-align: center;
            }

            .maintenance-message {
                color: #888;
                font-size: 0.9rem;
                line-height: 1.6;
                margin-bottom: 2rem;
                text-align: center;
            }

            .maintenance-progress {
                margin-bottom: 1rem;
            }

            .progress-bar {
                width: 100%;
                height: 6px;
                background: #444;
                border-radius: 3px;
                overflow: hidden;
                margin-bottom: 1rem;
            }

            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #00ff00, #00cc00);
                width: 0%;
                transition: width 0.5s ease;
                border-radius: 3px;
            }

            .progress-text {
                color: #666;
                font-size: 0.8rem;
                text-align: center;
                margin: 0;
            }

            .maintenance-footer {
                background: #333;
                padding: 1rem 1.5rem;
                border-top: 1px solid #444;
                display: flex;
                gap: 1rem;
                justify-content: flex-end;
            }

            .maintenance-btn {
                background: #444;
                color: #888;
                border: 1px solid #555;
                padding: 0.6rem 1.2rem;
                border-radius: 6px;
                cursor: pointer;
                font-size: 0.8rem;
                font-family: 'JetBrains Mono', monospace;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .maintenance-btn:hover {
                background: #555;
                color: #fff;
                border-color: #666;
            }

            .maintenance-btn.primary {
                background: #00ff00;
                color: #1a1a1a;
                border-color: #00ff00;
            }

            .maintenance-btn.primary:hover {
                background: #00cc00;
                border-color: #00cc00;
            }

            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }

            @media (max-width: 768px) {
                .maintenance-popup {
                    margin: 1rem;
                    width: calc(100% - 2rem);
                }

                .maintenance-header {
                    padding: 1rem;
                }

                .maintenance-content {
                    padding: 1.5rem;
                }

                .maintenance-footer {
                    padding: 1rem;
                    flex-direction: column;
                }

                .maintenance-btn {
                    width: 100%;
                    justify-content: center;
                }
            }
        `

    document.head.appendChild(styles)
  }
}

const maintenanceMode = new MaintenanceMode()
window.maintenanceMode = maintenanceMode
