// scripts/modules/Sidebar.js
(function () {
  const list = document.getElementById("componentsList");
  if (!list) return;

  // luister naar events
  EventBus.on("sidebar:render", (comps) => {
    list.innerHTML = "";
    (comps || []).forEach((c) => {
      const el = document.createElement("div");
      el.className = "component-item";
      el.dataset.type = c.type;

      el.innerHTML = `
        <div class="component-icon">
          <i class="fas ${c.icon || "fa-square"}"></i>
        </div>
        <div class="component-meta">
          <div class="component-name">${c.label || c.type}</div>
          <div class="component-desc">
            ${(c.category === "advanced" || c.category === "patterns") ? "Pattern" : "Element"}
          </div>
        </div>
      `;

      el.onmousedown = (e) => {
        e.preventDefault();
        if (window.DragDrop && window.DragDrop.startDragging) {
          window.DragDrop.startDragging(c.type);
        }
      };

      list.appendChild(el);
    });
  });

  // BOOT – haal alle defs uit registry en render
  (function () {
    if (!window.AutopilotComponents || !window.AutopilotComponents.all) {
      console.error("AutopilotComponents.all ontbreekt");
      return;
    }
    const comps = window.AutopilotComponents.all();
    EventBus.emit("sidebar:render", comps);
  })();
})();