// scripts/core/RenderEngine.js - COMPLEET NIEUWE VERSIE
// iPhone + styling FIXED

(function () {
  const GRID_SIZE = 8;

  function snapToGrid(value) {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  }

  // Helper om contrast te berekenen
  function getContrastColor(bgColor) {
    if (!bgColor || bgColor === 'transparent' || bgColor.includes('rgba') || bgColor === 'white') {
      return '#1e293b'; // donkere tekst op lichte achtergrond
    }
    
    // Simpele check: als het een donkere kleur is, gebruik witte tekst
    if (bgColor.includes('#') && bgColor.length === 7) {
      const hex = bgColor.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      
      // Bereken helderheid
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 128 ? '#1e293b' : '#ffffff';
    }
    
    // Default: donkere tekst
    return '#1e293b';
  }

  // Helper om kleur donkerder te maken voor gradients
  function darkenColor(color, percent) {
    if (color.includes('rgb')) {
      // Voor rgba/rgb waarden
      return color.replace(')', `, ${0.8})`).replace('rgb', 'rgba');
    } else if (color.includes('#')) {
      // Voor hex kleuren - simpel donkerder maken
      return color;
    }
    return color;
  }

  class RenderEngine {
    constructor(stateManager, eventBus) {
      this.stateManager = stateManager;
      this.eventBus = eventBus;
      this.phoneScreen = document.getElementById("phoneScreen");
      this.canvasWrapper = document.getElementById("canvasWrapper");
      this.gridOverlay = document.getElementById("gridOverlay");
      this.currentState = null;
      
      // Zorg dat de iPhone een lichte achtergrond heeft
      this.initPhoneScreen();
    }

    initPhoneScreen() {
      if (this.phoneScreen) {
        // Lichte, moderne achtergrond voor de iPhone
        this.phoneScreen.style.background = 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)';
        this.phoneScreen.style.boxShadow = 'inset 0 0 0 1px rgba(255, 255, 255, 0.9), 0 30px 70px rgba(15, 23, 42, 0.4)';
      }
    }

    setState(state) {
      this.currentState = state;
      this.render();
    }

    render() {
      if (!this.phoneScreen || !this.currentState) return;

      const project = this.currentState.project;
      const activeScreen = project.screens.find(
        (s) => s.id === project.activeScreenId
      );
      if (!activeScreen) return;

      // Clear existing elements
      this.phoneScreen
        .querySelectorAll(".canvas-element")
        .forEach((el) => el.remove());

      const comps = activeScreen.components || [];
      const map = new Map();

      // Create DOM elements
      comps.forEach((comp) => {
        const el = this.createElementForComponent(comp, project);
        map.set(comp.id, { comp, el });
      });

      // Build parent/child relationships
      comps.forEach((comp) => {
        const record = map.get(comp.id);
        if (!record) return;

        if (comp.parentId && map.has(comp.parentId)) {
          const parentRecord = map.get(comp.parentId);
          parentRecord.el.appendChild(record.el);
        } else {
          this.phoneScreen.appendChild(record.el);
        }
      });

      this.attachElementInteractions();
    }

    createElementForComponent(comp, project) {
      const el = document.createElement("div");
      el.classList.add("canvas-element", "pop-in");
      el.dataset.id = comp.id;
      el.dataset.type = comp.type;

      if (project.selectedElementId === comp.id) {
        el.classList.add("selected");
      }

      // Position and size
      el.style.left = comp.x + "px";
      el.style.top = comp.y + "px";
      el.style.width = comp.width + "px";
      el.style.height = comp.height + "px";

      const props = comp.props || {};
      const style = props.style || {};

      // Apply styles based on component type
      this.applyComponentStyles(el, comp.type, style);

      // Set content
      if (comp.type.includes('text')) {
        el.classList.add('element-text');
        el.textContent = props.text || "Text";
      } else if (comp.type.includes('button')) {
        el.classList.add('element-button');
        el.textContent = props.label || "Button";
        
        // Voeg hover effect toe voor knoppen
        el.addEventListener('mouseenter', () => {
          if (!el.classList.contains('dragging')) {
            el.style.transform = 'translateY(-1px)';
          }
        });
        el.addEventListener('mouseleave', () => {
          el.style.transform = 'translateY(0)';
        });
      } else if (comp.type.includes('container') || comp.type.includes('card')) {
        el.classList.add('element-container');
        const title = document.createElement("div");
        title.className = "container-title";
        title.textContent = props.label || props.title || "Card";
        el.appendChild(title);
      } else if (comp.type.includes('input')) {
        el.classList.add('element-input');
        el.setAttribute('placeholder', props.placeholder || 'Enter text...');
      } else if (comp.type === 'image') {
        el.classList.add('element-image');
        const img = document.createElement("img");
        img.className = "image-content";
        img.src = props.src || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f1f5f9'/%3E%3Cpath d='M30,40 L70,40 L60,60 L40,60 Z' fill='%2394a3b8'/%3E%3C/svg%3E";
        img.alt = props.alt || "Image";
        el.appendChild(img);
      } else if (comp.type.includes('badge')) {
        el.classList.add('element-badge');
        el.textContent = props.label || "Badge";
      } else if (comp.type.includes('navbar')) {
        el.classList.add('element-navbar');
        el.textContent = props.label || "Navbar";
      } else {
        // fallback
        el.classList.add('element-generic');
        el.textContent = props.text || props.label || comp.type || "Element";
      }

      // Add UI chrome (duplicate/delete/resize)
      this.addUIChrome(el, comp);

      // Click to select
      el.addEventListener("pointerdown", (e) => {
        if (
          e.target.closest(".resize-handle") ||
          e.target.closest(".element-actions")
        ) {
          return;
        }
        e.stopPropagation();
        this.selectElement(comp.id);
      });

      // Double-click to edit text
      el.addEventListener("dblclick", (e) => {
        e.stopPropagation();
        this.editElementText(comp);
      });

      el.addEventListener("animationend", () => {
        el.classList.remove("pop-in");
      });

      return el;
    }

    applyComponentStyles(el, type, style) {
      // Reset naar moderne defaults
      el.style.fontFamily = style.fontFamily || "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      el.style.border = 'none';
      el.style.outline = 'none';
      el.style.boxSizing = 'border-box';

      // Background color - speciaal voor knoppen
      if (style.backgroundColor) {
        if (type.includes('button')) {
          // Voor knoppen: maak een mooie gradient
          el.style.background = `linear-gradient(135deg, ${style.backgroundColor} 0%, ${darkenColor(style.backgroundColor, 20)} 100%)`;
          el.style.border = 'none';
          
          // Automatische tekstkleur voor contrast
          if (!style.textColor) {
            el.style.color = getContrastColor(style.backgroundColor);
          }
        } else {
          // Voor andere elementen: gewone achtergrond
          el.style.backgroundColor = style.backgroundColor;
        }
      } else if (type.includes('button')) {
        // Default button style als geen kleur gekozen is
        el.style.background = 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)';
        el.style.color = '#ffffff';
      } else if (type.includes('container') || type.includes('card')) {
        // Default card style
        el.style.backgroundColor = style.backgroundColor || 'rgba(255, 255, 255, 0.95)';
        el.style.backdropFilter = 'blur(10px)';
      } else {
        // Default voor andere elementen
        el.style.backgroundColor = style.backgroundColor || 'transparent';
      }

      // Text color
      if (style.textColor) {
        el.style.color = style.textColor;
      } else if (!type.includes('button') && style.backgroundColor) {
        // Auto text color voor niet-knoppen
        el.style.color = getContrastColor(style.backgroundColor);
      }

      // Font size
      if (style.fontSize) {
        el.style.fontSize = 
          typeof style.fontSize === "number" 
            ? style.fontSize + "px" 
            : style.fontSize;
      } else {
        // Default font sizes per type
        if (type.includes('heading')) el.style.fontSize = '24px';
        else if (type.includes('button')) el.style.fontSize = '15px';
        else if (type.includes('text')) el.style.fontSize = '16px';
        else el.style.fontSize = '14px';
      }

      // Font weight
      if (type.includes('heading') || type.includes('button')) {
        el.style.fontWeight = '600';
      }

      // Border radius
      if (style.borderRadius != null) {
        el.style.borderRadius = 
          typeof style.borderRadius === "number" 
            ? style.borderRadius + "px" 
            : style.borderRadius;
      } else {
        // Default border radii
        if (type.includes('button')) el.style.borderRadius = '12px';
        else if (type.includes('card') || type.includes('container')) el.style.borderRadius = '20px';
        else if (type.includes('badge')) el.style.borderRadius = '999px';
        else if (type.includes('input')) el.style.borderRadius = '10px';
        else if (type.includes('image')) el.style.borderRadius = '16px';
        else el.style.borderRadius = '8px';
      }

      // Box shadow (elevation)
      if (style.elevation === 0 || style.elevation === "0") {
        el.style.boxShadow = 'none';
      } else if (style.elevation === 1 || style.elevation === "1") {
        el.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.03)';
      } else if (style.elevation === 2 || style.elevation === "2") {
        el.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12), 0 3px 10px rgba(0, 0, 0, 0.06)';
      } else {
        // Default shadow based on type
        if (type.includes('button')) {
          el.style.boxShadow = '0 4px 16px rgba(99, 102, 241, 0.25), 0 1px 3px rgba(99, 102, 241, 0.1)';
        } else if (type.includes('card') || type.includes('container')) {
          el.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.03)';
        } else {
          el.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
        }
      }

      // Padding
      if (type.includes('button')) {
        el.style.padding = '12px 24px';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.minHeight = '44px';
      } else if (type.includes('input')) {
        el.style.padding = '0 14px';
      } else if (type.includes('text')) {
        el.style.padding = '8px 12px';
      }

      // Speciale stijlen voor images
      if (type === 'image') {
        if (style.brightness !== undefined) {
          el.querySelector('.image-content').style.filter = `brightness(${style.brightness})`;
        }
      }
    }

    addUIChrome(el, comp) {
      const actions = document.createElement("div");
      actions.className = "element-actions";

      const duplicateBtn = document.createElement("button");
      duplicateBtn.className = "action-btn";
      duplicateBtn.innerHTML = `<i class="fas fa-clone"></i>`;
      duplicateBtn.title = "Duplicate";
      duplicateBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.duplicateElement(comp.id);
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "action-btn danger";
      deleteBtn.innerHTML = `<i class="fas fa-trash"></i>`;
      deleteBtn.title = "Delete";
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.deleteElement(comp.id);
      });

      actions.appendChild(duplicateBtn);
      actions.appendChild(deleteBtn);
      el.appendChild(actions);

      const resizeHandle = document.createElement("div");
      resizeHandle.className = "resize-handle se";
      resizeHandle.addEventListener("pointerdown", (e) =>
        this.startResize(e, comp.id)
      );
      el.appendChild(resizeHandle);
    }

    editElementText(comp) {
      const props = comp.props || {};
      const current = 
        comp.type.includes('text') ? props.text || "" :
        comp.type.includes('button') ? props.label || "" :
        comp.type.includes('input') ? props.placeholder || "" :
        comp.type.includes('container') ? props.label || "" :
        "";
      
      if (current === "") return; // Niet bewerken als er geen tekst is
      
      const next = window.prompt("Edit text:", current);
      if (next == null) return;

      this.stateManager.setState((prev) => {
        const proj = prev.project;
        const screens = proj.screens.map((s) => {
          if (s.id !== proj.activeScreenId) return s;
          const comps = s.components.map((c) => {
            if (c.id !== comp.id) return c;
            const newProps = { ...(c.props || {}) };
            
            if (c.type.includes('text')) {
              newProps.text = next;
            } else if (c.type.includes('button')) {
              newProps.label = next;
            } else if (c.type.includes('input')) {
              newProps.placeholder = next;
            } else if (c.type.includes('container') || c.type.includes('card')) {
              newProps.label = next;
            }
            
            return { ...c, props: newProps };
          });
          return { ...s, components: comps };
        });
        return { project: { ...proj, screens } };
      });
    }

    selectElement(elementId) {
      const state = this.stateManager.getState();
      this.stateManager.setState({
        project: {
          ...state.project,
          selectedElementId: elementId
        }
      });
      if (this.eventBus) {
        this.eventBus.emit("element:selected", { id: elementId });
      }
    }

    deleteElement(elementId) {
      this.stateManager.setState((prev) => {
        const proj = prev.project;
        const screens = proj.screens.map((s) => {
          if (s.id !== proj.activeScreenId) return s;
          const idsToRemove = new Set([elementId]);
          (s.components || []).forEach((c) => {
            if (c.parentId === elementId) idsToRemove.add(c.id);
          });
          const comps = s.components.filter((c) => !idsToRemove.has(c.id));
          return { ...s, components: comps };
        });
        return {
          project: {
            ...proj,
            screens,
            selectedElementId:
              proj.selectedElementId === elementId ? null : proj.selectedElementId
          }
        };
      });
    }

    duplicateElement(elementId) {
      this.stateManager.setState((prev) => {
        const proj = prev.project;
        const screens = proj.screens.map((s) => {
          if (s.id !== proj.activeScreenId) return s;
          const comps = [...s.components];
          const idx = comps.findIndex((c) => c.id === elementId);
          if (idx === -1) return s;
          const original = comps[idx];
          const newId =
            "elem_" +
            Date.now() +
            "_" +
            Math.random().toString(36).slice(2);
          const copy = {
            ...original,
            id: newId,
            x: original.x + 20,
            y: original.y + 20
          };
          comps.splice(idx + 1, 0, copy);
          return { ...s, components: comps };
        });
        return { project: { ...proj, screens } };
      });
    }

    attachElementInteractions() {
      if (!this.phoneScreen) return;
      const elements = this.phoneScreen.querySelectorAll(".canvas-element");

      elements.forEach((el) => {
        el.onpointerdown = (e) => {
          if (
            e.target.closest(".resize-handle") ||
            e.target.closest(".element-actions")
          ) {
            return;
          }
          const id = el.dataset.id;
          if (!id) return;
          this.handlePointerDown(e, id);
        };
      });
    }

    handlePointerDown(e, elementId) {
      if (e.button !== 0 && e.pointerType !== "touch") return;
      e.preventDefault();
      e.stopPropagation();

      this.selectElement(elementId);

      const startX = e.clientX;
      const startY = e.clientY;

      const state = this.stateManager.getState();
      const project = state.project;
      const screen = project.screens.find((s) => s.id === project.activeScreenId);
      if (!screen) return;

      const compIndex = screen.components.findIndex((c) => c.id === elementId);
      if (compIndex === -1) return;

      const comp = screen.components[compIndex];
      const initialX = comp.x;
      const initialY = comp.y;

      const elementEl = this.phoneScreen.querySelector(
        `.canvas-element[data-id="${elementId}"]`
      );
      if (elementEl) {
        elementEl.classList.add("dragging");
        elementEl.style.zIndex = "1001";
      }

      let moved = false;

      const onMove = (moveEvent) => {
        moveEvent.preventDefault();
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;

        if (!moved && Math.hypot(dx, dy) < 2) return;
        moved = true;

        let newX = snapToGrid(initialX + dx);
        let newY = snapToGrid(initialY + dy);

        if (elementEl) {
          elementEl.style.left = newX + "px";
          elementEl.style.top = newY + "px";
        }
      };

      const onUp = (upEvent) => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);

        const dx = upEvent.clientX - startX;
        const dy = upEvent.clientY - startY;
        let finalX = snapToGrid(initialX + dx);
        let finalY = snapToGrid(initialY + dy);

        if (elementEl) {
          elementEl.classList.remove("dragging");
          elementEl.style.zIndex = "";
          elementEl.style.transform = ""; // Reset hover transform
        }

        if (!moved) return;

        this.stateManager.setState((prev) => {
          const proj = prev.project;
          const screens = proj.screens.map((s) => {
            if (s.id !== proj.activeScreenId) return s;
            const comps = s.components.map((c) =>
              c.id === elementId ? { ...c, x: finalX, y: finalY } : c
            );
            return { ...s, components: comps };
          });
          return { project: { ...proj, screens } };
        });
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    }

    startResize(e, elementId) {
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startY = e.clientY;

      const state = this.stateManager.getState();
      const project = state.project;
      const screen = project.screens.find((s) => s.id === project.activeScreenId);
      if (!screen) return;

      const compIndex = screen.components.findIndex((c) => c.id === elementId);
      if (compIndex === -1) return;

      const comp = screen.components[compIndex];
      const initialWidth = comp.width;
      const initialHeight = comp.height;

      const elementEl = this.phoneScreen.querySelector(
        `.canvas-element[data-id="${elementId}"]`
      );
      if (elementEl) {
        elementEl.classList.add("resizing");
      }

      const onMove = (moveEvent) => {
        moveEvent.preventDefault();
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;

        const newWidth = Math.max(40, initialWidth + dx);
        const newHeight = Math.max(24, initialHeight + dy);

        if (elementEl) {
          elementEl.style.width = newWidth + "px";
          elementEl.style.height = newHeight + "px";
        }
      };

      const onUp = (upEvent) => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);

        const dx = upEvent.clientX - startX;
        const dy = upEvent.clientY - startY;
        const finalWidth = Math.max(40, initialWidth + dx);
        const finalHeight = Math.max(24, initialHeight + dy);

        if (elementEl) {
          elementEl.classList.remove("resizing");
        }

        this.stateManager.setState((prev) => {
          const proj = prev.project;
          const screens = proj.screens.map((s) => {
            if (s.id !== proj.activeScreenId) return s;
            const comps = s.components.map((c) =>
              c.id === elementId
                ? { ...c, width: finalWidth, height: finalHeight }
                : c
            );
            return { ...s, components: comps };
          });
          return { project: { ...proj, screens } };
        });
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    }

    setZoom(zoom) {
      if (!this.canvasWrapper) return;
      const clamped = Math.max(0.25, Math.min(2, zoom));
      this.canvasWrapper.style.transform = `translate(-50%, -50%) scale(${clamped})`;
    }

    setGridVisible(visible) {
      if (!this.gridOverlay) return;
      this.gridOverlay.style.display = visible ? "block" : "none";
    }
  }

  window.RenderEngine = RenderEngine;
})();