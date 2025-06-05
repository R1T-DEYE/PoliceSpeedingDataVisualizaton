// Accessibility for all toggle button groups including chart buttons
function setupAccessibleToggle(groupSelector, onSelectCallback = null) {
  const group = document.querySelector(groupSelector);
  if (!group) return;

  const buttons = group.querySelectorAll("button");
  group.setAttribute("role", "tablist");

  buttons.forEach((btn, index) => {
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", index === 0 ? "true" : "false");
    btn.setAttribute("tabindex", index === 0 ? "0" : "-1");

    btn.addEventListener("keydown", (e) => {
      let newIndex = index;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        newIndex = (index + 1) % buttons.length;
        e.preventDefault();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        newIndex = (index - 1 + buttons.length) % buttons.length;
        e.preventDefault();
      } else if (e.key === "Enter" || e.key === " ") {
        btn.click();
        return;
      }

      buttons.forEach((b, i) => {
        b.setAttribute("aria-selected", i === newIndex ? "true" : "false");
        b.setAttribute("tabindex", i === newIndex ? "0" : "-1");
      });

      buttons[newIndex].focus();
    });

    btn.addEventListener("click", () => {
      buttons.forEach(b => b.setAttribute("aria-selected", "false"));
      btn.setAttribute("aria-selected", "true");

      if (onSelectCallback) {
        onSelectCallback(btn);
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupAccessibleToggle("#view-toggle", (btn) => {
    const showLine = btn.id.includes("line");
    document.getElementById("line-view").style.display = showLine ? "block" : "none";
    document.getElementById("table-view").style.display = showLine ? "none" : "block";
  });

  setupAccessibleToggle("#view-toggle-fatalities", (btn) => {
    const showLine = btn.id.includes("line");
    document.getElementById("fatality-line-view").style.display = showLine ? "block" : "none";
    document.getElementById("fatality-table-view").style.display = showLine ? "none" : "block";
  });

  setupAccessibleToggle("#toggle-buttons", (btn) => {
    const mode = btn.dataset.view;
    const wrapper = document.getElementById("chart-wrapper");
    wrapper.className = mode;
  });

  setupAccessibleToggle("#jurisdiction-toggle", (btn) => {
    drawFatalityJurisdiction(btn.dataset.mode);
  });

  setupAccessibleToggle("#speed-limit-buttons", (btn) => {
    drawSpeedLimitFatalities(btn.dataset.mode);
  });
});
