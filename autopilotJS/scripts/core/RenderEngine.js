// scripts/core/RenderEngine.js - SIGMA EDITION
// Complete styling engine met ALLE CSS properties

(function () {
  const GRID_SIZE = 8;

  function snapToGrid(value) {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  }

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
      if (style.letterSpacing) element.style.letterSpacing = this.parseSize(letterSpacing);
      if (style.textAlign) element.style.textAlign = style.textAlign;
      if (style.textTransform) element.style.textTransform = style.textTransform;
      if (style.fontStyle) element.style.fontStyle = style.fontStyle;
      if (style.textDecoration) element.style.textDecoration = style.textDecoration;
      if (style.textShadow) element.style.textShadow = style.textShadow;
      if (style.whiteSpace) element.style.whiteSpace = style.whiteSpace;
      if (style.wordBreak) element.style.wordBreak = style.wordBreak;
      if (style.wordWrap) element.style.wordWrap = style.wordWrap;
    }
    
    static applyColors(element, style) {
      if (style.color) element.style.color = style.color;
      if (style.backgroundColor) element.style.backgroundColor = style.backgroundColor;
      if (style.opacity !== undefined) element.style.opacity = style.opacity;
      if (style.fill) element.style.fill = style.fill;
      if (style.stroke) element.style.stroke = style.stroke;
    }
    
    static applyBackground(element, style) {
      if (style.background) element.style.background = style.background;
      if (style.backgroundImage) element.style.backgroundImage = style.backgroundImage;
      if (style.backgroundSize) element.style.backgroundSize = style.backgroundSize;
      if (style.backgroundPosition) element.style.backgroundPosition = style.backgroundPosition;
      if (style.backgroundRepeat) element.style.backgroundRepeat = style.backgroundRepeat;
      if (style.backgroundClip) element.style.backgroundClip = style.backgroundClip;
      if (style.backgroundBlendMode) element.style.backgroundBlendMode = style.backgroundBlendMode;
      if (style.backgroundAttachment) element.style.backgroundAttachment = style.backgroundAttachment;
      if (style.backgroundOrigin) element.style.backgroundOrigin = style.backgroundOrigin;
    }
    
    static applyBorder(element, style) {
      if (style.border) element.style.border = style.border;
      if (style.borderWidth) element.style.borderWidth = this.parseSize(style.borderWidth);
      if (style.borderColor) element.style.borderColor = style.borderColor;
      if (style.borderStyle) element.style.borderStyle = style.borderStyle;
      if (style.borderRadius !== undefined) {
        element.style.borderRadius = this.parseSize(style.borderRadius);
      }
      if (style.borderTop) element.style.borderTop = style.borderTop;
      if (style.borderRight) element.style.borderRight = style.borderRight;
      if (style.borderBottom) element.style.borderBottom = style.borderBottom;
      if (style.borderLeft) element.style.borderLeft = style.borderLeft;
      if (style.borderCollapse) element.style.borderCollapse = style.borderCollapse;
      if (style.borderSpacing) element.style.borderSpacing = style.borderSpacing;
      if (style.outline) element.style.outline = style.outline;
      if (style.outlineOffset) element.style.outlineOffset = this.parseSize(style.outlineOffset);
    }
    
    static applyLayout(element, style) {
      if (style.display) element.style.display = style.display;
      if (style.position) element.style.position = style.position;
      if (style.flex) element.style.flex = style.flex;
      if (style.flexDirection) element.style.flexDirection = style.flexDirection;
      if (style.flexWrap) element.style.flexWrap = style.flexWrap;
      if (style.justifyContent) element.style.justifyContent = style.justifyContent;
      if (style.alignItems) element.style.alignItems = style.alignItems;
      if (style.alignContent) element.style.alignContent = style.alignContent;
      if (style.alignSelf) element.style.alignSelf = style.alignSelf;
      if (style.flexGrow) element.style.flexGrow = style.flexGrow;
      if (style.flexShrink) element.style.flexShrink = style.flexShrink;
      if (style.flexBasis) element.style.flexBasis = style.flexBasis;
      if (style.order) element.style.order = style.order;
      if (style.grid) element.style.grid = style.grid;
      if (style.gridTemplateColumns) element.style.gridTemplateColumns = style.gridTemplateColumns;
      if (style.gridTemplateRows) element.style.gridTemplateRows = style.gridTemplateRows;
      if (style.gridTemplateAreas) element.style.gridTemplateAreas = style.gridTemplateAreas;
      if (style.gridArea) element.style.gridArea = style.gridArea;
      if (style.gridColumn) element.style.gridColumn = style.gridColumn;
      if (style.gridRow) element.style.gridRow = style.gridRow;
      if (style.overflow) element.style.overflow = style.overflow;
      if (style.overflowX) element.style.overflowX = style.overflowX;
      if (style.overflowY) element.style.overflowY = style.overflowY;
      if (style.visibility) element.style.visibility = style.visibility;
      if (style.zIndex) element.style.zIndex = style.zIndex;
      if (style.float) element.style.float = style.float;
      if (style.clear) element.style.clear = style.clear;
      if (style.isolation) element.style.isolation = style.isolation;
      if (style.objectFit) element.style.objectFit = style.objectFit;
      if (style.objectPosition) element.style.objectPosition = style.objectPosition;
      if (style.resize) element.style.resize = style.resize;
      if (style.cursor) element.style.cursor = style.cursor;
      if (style.pointerEvents) element.style.pointerEvents = style.pointerEvents;
      if (style.userSelect) element.style.userSelect = style.userSelect;
    }
    
    static applySpacing(element, style) {
      if (style.width) element.style.width = this.parseSize(style.width);
      if (style.height) element.style.height = this.parseSize(style.height);
      if (style.minWidth) element.style.minWidth = this.parseSize(style.minWidth);
      if (style.minHeight) element.style.minHeight = this.parseSize(style.minHeight);
      if (style.maxWidth) element.style.maxWidth = this.parseSize(style.maxWidth);
      if (style.maxHeight) element.style.maxHeight = this.parseSize(style.maxHeight);
      if (style.padding) element.style.padding = this.parseSize(style.padding);
      if (style.paddingTop) element.style.paddingTop = this.parseSize(style.paddingTop);
      if (style.paddingRight) element.style.paddingRight = this.parseSize(style.paddingRight);
      if (style.paddingBottom) element.style.paddingBottom = this.parseSize(style.paddingBottom);
      if (style.paddingLeft) element.style.paddingLeft = this.parseSize(style.paddingLeft);
      if (style.margin) element.style.margin = this.parseSize(style.margin);
      if (style.marginTop) element.style.marginTop = this.parseSize(style.marginTop);
      if (style.marginRight) element.style.marginRight = this.parseSize(style.marginRight);
      if (style.marginBottom) element.style.marginBottom = this.parseSize(style.marginBottom);
      if (style.marginLeft) element.style.marginLeft = this.parseSize(style.marginLeft);
      if (style.gap) element.style.gap = this.parseSize(style.gap);
      if (style.rowGap) element.style.rowGap = this.parseSize(style.rowGap);
      if (style.columnGap) element.style.columnGap = this.parseSize(style.columnGap);
    }
    
    static applyEffects(element, style) {
      if (style.boxShadow) element.style.boxShadow = style.boxShadow;
      if (style.filter) element.style.filter = style.filter;
      if (style.backdropFilter) element.style.backdropFilter = style.backdropFilter;
      if (style.mixBlendMode) element.style.mixBlendMode = style.mixBlendMode;
      if (style.blendMode) element.style.blendMode = style.blendMode;
      if (style.clipPath) element.style.clipPath = style.clipPath;
      if (style.mask) element.style.mask = style.mask;
      if (style.maskImage) element.style.maskImage = style.maskImage;
      if (style.transform) element.style.transform = style.transform;
      if (style.transformOrigin) element.style.transformOrigin = style.transformOrigin;
      if (style.transformStyle) element.style.transformStyle = style.transformStyle;
      if (style.perspective) element.style.perspective = style.perspective;
      if (style.perspectiveOrigin) element.style.perspectiveOrigin = style.perspectiveOrigin;
      if (style.transition) element.style.transition = style.transition;
      if (style.animation) element.style.animation = style.animation;
      if (style.animationDelay) element.style.animationDelay = style.animationDelay;
      if (style.animationDirection) element.style.animationDirection = style.animationDirection;
      if (style.animationDuration) element.style.animationDuration = style.animationDuration;
      if (style.animationFillMode) element.style.animationFillMode = style.animationFillMode;
      if (style.animationIterationCount) element.style.animationIterationCount = style.animationIterationCount;
      if (style.animationName) element.style.animationName = style.animationName;
      if (style.animationPlayState) element.style.animationPlayState = style.animationPlayState;
      if (style.animationTimingFunction) element.style.animationTimingFunction = style.animationTimingFunction;
      if (style.willChange) element.style.willChange = style.willChange;
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
        element.style.objectFit = style.objectFit || 'cover';
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
      
      // Add event listeners
      this.addEventListeners(el, comp);
      
      return el;
    }
    
    setElementContent(el, type, props) {
      // Clear existing content
      el.innerHTML = '';
      
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
      el.classList.remove(
        'element-text', 'element-button', 'element-input', 
        'element-image', 'element-container', 'element-badge', 'element-navbar'
      );
      
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
    
    addEventListeners(el, comp) {
      // Remove existing listeners
      const newEl = el.cloneNode(true);
      el.parentNode.replaceChild(newEl, el);
      
      const newComp = comp;
      
      // Click to select
      newEl.addEventListener("pointerdown", (e) => {
        if (e.target.closest(".resize-handle") || e.target.closest(".element-actions")) {
          return;
        }
        e.stopPropagation();
        this.selectElement(newComp.id);
      });
      
      // Double-click to edit
      newEl.addEventListener("dblclick", (e) => {
        e.stopPropagation();
        this.editElementText(newComp);
      });
      
      // Remove pop-in animation
      newEl.addEventListener("animationend", () => {
        newEl.classList.remove("pop-in");
      });
      
      return newEl;
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
  }

  window.RenderEngine = RenderEngine;
  window.StyleEngine = StyleEngine;
})();