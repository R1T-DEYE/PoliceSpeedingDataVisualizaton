document.addEventListener("DOMContentLoaded", () => {
  drawFatalChart();

  const wrapper = document.getElementById("chart-wrapper");
  const buttons = document.querySelectorAll("#toggle-buttons button");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const view = btn.getAttribute("data-view");
      wrapper.classList.remove("fines", "fatal", "both");
      wrapper.classList.add(view);
      drawFatalChart(); // redraw after layout change
    });
  });

  // Optional: Redraw on window resize
  window.addEventListener("resize", () => {
    drawFatalChart();
  });
});
