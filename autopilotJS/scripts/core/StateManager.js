// scripts/core/StateManager.js
(function () {
  class StateManagerClass {
    constructor() {
      const firstScreenId = "screen_" + Date.now();
      this.state = {
        project: {
          name: "New App",
          viewport: "mobile",
          zoom: 1,
          screens: [
            {
              id: firstScreenId,
              name: "Screen 1",
              components: []
            }
          ],
          activeScreenId: firstScreenId,
          selectedElementId: null,
          assets: []
        }
      };
      this.listeners = new Set();
    }

    getState() {
      return this.state;
    }

    setState(update) {
      const patch =
        typeof update === "function" ? update(this.state) : update || {};
      this.state = deepMerge(this.state, patch);
      this.notify();
    }

    subscribe(listener) {
      this.listeners.add(listener);
      listener(this.state); // direct eerste state
      return () => this.listeners.delete(listener);
    }

    notify() {
      this.listeners.forEach((fn) => {
        try {
          fn(this.state);
        } catch (e) {
          console.error("State listener error:", e);
        }
      });
    }
  }

  function deepMerge(target, patch) {
    if (patch === target) return target;
    if (!isObject(target) || !isObject(patch)) return patch;

    const out = Array.isArray(target) ? target.slice() : { ...target };

    Object.keys(patch).forEach((key) => {
      const value = patch[key];
      if (Array.isArray(value)) {
        out[key] = value.slice();
      } else if (isObject(value)) {
        out[key] = deepMerge(out[key] || {}, value);
      } else {
        out[key] = value;
      }
    });

    return out;
  }

  function isObject(v) {
    return v && typeof v === "object";
  }

  window.StateManager = new StateManagerClass();
})();