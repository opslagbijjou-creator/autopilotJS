// scripts/modules/Components.js
(function () {
  const registry = window.AutopilotComponents;

  function createInstance(type) {
    const def = registry.get(type);
    if (!def) return null;

    const id =
      "elem_" + Date.now() + "_" + Math.random().toString(36).slice(2);

    const baseWidth =
      (def.defaultSize && def.defaultSize.width) || 160;
    const baseHeight =
      (def.defaultSize && def.defaultSize.height) || 40;

    const props = JSON.parse(JSON.stringify(def.defaultProps || {}));

    return {
      id,
      type,
      x: 40,
      y: 40,
      width: baseWidth,
      height: baseHeight,
      parentId: null,
      props
    };
  }

  function renderSidebar(category) {
    const list = document.getElementById("componentsList");
    if (!list) return;

    const allDefs = registry.all();
    const filtered = allDefs.filter((d) =>
      category ? d.category === category : true
    );

    if (!filtered.length) {
      list.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-box-open"></i>
          <p>No components in this category yet.</p>
        </div>
      `;
      return;
    }

    list.innerHTML = "";
    filtered.forEach((def) => {
      const item = document.createElement("div");
      item.className = "component-item";
      item.dataset.type = def.type;

      item.innerHTML = `
        <div class="component-icon">
          <i class="fas ${def.icon || "fa-square"}"></i>
        </div>
        <div class="component-meta">
          <div class="component-name">${def.label || def.type}</div>
          <div class="component-desc">${
            def.category === "patterns" ? "Pattern" : "Element"
          }</div>
        </div>
      `;

      list.appendChild(item);
    });
  }

  window.ComponentsModule = {
    createInstance,
    renderSidebar
  };
})();