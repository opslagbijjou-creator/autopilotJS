// scripts/components/_registry.js
(function () {
  if (window.AutopilotComponents) return;

  window.AutopilotComponents = {
    definitions: {},

    registerMany(list) {
      (list || []).forEach(function (def) {
        if (!def || !def.type) return;
        window.AutopilotComponents.definitions[def.type] = def;
      });
    },

    get(type) {
      return window.AutopilotComponents.definitions[type] || null;
    },

    all() {
      return Object.values(window.AutopilotComponents.definitions);
    }
  };
})();