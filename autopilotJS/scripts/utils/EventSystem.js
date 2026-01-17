(function(){
  const listeners = {};

  window.EventBus = {
    on(evt, fn) {
      if(!listeners[evt]) listeners[evt] = new Set();
      listeners[evt].add(fn);
    },
    emit(evt, data) {
      (listeners[evt] || []).forEach(fn => fn(data));
    }
  };
})();