// scripts/core/RenderEngine.js - FIXED VERSION
// Fixed: removeEventListeners bug & removed duplicate snapToGrid

(function () {
  // Geavanceerde styling engine
  class StyleEngine {
    static applyAllStyles(element, type, style = {}) {
      if (!element) return;
      
      // Reset element
      element.style.cssText = '';
      
      // Typography
      this.applyTypography(element, style);
      
      // Colors
      this.applyColors(element, style);
      
      // Background
      this.applyBackground(element, style);
      
      // Border
      this.applyBorder(element, style);
      
      // Layout
      this.applyLayout(element, style);
      
      // Spacing
      this.applySpacing(element, style);
      
      // Effects
      this.applyEffects(element, style);
      
      // Position (absolute for canvas elements)
      element.style.position = 'absolute';
      element.style.boxSizing = 'border-box';
      element.style.userSelect = 'none';
      element.style.pointerEvents = 'auto';
      element.style.outline = 'none';
      
      // Type-specific defaults
      this.applyTypeDefaults(element, type, style);
    }
    
    static applyTypography(element, style) {
      if (style.fontFamily) element.style.fontFamily = style.fontFamily;
      if (style.fontSize) element.style.fontSize = this.parseSize(style.fontSize);
      if (style.fontWeight) element.style.fontWeight = style.fontWeight;
      if (style.lineHeight) element.style.lineHeight = style.lineHeight;
      if (style.letterSpacing) element.style.letterSpacing = this.parseSize(style.letterSpacing);
      if (style.textAlign) element.style.textAlign = style.textAlign;
      if (style.textTransform) element.style.textTransform = style.textTransform;
      if (style.fontStyle) element.style.fontStyle = style.fontStyle;
      if (style.textDecoration) element.style.textDecoration = style.textDecoration;
      if (style.textShadow) element.style.textShadow = style.textShadow;
    }
    
    static applyColors(element, style) {
      if (style.color) element.style.color = style.color;
      if (style.backgroundColor) element.style.backgroundColor = style.backgroundColor;
      if (style.opacity !== undefined) element.style.opacity = style.opacity;
    }
    
    static applyBackground(element, style) {
      if (style.background) element.style.background = style.background;
      if (style.backgroundImage) element.style.backgroundImage = style.backgroundImage;
      if (style.backgroundSize) element.style.backgroundSize = style.backgroundSize;
      if (style.backgroundPosition) element.style.backgroundPosition = style.backgroundPosition;
    }
    
    static applyBorder(element, style) {
      if (style.border) element.style.border = style.border;
      if (style.borderWidth) element.style.borderWidth = this.parseSize(style.borderWidth);
      if (style.borderColor) element.style.borderColor = style.borderColor;
      if (style.borderStyle) element.style.borderStyle = style.borderStyle;
      if (style.borderRadius !== undefined) {
        element.style.borderRadius = this.parseSize(style.borderRadius);
      }
    }
    
    static applyLayout(element, style) {
      if (style.display) element.style.display = style.display;
      if (style.flexDirection) element.style.flexDirection = style.flexDirection;
      if (style.justifyContent) element.style.justifyContent = style.justifyContent;
      if (style.alignItems) element.style.alignItems = style.alignItems;
      if (style.alignContent) element.style.alignContent = style.alignContent;
      if (style.gap) element.style.gap = this.parseSize(style.gap);
      if (style.overflow) element.style.overflow = style.overflow;
      if (style.cursor) element.style.cursor = style.cursor;
    }
    
    static applySpacing(element, style) {
      if (style.width) element.style.width = this.parseSize(style.width);
      if (style.height) element.style.height = this.parseSize(style.height);
      if (style.padding) element.style.padding = this.parseSize(style.padding);
      if (style.margin) element.style.margin = this.parseSize(style.margin);
    }
    
    static applyEffects(element, style) {
      if (style.boxShadow) element.style.boxShadow = style.boxShadow;
      if (style.filter) element.style.filter = style.filter;
      if (style.backdropFilter) element.style.backdropFilter = style.backdropFilter;
      if (style.transform) element.style.transform = style.transform;
      if (style.transition) element.style.transition = style.transition;
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
        element.style.transition = 'all 0.2s ease';
        
        // Default gradient if no background specified
        if (!style.backgroundColor && !style.background && !style.backgroundImage) {
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
        element.style.fontSize = style.fontSize || '15px';
        element.style.transition = 'border-color 0.2s ease, box-shadow 0.2s ease';
      }
      
      // Text defaults
      if (type.includes('text')) {
        element.style.lineHeight = style.lineHeight || '1.5';
        element.style.wordWrap = 'break-word';
        element.style.whiteSpace = 'pre-wrap';
        element.style.background = 'transparent';
        element.style.border = 'none';
        element.style.boxShadow = 'none';
      }
      
      // Container defaults
      if (type.includes('container') || type.includes('card')) {
        element.style.borderRadius = style.borderRadius || '20px';
        element.style.padding = style.padding || '24px';
        element.style.background = style.backgroundColor || 'rgba(255, 255, 255, 0.95)';
        element.style.backdropFilter = style.backdropFilter || 'blur(10px)';
        element.style.border = style.border || '1px solid rgba(0, 0, 0, 0.05)';
      }
      
      // Image defaults
      if (type === 'image') {
        element.style.overflow = 'hidden';
      }
    }
    
    static parseSize(value) {
      if (typeof value === 'number') {
        return value + 'px';
      }
      return value;
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
      
      this.initPhoneScreen();
    }

    initPhoneScreen() {
      if (this.phoneScreen) {
        this.phoneScreen.style.background = 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 40%, #e2e8f0 100%)';
      }
    }

    setState(state) {
      this.currentState = state;
      this.render();
    }

    render() {
      if (!this.phoneScreen || !this.currentState) return;

      const project = this.currentState.project;
      const activeScreen = project.screens.find(s => s.id === project.activeScreenId);
      if (!activeScreen) return;

      this.clearCanvas();
      
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
      const elements = this.phoneScreen.querySelectorAll(".canvas-element");
      elements.forEach(el => {
        // Remove event listeners first
        const newEl = el.cloneNode(false);
        el.parentNode.replaceChild(newEl, el);
      });
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
      
      // Apply ALL styles
      const props = comp.props || {};
      const style = props.style || {};
      StyleEngine.applyAllStyles(el, comp.type, style);
      
      // Set content
      this.setElementContent(el, comp.type, props);
      
      // Add type class
      this.addTypeClass(el, comp.type);
      
      // Add UI chrome
      this.addUIChrome(el, comp);
      
      // Add event listeners DIRECTLY (no cloning)
      this.addEventListenersDirect(el, comp);
      
      return el;
    }
    
    setElementContent(el, type, props) {
      // Clear existing content (except UI chrome)
      const uiChrome = el.querySelector('.element-actions, .resize-handle');
      el.innerHTML = '';
      if (uiChrome) el.appendChild(uiChrome);
      
      if (type.includes('text')) {
        el.textContent = props.text || "Text";
      } else if (type.includes('button')) {
        el.textContent = props.label || "Button";
      } else if (type.includes('input')) {
        el.placeholder = props.placeholder || "Enter text...";
        el.contentEditable = false;
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
      } else {
        el.textContent = props.text || props.label || type;
      }
    }
    
    addTypeClass(el, type) {
      // Remove all type classes
      const classesToRemove = [
        'element-text', 'element-button', 'element-input', 
        'element-image', 'element-container', 'element-badge', 'element-navbar'
      ];
      classesToRemove.forEach(cls => el.classList.remove(cls));
      
      // Add appropriate class
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
      // Remove existing chrome
      const existingChrome = el.querySelector('.element-actions, .resize-handle');
      if (existingChrome) existingChrome.remove();
      
      // Actions bar
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
      
      // Resize handle
      const resizeHandle = document.createElement("div");
      resizeHandle.className = "resize-handle se";
      resizeHandle.addEventListener("pointerdown", (e) => this.startResize(e, comp.id));
      el.appendChild(resizeHandle);
    }
    
    addEventListenersDirect(el, comp) {
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

      const elementEl = this.phoneScreen.querySelector(`.canvas-element[data-id="${elementId}"]`);
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

        // Use global snapToGrid or local helper
        let newX = this.snapToGrid(initialX + dx);
        let newY = this.snapToGrid(initialY + dy);

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
        let finalX = this.snapToGrid(initialX + dx);
        let finalY = this.snapToGrid(initialY + dy);

        if (elementEl) {
          elementEl.classList.remove("dragging");
          elementEl.style.zIndex = "";
          elementEl.style.transform = "";
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

      const elementEl = this.phoneScreen.querySelector(`.canvas-element[data-id="${elementId}"]`);
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
    
    editElementText(comp) {
      const props = comp.props || {};
      let current = "";
      
      if (comp.type.includes('text')) current = props.text || "";
      else if (comp.type.includes('button')) current = props.label || "";
      else if (comp.type.includes('input')) current = props.placeholder || "";
      else if (comp.type.includes('container')) current = props.label || "";
      else if (comp.type === 'image') current = props.alt || "";
      
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
            else if (c.type === 'image') newProps.alt = next;
            
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
    
    // Helper function for snapping
    snapToGrid(value) {
      const GRID_SIZE = 8;
      return Math.round(value / GRID_SIZE) * GRID_SIZE;
    }
  }

  window.RenderEngine = RenderEngine;
  window.StyleEngine = StyleEngine;
})();