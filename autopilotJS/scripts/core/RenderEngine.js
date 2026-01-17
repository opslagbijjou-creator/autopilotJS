// scripts/core/RenderEngine.js - COMPLEET NIEUW
// Sigma-style styling engine

(function () {
  const GRID_SIZE = 8;

  function snapToGrid(value) {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  }

  // Geavanceerde styling engine
  class StyleEngine {
    static applyStyles(element, type, style = {}) {
      if (!element) return;
      
      // Reset naar basis
      element.style.cssText = '';
      
      // Typography
      if (style.fontFamily) element.style.fontFamily = style.fontFamily;
      if (style.fontSize) {
        element.style.fontSize = typeof style.fontSize === 'number' 
          ? style.fontSize + 'px' 
          : style.fontSize;
      }
      if (style.fontWeight) element.style.fontWeight = style.fontWeight;
      if (style.lineHeight) element.style.lineHeight = style.lineHeight;
      if (style.letterSpacing) element.style.letterSpacing = style.letterSpacing;
      if (style.textAlign) element.style.textAlign = style.textAlign;
      if (style.textTransform) element.style.textTransform = style.textTransform;
      
      // Colors
      if (style.color) element.style.color = style.color;
      if (style.backgroundColor) element.style.backgroundColor = style.backgroundColor;
      
      // Border
      if (style.borderWidth) element.style.borderWidth = style.borderWidth;
      if (style.borderColor) element.style.borderColor = style.borderColor;
      if (style.borderStyle) element.style.borderStyle = style.borderStyle || 'solid';
      
      // Border Radius
      if (style.borderRadius !== undefined) {
        element.style.borderRadius = typeof style.borderRadius === 'number'
          ? style.borderRadius + 'px'
          : style.borderRadius;
      }
      
      // Spacing
      if (style.padding) element.style.padding = style.padding;
      if (style.margin) element.style.margin = style.margin;
      
      // Layout
      if (style.display) element.style.display = style.display;
      if (style.flexDirection) element.style.flexDirection = style.flexDirection;
      if (style.justifyContent) element.style.justifyContent = style.justifyContent;
      if (style.alignItems) element.style.alignItems = style.alignItems;
      if (style.gap) element.style.gap = style.gap;
      
      // Effects
      if (style.boxShadow) element.style.boxShadow = style.boxShadow;
      if (style.opacity !== undefined) element.style.opacity = style.opacity;
      if (style.backdropFilter) element.style.backdropFilter = style.backdropFilter;
      if (style.backgroundImage) element.style.backgroundImage = style.backgroundImage;
      if (style.backgroundSize) element.style.backgroundSize = style.backgroundSize;
      if (style.backgroundPosition) element.style.backgroundPosition = style.backgroundPosition;
      
      // Position (absolute elements)
      element.style.position = 'absolute';
      element.style.boxSizing = 'border-box';
      element.style.userSelect = 'none';
      element.style.pointerEvents = 'auto';
      
      // Type-specific defaults
      this.applyTypeDefaults(element, type, style);
    }
    
    static applyTypeDefaults(element, type, style) {
      // Button defaults
      if (type.includes('button')) {
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.cursor = 'pointer';
        element.style.fontWeight = style.fontWeight || '600';
        element.style.borderRadius = style.borderRadius || '12px';
        element.style.padding = style.padding || '12px 24px';
        element.style.border = style.border || 'none';
        
        // Gradient voor buttons als geen background is
        if (!style.backgroundColor && !style.backgroundImage) {
          element.style.background = 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)';
          element.style.color = style.color || 'white';
          element.style.boxShadow = style.boxShadow || '0 4px 16px rgba(99, 102, 241, 0.25)';
        }
      }
      
      // Input defaults
      if (type.includes('input')) {
        element.style.borderRadius = style.borderRadius || '10px';
        element.style.border = style.border || '1.5px solid #e2e8f0';
        element.style.padding = style.padding || '0 14px';
        element.style.background = style.backgroundColor || 'white';
        element.style.color = style.color || '#1e293b';
      }
      
      // Text defaults
      if (type.includes('text')) {
        element.style.lineHeight = style.lineHeight || '1.5';
        element.style.wordWrap = 'break-word';
        element.style.whiteSpace = 'pre-wrap';
      }
      
      // Container defaults
      if (type.includes('container') || type.includes('card')) {
        element.style.borderRadius = style.borderRadius || '20px';
        element.style.padding = style.padding || '24px';
        element.style.background = style.backgroundColor || 'rgba(255, 255, 255, 0.95)';
        element.style.backdropFilter = style.backdropFilter || 'blur(10px)';
      }
    }
  }

  class RenderEngine {
    constructor(stateManager, eventBus) {
      this.stateManager = stateManager;
      this.eventBus = eventBus;
      this.phoneScreen = document.getElementById("phoneScreen");
      this.canvasWrapper = document.getElementById("canvasWrapper");
      this.gridOverlay = document.getElementById("gridOverlay");
      this.currentState = null;
      
      // Zorg voor lichte iPhone
      this.initPhoneScreen();
    }

    initPhoneScreen() {
      if (this.phoneScreen) {
        this.phoneScreen.style.background = 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)';
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

      // Clear old elements
      this.clearCanvas();
      
      // Render all components
      const comps = activeScreen.components || [];
      const elementMap = new Map();
      
      // Create elements
      comps.forEach(comp => {
        const el = this.createElement(comp, project);
        elementMap.set(comp.id, { comp, el });
      });
      
      // Build hierarchy
      comps.forEach(comp => {
        const record = elementMap.get(comp.id);
        if (!record) return;
        
        if (comp.parentId && elementMap.has(comp.parentId)) {
          const parentRecord = elementMap.get(comp.parentId);
          parentRecord.el.appendChild(record.el);
        } else {
          this.phoneScreen.appendChild(record.el);
        }
      });
      
      this.setupInteractions();
    }
    
    clearCanvas() {
      this.phoneScreen.querySelectorAll(".canvas-element").forEach(el => el.remove());
    }
    
    createElement(comp, project) {
      const el = document.createElement("div");
      el.className = "canvas-element pop-in";
      el.dataset.id = comp.id;
      el.dataset.type = comp.type;
      
      // Selected state
      if (project.selectedElementId === comp.id) {
        el.classList.add("selected");
      }
      
      // Position and size
      el.style.left = comp.x + "px";
      el.style.top = comp.y + "px";
      el.style.width = comp.width + "px";
      el.style.height = comp.height + "px";
      
      // Apply styles
      const props = comp.props || {};
      const style = props.style || {};
      StyleEngine.applyStyles(el, comp.type, style);
      
      // Set content
      this.setElementContent(el, comp.type, props);
      
      // Add type class
      this.addTypeClass(el, comp.type);
      
      // Add UI chrome
      this.addUIChrome(el, comp);
      
      // Add event listeners
      this.addEventListeners(el, comp);
      
      return el;
    }
    
    setElementContent(el, type, props) {
      if (type.includes('text')) {
        el.textContent = props.text || "Text";
      } else if (type.includes('button')) {
        el.textContent = props.label || "Button";
      } else if (type.includes('input')) {
        el.placeholder = props.placeholder || "Enter text...";
      } else if (type === 'image') {
        const img = document.createElement("img");
        img.className = "image-content";
        img.src = props.src || "";
        img.alt = props.alt || "Image";
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "cover";
        el.appendChild(img);
      } else if (type.includes('container')) {
        const title = document.createElement("div");
        title.className = "container-title";
        title.textContent = props.label || "Container";
        el.appendChild(title);
      }
    }
    
    addTypeClass(el, type) {
      if (type.includes('text')) el.classList.add('element-text');
      if (type.includes('button')) el.classList.add('element-button');
      if (type.includes('input')) el.classList.add('element-input');
      if (type === 'image') el.classList.add('element-image');
      if (type.includes('container') || type.includes('card')) {
        el.classList.add('element-container');
      }
      if (type.includes('badge')) el.classList.add('element-badge');
      if (type.includes('navbar')) el.classList.add('element-navbar');
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
    
    addEventListeners(el, comp) {
      // Click to select
      el.addEventListener("pointerdown", (e) => {
        if (e.target.closest(".resize-handle") || e.target.closest(".element-actions")) {
          return;
        }
        e.stopPropagation();
        this.selectElement(comp.id);
      });
      
      // Double-click to edit
      el.addEventListener("dblclick", (e) => {
        e.stopPropagation();
        this.editElementText(comp);
      });
      
      // Remove pop-in animation
      el.addEventListener("animationend", () => {
        el.classList.remove("pop-in");
      });
    }
    
    // ... (rest van je bestaande methods: selectElement, deleteElement, duplicateElement, etc.)
    // Laat deze methods intact zoals ze waren
    
    setupInteractions() {
      if (!this.phoneScreen) return;
      
      this.phoneScreen.querySelectorAll(".canvas-element").forEach(el => {
        el.onpointerdown = (e) => {
          if (e.target.closest(".resize-handle") || e.target.closest(".element-actions")) {
            return;
          }
          const id = el.dataset.id;
          if (!id) return;
          this.handlePointerDown(e, id);
        };
      });
    }
    
    handlePointerDown(e, elementId) {
      // ... (jouw bestaande drag logic)
      // Hou deze hetzelfde
    }
    
    startResize(e, elementId) {
      // ... (jouw bestaande resize logic)
      // Hou deze hetzelfde
    }
    
    editElementText(comp) {
      const props = comp.props || {};
      let current = "";
      
      if (comp.type.includes('text')) current = props.text || "";
      else if (comp.type.includes('button')) current = props.label || "";
      else if (comp.type.includes('input')) current = props.placeholder || "";
      else if (comp.type.includes('container')) current = props.label || "";
      
      const next = window.prompt("Edit text:", current);
      if (next === null) return;
      
      this.stateManager.setState((prev) => {
        const proj = prev.project;
        const screens = proj.screens.map((s) => {
          if (s.id !== proj.activeScreenId) return s;
          const comps = s.components.map((c) => {
            if (c.id !== comp.id) return c;
            const newProps = { ...(c.props || {}) };
            
            if (c.type.includes('text')) newProps.text = next;
            else if (c.type.includes('button')) newProps.label = next;
            else if (c.type.includes('input')) newProps.placeholder = next;
            else if (c.type.includes('container')) newProps.label = next;
            
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
          const newId = "elem_" + Date.now() + "_" + Math.random().toString(36).slice(2);
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
  window.StyleEngine = StyleEngine; // Export voor properties panel
})();