// scripts/core/EventSystem.js
(function () {
  const listeners = {};

  const EventBus = {
    on(evt, fn) {
      if (!listeners[evt]) listeners[evt] = new Set();
      listeners[evt].add(fn);
    },
    off(evt, fn) {
      if (!listeners[evt]) return;
      listeners[evt].delete(fn);
    },
    emit(evt, data) {
      (listeners[evt] || []).forEach((fn) => {
        try {
          fn(data);
        } catch (e) {
          console.error("Event handler error for", evt, e);
        }
      });
    }
  };

  window.EventBus = EventBus;
  window.EventSystem = EventBus; // voor oude references
})();