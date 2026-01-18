/* ================== DRAG & DROP MANAGER ================== */

(function () {
  let dragGhost = null;
  let dragType = null;
  let dragAssetId = null;
  
  // Helper functies
  function snapToGrid(value) {
    const GRID_SIZE = 8;
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  }
  
  function moveGhost(x, y) {
    if (dragGhost) {
      dragGhost.style.left = (x + 10) + 'px';
      dragGhost.style.top = (y + 10) + 'px';
    }
  }
  
  function initDragDrop(stateManager, eventBus) {
    const componentsList = document.querySelector('.components-list');
    const phoneScreen = document.getElementById("phoneScreen");
    
    if (!componentsList || !phoneScreen) {
      console.warn('DragDropManager: componentsList or phoneScreen not found');
      return;
    }
    
    console.log('DragDropManager: Initializing...');
    
    componentsList.addEventListener("pointerdown", (e) => {
      const item = e.target.closest(".component-item");
      if (!item) return;
      
      e.preventDefault();
      
      dragType = item.dataset.type;
      dragAssetId = null;
      if (!dragType) return;
      
      const nameEl = item.querySelector(".component-name");
      const label = nameEl ? nameEl.textContent.trim() : dragType;
      
      // Create ghost element
      dragGhost = document.createElement("div");
      dragGhost.className = "drag-ghost";
      dragGhost.innerHTML = `<i class="fas fa-plus"></i><span>${label}</span>`;
      document.body.appendChild(dragGhost);
      
      moveGhost(e.clientX, e.clientY);
      
      const onMove = (moveEvent) => {
        moveEvent.preventDefault();
        moveGhost(moveEvent.clientX, moveEvent.clientY);
      };
      
      const onUp = (upEvent) => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        
        if (dragGhost) {
          dragGhost.remove();
          dragGhost = null;
        }
        
        if (!dragType || !phoneScreen) {
          dragType = null;
          return;
        }
        
        // Check if dropped inside phone screen
        const rect = phoneScreen.getBoundingClientRect();
        const x = upEvent.clientX;
        const y = upEvent.clientY;
        
        const inside = 
          x >= rect.left &&
          x <= rect.right &&
          y >= rect.top &&
          y <= rect.bottom;
        
        if (inside && window.ComponentsModule && window.ComponentsModule.createInstance) {
          try {
            const instance = window.ComponentsModule.createInstance(dragType);
            if (instance) {
              // Calculate position relative to phone screen
              const insideX = x - rect.left;
              const insideY = y - rect.top;
              
              // Center the element on drop position
              instance.x = snapToGrid(insideX - (instance.width / 2));
              instance.y = snapToGrid(insideY - (instance.height / 2));
              
              // Keep within bounds
              const maxX = rect.width - instance.width;
              const maxY = rect.height - instance.height;
              instance.x = Math.max(0, Math.min(instance.x, maxX));
              instance.y = Math.max(0, Math.min(instance.y, maxY));
              
              // Update state
              if (stateManager) {
                stateManager.setState((prev) => {
                  const proj = prev.project;
                  const screens = proj.screens.map((s) => {
                    if (s.id !== proj.activeScreenId) return s;
                    return {
                      ...s,
                      components: [...(s.components || []), instance]
                    };
                  });
                  
                  return {
                    project: {
                      ...proj,
                      screens,
                      selectedElementId: instance.id
                    }
                  };
                });
              }
              
              // Emit event
              if (eventBus) {
                eventBus.emit("element:added", {
                  id: instance.id,
                  type: dragType
                });
              }
              
              console.log(`DragDropManager: Added ${dragType} at (${instance.x}, ${instance.y})`);
            }
          } catch (error) {
            console.error('DragDropManager: Error creating component:', error);
          }
        }
        
        dragType = null;
      };
      
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    });
    
    console.log('DragDropManager: Initialized successfully');
  }
  
  // Expose to window
  window.DragDropManager = {
    init: initDragDrop
  };
})();