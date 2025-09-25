document.addEventListener("DOMContentLoaded", function () {
  // check if already accepted
  if (localStorage.getItem("tosAccepted_2025_09_27")) return;

  // create popup HTML
  const overlay = document.createElement("div");
  overlay.id = "tosPopupOverlay";
  overlay.className = "tos-popup-overlay";
  overlay.innerHTML = `
    <div class="tos-popup" id="tosPopup">
      <h2>New TOS and Privacy Policy</h2>
      <p>
        We have updated our Terms of Service and Privacy Policy. These changes will take effect on 
        <strong>September 27th, 2025</strong>. By continuing, you agree to the new policies.
      </p>
      <button id="tosAgreeBtn" class="tos-btn">
        Agree and Continue
        <span class="spinner"></span>
      </button>
    </div>
  `;
  document.body.appendChild(overlay);

  const popup = overlay.querySelector("#tosPopup");
  const btn = overlay.querySelector("#tosAgreeBtn");

  // show popup with animation
  requestAnimationFrame(() => {
    overlay.classList.add("active");
    setTimeout(() => popup.classList.add("show"), 50);
  });

  // button click
  btn.addEventListener("click", () => {
    btn.classList.add("loading");
    setTimeout(() => {
      overlay.style.opacity = "0";
      popup.style.opacity = "0";
      setTimeout(() => overlay.remove(), 400);
    }, 2000); // 2 sec spinner
    localStorage.setItem("tosAccepted_2025_09_27", "true");
  });
});
