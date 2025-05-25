document.addEventListener("DOMContentLoaded", () => {
  const wrapper = document.getElementById("chart-wrapper");
  const buttons = document.querySelectorAll("#toggle-buttons button");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const view = btn.getAttribute("data-view");
      wrapper.classList.remove("fatal", "fines", "both");
      wrapper.classList.add(view);
    });
  });
});
