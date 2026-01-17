// scripts/main.js

document.addEventListener("DOMContentLoaded", () => {
  const state = window.StateManager;
  const eventBus = window.EventSystem || window.EventBus || { on: () => {}, emit: () => {} };
  const renderer = new window.RenderEngine(state, eventBus);

  runIntro();

  /* ================== DOM REFS ================== */

  // links
  const componentsList       = document.getElementById("componentsList");
  const categoryButtons      = document.querySelectorAll(".category");

  // top bar
  const projectNameInput     = document.getElementById("projectName");
  const viewportSelect       = document.getElementById("viewportSelect");
  const orientationToggleBtn = document.getElementById("orientationToggleBtn");
  const zoomSlider           = document.getElementById("zoomSlider");
  const zoomValue            = document.getElementById("zoomValue");
  const gridToggleBtn        = document.getElementById("gridToggleBtn");

  // canvas
  const phoneFrame           = document.getElementById("phoneFrame");
  const phoneScreen          = document.getElementById("phoneScreen");
  const canvasWrapper        = document.getElementById("canvasWrapper");
  const gridOverlay          = document.getElementById("gridOverlay");

  const screenTabs           = document.getElementById("screenTabs");
  const addScreenBtn         = document.getElementById("addScreenBtn");

  const cursorPositionLabel  = document.getElementById("cursorPosition");
  const selectedElementLabel = document.getElementById("selectedElement");

  // rechter sidebar
  const rightSidebarTabs     = document.querySelectorAll(".right-sidebar .sidebar-tab");
  const propertiesTab        = document.getElementById("propertiesTab");
  const assetsTab            = document.getElementById("assetsTab");

  const propertiesBody       = document.getElementById("propertiesBody");
  const elementTypeLabel     = document.getElementById("elementType");

  const uploadAssetBtn       = document.getElementById("uploadAssetBtn");
  const assetsGrid           = document.getElementById("assetsGrid");

  const rotateSound          = document.getElementById("rotateSound");

  /* ================== STATE VOOR UI ================== */

  const GRID_SIZE = 8;
  let isGridVisible = true;
  let isLandscape   = false;

  let dragGhost   = null;
  let dragType    = null;
  let dragAssetId = null;
  let assetFileInput = null;

  /* ================== INTRO ================== */

  function runIntro() {
    const overlay = document.getElementById("introOverlay");
    const app     = document.getElementById("appContainer");
    const nav     = document.getElementById("topNav");

    if (!overlay || !app || !nav) return;

    app.classList.add("app-hidden");
    nav.classList.add("app-hidden");

    setTimeout(() => {
      overlay.classList.add("hidden");
      app.classList.remove("app-hidden");
      nav.classList.remove("app-hidden");
    }, 1200);

    setTimeout(() => {
      if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 2000);
  }

  /* ================== HELPERS ================== */

  function snapToGrid(value) {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  }

  function escapeHtml(str) {
    return (str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function fontOption(value, label, current) {
    const selected = current === value ? "selected" : "";
    return `<option value="${value.replace(/"/g, "&quot;")}" ${selected}>${label}</option>`;
  }

  /* ================== INIT COMPONENT SIDEBAR ================== */

  if (window.ComponentsModule && window.ComponentsModule.renderSidebar) {
    window.ComponentsModule.renderSidebar("basic");
  }

  categoryButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      categoryButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const cat = btn.dataset.category;
      if (window.ComponentsModule && window.ComponentsModule.renderSidebar) {
        window.ComponentsModule.renderSidebar(cat);
      }
    });
  });

  /* ================== STATE SUBSCRIBE ================== */

  state.subscribe((s) => {
    renderer.setState(s);
    renderer.setZoom(s.project.zoom || 1);
    renderer.setGridVisible(isGridVisible);
    updateStatusBar(s);
    renderPropertiesPanel(s);
    renderAssetsPanel(s);
    renderScreenTabs(s);
  });

  renderer.setZoom(1);
  if (phoneFrame) phoneFrame.classList.add("portrait");

  /* ================== KEYBOARD DELETE ================== */

  document.addEventListener("keydown", (e) => {
    const active = document.activeElement;
    const isTyping =
      active &&
      (active.tagName === "INPUT" ||
        active.tagName === "TEXTAREA" ||
        active.tagName === "SELECT" ||
        active.isContentEditable);

    if (isTyping) return;

    const s = state.getState();
    const selectedId = s.project.selectedElementId;
    if (!selectedId) return;

    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      state.setState((prev) => {
        const proj = prev.project;
        const screens = proj.screens.map((scr) => {
          if (scr.id !== proj.activeScreenId) return scr;

          const idsToRemove = new Set([selectedId]);
          (scr.components || []).forEach((c) => {
            if (c.parentId === selectedId) idsToRemove.add(c.id);
          });

          return {
            ...scr,
            components: scr.components.filter((c) => !idsToRemove.has(c.id))
          };
        });
        return {
          project: {
            ...proj,
            screens,
            selectedElementId: null
          }
        };
      });
    }
  });

  /* ================== COMPONENT DRAG VANUIT SIDEBAR ================== */

  if (componentsList) {
    componentsList.addEventListener("pointerdown", (e) => {
      const item = e.target.closest(".component-item");
      if (!item) return;

      e.preventDefault();

      dragType = item.dataset.type;
      dragAssetId = null;
      if (!dragType) return;

      const nameEl = item.querySelector(".component-name");
      const label  = nameEl ? nameEl.textContent.trim() : dragType;

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

        // PATTERNS
        if (dragType.startsWith("pattern-")) {
          handlePatternDrop(dragType);
          dragType = null;
          return;
        }

        if (!window.ComponentsModule || !window.ComponentsModule.createInstance) {
          dragType = null;
          return;
        }

        const rect = phoneScreen.getBoundingClientRect();
        const x = upEvent.clientX;
        const y = upEvent.clientY;

        const inside =
          x >= rect.left &&
          x <= rect.right &&
          y >= rect.top &&
          y <= rect.bottom;

        if (inside) {
          const instance = window.ComponentsModule.createInstance(dragType);
          if (instance) {
            const insideX = x - rect.left;
            const insideY = y - rect.top;
            instance.x = snapToGrid(insideX - instance.width / 2);
            instance.y = snapToGrid(insideY - instance.height / 2);

            state.setState((prev) => {
              const proj = prev.project;
              const screens = proj.screens.map((s) => {
                if (s.id !== proj.activeScreenId) return s;
                return {
                  ...s,
                  components: [...s.components, instance]
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

            eventBus.emit("element:added", {
              id: instance.id,
              type: dragType
            });
          }
        }

        dragType = null;
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    });
  }

  function moveGhost(x, y) {
    if (!dragGhost) return;
    dragGhost.style.left = x + 12 + "px";
    dragGhost.style.top  = y + 12 + "px";
  }

  /* ================== PATTERN: LOGIN CARD ================== */

  function createLoginPattern(screenRect) {
    const instanceId = () =>
      "elem_" + Date.now() + "_" + Math.random().toString(36).slice(2);

    const cardWidth  = 340;
    const cardHeight = 260;

    const centerX = screenRect.width  / 2;
    const centerY = screenRect.height / 2;

    const cardX = snapToGrid(centerX - cardWidth  / 2);
    const cardY = snapToGrid(centerY - cardHeight / 2);

    const cardId     = instanceId();
    const titleId    = instanceId();
    const subtitleId = instanceId();
    const buttonId   = instanceId();

    const card = {
      id: cardId,
      type: "container",
      x: cardX,
      y: cardY,
      width: cardWidth,
      height: cardHeight,
      parentId: null,
      props: {
        label: "Welcome back",
        style: {
          backgroundColor: "rgba(15,23,42,0.96)",
          textColor: "#e5e7eb",
          fontSize: 18,
          fontFamily:
            "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          borderRadius: 28,
          elevation: 2
        }
      }
    };

    const title = {
      id: titleId,
      type: "text",
      x: snapToGrid(24),
      y: snapToGrid(52),
      width: 260,
      height: 28,
      parentId: cardId,
      props: {
        text: "Sign in to continue",
        style: {
          textColor: "#f9fafb",
          fontSize: 18,
          fontFamily:
            "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif",
          borderRadius: 0,
          elevation: 0
        }
      }
    };

    const subtitle = {
      id: subtitleId,
      type: "text",
      x: snapToGrid(24),
      y: snapToGrid(84),
      width: 280,
      height: 40,
      parentId: cardId,
      props: {
        text: "Enter your details below to access your dashboard.",
        style: {
          textColor: "#9ca3af",
          fontSize: 13,
          fontFamily:
            "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif",
          borderRadius: 0,
          elevation: 0
        }
      }
    };

    const button = {
      id: buttonId,
      type: "button",
      x: snapToGrid(40),
      y: snapToGrid(160),
      width: 260,
      height: 42,
      parentId: cardId,
      props: {
        label: "Continue",
        style: {
          backgroundColor: "#2563eb",
          textColor: "#f9fafb",
          fontSize: 15,
          fontFamily:
            "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif",
          borderRadius: 999,
          elevation: 2
        }
      }
    };

    return [card, title, subtitle, button];
  }

  function handlePatternDrop(patternType) {
    if (!phoneScreen) return;
    const rect = phoneScreen.getBoundingClientRect();
    const screenRect = { width: rect.width, height: rect.height };

    let newComps = [];

    if (patternType === "pattern-login") {
      newComps = createLoginPattern(screenRect);
    }

    if (!newComps.length) return;

    state.setState((prev) => {
      const proj = prev.project;
      const screens = proj.screens.map((s) => {
        if (s.id !== proj.activeScreenId) return s;
        return {
          ...s,
          components: [...s.components, ...newComps]
        };
      });

      return {
        project: {
          ...proj,
          screens,
          selectedElementId: newComps[0].id
        }
      };
    });
  }

  /* ================== PROJECT NAME ================== */

  if (projectNameInput) {
    projectNameInput.addEventListener("input", () => {
      const val = projectNameInput.value || "Untitled Project";
      state.setState((prev) => ({
        project: {
          ...prev.project,
          name: val
        }
      }));
    });
  }

  /* ================== VIEWPORT & ORIENTATION ================== */

  if (viewportSelect && phoneFrame && phoneScreen) {
    viewportSelect.addEventListener("change", () => {
      const value = viewportSelect.value;
      applyViewport(value, phoneFrame, phoneScreen);
      state.setState((prev) => ({
        project: {
          ...prev.project,
          viewport: value
        }
      }));
    });

    applyViewport(viewportSelect.value, phoneFrame, phoneScreen);
  }

  function applyViewport(value, frame, screen) {
    if (!frame || !screen) return;

    if (value === "mobile") {
      frame.style.width  = "410px";
      frame.style.height = "864px";
      screen.style.width  = "390px";
      screen.style.height = "844px";
    } else if (value === "tablet") {
      frame.style.width  = "820px";
      frame.style.height = "1180px";
      screen.style.width  = "800px";
      screen.style.height = "1160px";
    } else if (value === "desktop") {
      frame.style.width  = "1280px";
      frame.style.height = "780px";
      screen.style.width  = "1260px";
      screen.style.height = "760px";
    } else {
      frame.style.width  = "540px";
      frame.style.height = "960px";
      screen.style.width  = "520px";
      screen.style.height = "940px";
    }
  }

  if (orientationToggleBtn && phoneFrame) {
    orientationToggleBtn.addEventListener("click", () => {
      isLandscape = !isLandscape;

      if (isLandscape) {
        phoneFrame.classList.remove("portrait");
        phoneFrame.classList.add("landscape");
      } else {
        phoneFrame.classList.remove("landscape");
        phoneFrame.classList.add("portrait");
      }

      if (rotateSound) {
        rotateSound.currentTime = 0;
        rotateSound.play().catch(() => {});
      }
    });
  }

  /* ================== ZOOM & GRID ================== */

  if (zoomSlider && zoomValue) {
    const updateZoom = () => {
      const val = parseInt(zoomSlider.value, 10) || 100;
      const factor = val / 100;
      zoomValue.textContent = `${val}%`;
      state.setState((prev) => ({
        project: {
          ...prev.project,
          zoom: factor
        }
      }));
      renderer.setZoom(factor);
    };

    zoomSlider.addEventListener("input", updateZoom);
    updateZoom();
  }

  if (gridToggleBtn) {
    isGridVisible = true;
    renderer.setGridVisible(true);
    gridToggleBtn.classList.add("active");

    gridToggleBtn.addEventListener("click", () => {
      isGridVisible = !isGridVisible;
      renderer.setGridVisible(isGridVisible);
      gridToggleBtn.classList.toggle("active", isGridVisible);
    });
  }

  /* ================== CANVAS CLICK / MOUSE POS ================== */

  if (phoneScreen) {
    phoneScreen.addEventListener("click", (e) => {
      const clickedElement = e.target.closest(".canvas-element");
      if (clickedElement) return;

      state.setState((prev) => ({
        project: {
          ...prev.project,
          selectedElementId: null
        }
      }));
    });

    // dubbelklik -> snelle tekst-edit (prompt)
    phoneScreen.addEventListener("dblclick", (e) => {
      const el = e.target.closest(".canvas-element");
      if (!el) return;
      const id = el.dataset.id;
      if (!id) return;
      openQuickTextEditor(id);
    });

    phoneScreen.addEventListener("mousemove", (e) => {
      const rect = phoneScreen.getBoundingClientRect();
      const x = Math.round(e.clientX - rect.left);
      const y = Math.round(e.clientY - rect.top);
      if (cursorPositionLabel) {
        cursorPositionLabel.textContent = `X: ${x}, Y: ${y}`;
      }
    });
  }

  /* ================== SCREEN TABS ================== */

  function renderScreenTabs(s) {
    if (!screenTabs) return;
    const proj = s.project;
    screenTabs.innerHTML = "";

    proj.screens.forEach((scr) => {
      const tab = document.createElement("button");
      tab.className = "icon-btn";
      tab.dataset.id = scr.id;
      tab.innerHTML = `<i class="fas fa-square-full"></i>`;
      if (scr.id === proj.activeScreenId) {
        tab.classList.add("active");
      }
      tab.addEventListener("click", () => {
        state.setState((prev) => ({
          project: {
            ...prev.project,
            activeScreenId: scr.id,
            selectedElementId: null
          }
        }));
      });
      screenTabs.appendChild(tab);
    });
  }

  if (addScreenBtn) {
    addScreenBtn.addEventListener("click", () => {
      const newId = "screen_" + Date.now();
      state.setState((prev) => {
        const proj = prev.project;
        const newScreen = {
          id: newId,
          name: `Screen ${proj.screens.length + 1}`,
          components: []
        };
        return {
          project: {
            ...proj,
            screens: [...proj.screens, newScreen],
            activeScreenId: newId,
            selectedElementId: null
          }
        };
      });
    });
  }

  /* ================== RIGHT SIDEBAR TABS ================== */

  function initRightSidebarTabs() {
    if (!rightSidebarTabs.length) return;

    const showTab = (name) => {
      propertiesTab.style.display = name === "properties" ? "block" : "none";
      assetsTab.style.display     = name === "assets"     ? "block" : "none";
    };

    rightSidebarTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const target = tab.dataset.tab;
        if (!target) return;
        rightSidebarTabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        showTab(target);
      });
    });

    // default
    propertiesTab.style.display = "block";
    assetsTab.style.display     = "none";
  }

  initRightSidebarTabs();

  /* ================== STATUSBAR ================== */

  function updateStatusBar(s) {
    const proj = s.project;
    const screen = proj.screens.find((sc) => sc.id === proj.activeScreenId);
    const selectedId = proj.selectedElementId;
    let selectedText = "No selection";

    if (screen && selectedId) {
      const elem = screen.components.find((c) => c.id === selectedId);
      if (elem) {
        selectedText = `Selected: ${elem.type} (${elem.id.slice(0, 6)}...)`;
      }
    }

    if (selectedElementLabel) {
      selectedElementLabel.textContent = selectedText;
    }
  }

  /* ================== PROPERTIES PANEL ================== */

 /* ================== ADVANCED PROPERTIES PANEL (Sigma-style) ================== */

function renderPropertiesPanel(s) {
  if (!propertiesBody || !elementTypeLabel) return;

  const proj = s.project;
  const screen = proj.screens.find((sc) => sc.id === proj.activeScreenId);
  const selectedId = proj.selectedElementId;

  if (!screen || !selectedId) {
    elementTypeLabel.innerHTML = `<i class="fas fa-cube"></i> No selection`;
    propertiesBody.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-mouse-pointer"></i>
        <p>Select an element to edit its properties</p>
      </div>
    `;
    return;
  }

  const elem = screen.components.find((c) => c.id === selectedId);
  if (!elem) {
    elementTypeLabel.innerHTML = `<i class="fas fa-cube"></i> No selection`;
    propertiesBody.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-mouse-pointer"></i>
        <p>Select an element to edit its properties</p>
      </div>
    `;
    return;
  }

  const icon = getIconForType(elem.type);
  elementTypeLabel.innerHTML = `
    <i class="fas ${icon}"></i>
    <span>${elem.type.toUpperCase()}</span>
  `;

  const props = elem.props || {};
  const style = props.style || {};

  propertiesBody.innerHTML = `
    <!-- BASIC PROPERTIES -->
    <div class="property-group">
      <h5>Content</h5>
      ${getContentInputs(elem.type, props)}
    </div>

    <!-- LAYOUT -->
    <div class="property-group">
      <h5>Layout</h5>
      <div class="property-row">
        <div class="property-item">
          <label>X</label>
          <input class="property-input" type="number" data-prop="x" value="${elem.x}" />
        </div>
        <div class="property-item">
          <label>Y</label>
          <input class="property-input" type="number" data-prop="y" value="${elem.y}" />
        </div>
      </div>
      <div class="property-row">
        <div class="property-item">
          <label>Width</label>
          <input class="property-input" type="number" data-prop="width" value="${elem.width}" />
        </div>
        <div class="property-item">
          <label>Height</label>
          <input class="property-input" type="number" data-prop="height" value="${elem.height}" />
        </div>
      </div>
    </div>

    <!-- TYPOGRAPHY -->
    <div class="property-group">
      <h5>Typography</h5>
      <div class="property-row">
        <div class="property-item">
          <label>Font Family</label>
          <select class="property-input" data-prop="style.fontFamily">
            ${getFontOptions(style.fontFamily)}
          </select>
        </div>
        <div class="property-item">
          <label>Font Size</label>
          <input class="property-input" type="number" data-prop="style.fontSize" 
                 value="${style.fontSize || 16}" />
        </div>
      </div>
      <div class="property-row">
        <div class="property-item">
          <label>Font Weight</label>
          <select class="property-input" data-prop="style.fontWeight">
            ${getWeightOptions(style.fontWeight)}
          </select>
        </div>
        <div class="property-item">
          <label>Line Height</label>
          <input class="property-input" type="number" step="0.1" 
                 data-prop="style.lineHeight" value="${style.lineHeight || 1.5}" />
        </div>
      </div>
      <div class="property-row">
        <div class="property-item">
          <label>Text Align</label>
          <select class="property-input" data-prop="style.textAlign">
            ${getAlignOptions(style.textAlign)}
          </select>
        </div>
        <div class="property-item">
          <label>Letter Spacing</label>
          <input class="property-input" type="number" step="0.01" 
                 data-prop="style.letterSpacing" value="${style.letterSpacing || 0}" />
        </div>
      </div>
    </div>

    <!-- COLORS -->
    <div class="property-group">
      <h5>Colors</h5>
      <div class="property-row">
        <div class="property-item">
          <label>Text Color</label>
          <input class="property-input" type="color" data-prop="style.color" 
                 value="${style.color || '#1e293b'}" />
        </div>
        <div class="property-item">
          <label>Background</label>
          <input class="property-input" type="color" data-prop="style.backgroundColor" 
                 value="${style.backgroundColor || '#ffffff'}" />
        </div>
      </div>
      ${elem.type === 'image' ? `
      <div class="property-item">
        <label>Background Image</label>
        <input class="property-input" type="text" data-prop="style.backgroundImage" 
               value="${style.backgroundImage || ''}" placeholder="url(...)" />
      </div>
      ` : ''}
    </div>

    <!-- BORDER -->
    <div class="property-group">
      <h5>Border</h5>
      <div class="property-row">
        <div class="property-item">
          <label>Border Radius</label>
          <input class="property-input" type="number" data-prop="style.borderRadius" 
                 value="${style.borderRadius !== undefined ? style.borderRadius : 8}" />
        </div>
        <div class="property-item">
          <label>Border Width</label>
          <input class="property-input" type="number" data-prop="style.borderWidth" 
                 value="${style.borderWidth || 0}" />
        </div>
      </div>
      <div class="property-row">
        <div class="property-item">
          <label>Border Color</label>
          <input class="property-input" type="color" data-prop="style.borderColor" 
                 value="${style.borderColor || '#e2e8f0'}" />
        </div>
        <div class="property-item">
          <label>Border Style</label>
          <select class="property-input" data-prop="style.borderStyle">
            ${getBorderStyleOptions(style.borderStyle)}
          </select>
        </div>
      </div>
    </div>

    <!-- SPACING -->
    <div class="property-group">
      <h5>Spacing</h5>
      <div class="property-row">
        <div class="property-item">
          <label>Padding</label>
          <input class="property-input" type="text" data-prop="style.padding" 
                 value="${style.padding || ''}" placeholder="e.g., 12px 24px" />
        </div>
        <div class="property-item">
          <label>Margin</label>
          <input class="property-input" type="text" data-prop="style.margin" 
                 value="${style.margin || ''}" placeholder="e.g., 0 auto" />
        </div>
      </div>
    </div>

    <!-- EFFECTS -->
    <div class="property-group">
      <h5>Effects</h5>
      <div class="property-row">
        <div class="property-item">
          <label>Box Shadow</label>
          <input class="property-input" type="text" data-prop="style.boxShadow" 
                 value="${style.boxShadow || ''}" placeholder="e.g., 0 4px 20px rgba(0,0,0,0.1)" />
        </div>
        <div class="property-item">
          <label>Opacity</label>
          <input class="property-input" type="range" min="0" max="1" step="0.05" 
                 data-prop="style.opacity" value="${style.opacity !== undefined ? style.opacity : 1}" />
        </div>
      </div>
      ${elem.type.includes('container') || elem.type.includes('card') ? `
      <div class="property-item">
        <label>Backdrop Filter</label>
        <input class="property-input" type="text" data-prop="style.backdropFilter" 
               value="${style.backdropFilter || ''}" placeholder="e.g., blur(10px)" />
      </div>
      ` : ''}
    </div>

    <!-- FLEX LAYOUT (voor containers) -->
    ${elem.type.includes('container') ? `
    <div class="property-group">
      <h5>Flex Layout</h5>
      <div class="property-row">
        <div class="property-item">
          <label>Flex Direction</label>
          <select class="property-input" data-prop="style.flexDirection">
            ${getFlexDirectionOptions(style.flexDirection)}
          </select>
        </div>
        <div class="property-item">
          <label>Justify Content</label>
          <select class="property-input" data-prop="style.justifyContent">
            ${getJustifyOptions(style.justifyContent)}
          </select>
        </div>
      </div>
      <div class="property-row">
        <div class="property-item">
          <label>Align Items</label>
          <select class="property-input" data-prop="style.alignItems">
            ${getAlignItemsOptions(style.alignItems)}
          </select>
        </div>
        <div class="property-item">
          <label>Gap</label>
          <input class="property-input" type="text" data-prop="style.gap" 
                 value="${style.gap || ''}" placeholder="e.g., 12px" />
        </div>
      </div>
    </div>
    ` : ''}

    <!-- IMAGE EFFECTS -->
    ${elem.type === 'image' ? `
    <div class="property-group">
      <h5>Image Effects</h5>
      <div class="property-row">
        <div class="property-item">
          <label>Object Fit</label>
          <select class="property-input" data-prop="style.objectFit">
            <option value="cover" ${(style.objectFit || 'cover') === 'cover' ? 'selected' : ''}>Cover</option>
            <option value="contain" ${(style.objectFit || 'cover') === 'contain' ? 'selected' : ''}>Contain</option>
            <option value="fill" ${(style.objectFit || 'cover') === 'fill' ? 'selected' : ''}>Fill</option>
          </select>
        </div>
        <div class="property-item">
          <label>Filter</label>
          <input class="property-input" type="text" data-prop="style.filter" 
                 value="${style.filter || ''}" placeholder="e.g., brightness(1.2)" />
        </div>
      </div>
    </div>
    ` : ''}
  `;

  // Add event listeners to all inputs
  setTimeout(() => {
    const inputs = propertiesBody.querySelectorAll("[data-prop]");
    inputs.forEach((input) => {
      const handler = () => handlePropertyChange(elem.id, input.dataset.prop, input);
      input.addEventListener("input", handler);
      if (input.tagName === "SELECT") {
        input.addEventListener("change", handler);
      }
    });
  }, 10);
}

/* ===== HELPER FUNCTIONS ===== */

function getIconForType(type) {
  if (type.includes('text')) return 'fa-font';
  if (type.includes('button')) return 'fa-square';
  if (type.includes('input')) return 'fa-i-cursor';
  if (type.includes('container') || type.includes('card')) return 'fa-border-all';
  if (type === 'image') return 'fa-image';
  if (type.includes('badge')) return 'fa-tag';
  return 'fa-cube';
}

function getContentInputs(type, props) {
  if (type.includes('text')) {
    return `
      <div class="property-item">
        <label>Text Content</label>
        <input class="property-input" type="text" data-prop="text" 
               value="${props.text || ''}" />
      </div>
    `;
  }
  if (type.includes('button')) {
    return `
      <div class="property-item">
        <label>Button Text</label>
        <input class="property-input" type="text" data-prop="label" 
               value="${props.label || ''}" />
      </div>
    `;
  }
  if (type.includes('input')) {
    return `
      <div class="property-item">
        <label>Placeholder</label>
        <input class="property-input" type="text" data-prop="placeholder" 
               value="${props.placeholder || ''}" />
      </div>
    `;
  }
  if (type.includes('container') || type.includes('card')) {
    return `
      <div class="property-item">
        <label>Title</label>
        <input class="property-input" type="text" data-prop="label" 
               value="${props.label || ''}" />
      </div>
    `;
  }
  if (type === 'image') {
    return `
      <div class="property-item">
        <label>Image URL</label>
        <input class="property-input" type="text" data-prop="src" 
               value="${props.src || ''}" placeholder="https://..." />
      </div>
      <div class="property-item">
        <label>Alt Text</label>
        <input class="property-input" type="text" data-prop="alt" 
               value="${props.alt || ''}" />
      </div>
    `;
  }
  return '';
}

function getFontOptions(current) {
  const fonts = [
    { value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", label: "System" },
    { value: "'Inter', system-ui, sans-serif", label: "Inter" },
    { value: "'Poppins', system-ui, sans-serif", label: "Poppins" },
    { value: "'Roboto', system-ui, sans-serif", label: "Roboto" },
    { value: "'SF Mono', Menlo, Monaco, monospace", label: "SF Mono" },
    { value: "'Georgia', serif", label: "Georgia" },
    { value: "'Arial', sans-serif", label: "Arial" }
  ];
  
  return fonts.map(f => 
    `<option value="${f.value}" ${current === f.value ? 'selected' : ''}>${f.label}</option>`
  ).join('');
}

function getWeightOptions(current) {
  const weights = [
    { value: '100', label: 'Thin (100)' },
    { value: '300', label: 'Light (300)' },
    { value: '400', label: 'Normal (400)' },
    { value: '500', label: 'Medium (500)' },
    { value: '600', label: 'Semi Bold (600)' },
    { value: '700', label: 'Bold (700)' },
    { value: '800', label: 'Extra Bold (800)' },
    { value: '900', label: 'Black (900)' }
  ];
  
  return weights.map(w => 
    `<option value="${w.value}" ${current === w.value ? 'selected' : ''}>${w.label}</option>`
  ).join('');
}

function getAlignOptions(current) {
  const aligns = ['left', 'center', 'right', 'justify'];
  return aligns.map(a => 
    `<option value="${a}" ${current === a ? 'selected' : ''}>${a.charAt(0).toUpperCase() + a.slice(1)}</option>`
  ).join('');
}

function getBorderStyleOptions(current) {
  const styles = ['none', 'solid', 'dashed', 'dotted', 'double'];
  return styles.map(s => 
    `<option value="${s}" ${current === s ? 'selected' : ''}>${s.charAt(0).toUpperCase() + s.slice(1)}</option>`
  ).join('');
}

function getFlexDirectionOptions(current) {
  const directions = ['row', 'column', 'row-reverse', 'column-reverse'];
  return directions.map(d => 
    `<option value="${d}" ${current === d ? 'selected' : ''}>${d.charAt(0).toUpperCase() + d.slice(1)}</option>`
  ).join('');
}

function getJustifyOptions(current) {
  const options = ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'];
  return options.map(o => 
    `<option value="${o}" ${current === o ? 'selected' : ''}>${formatCssValue(o)}</option>`
  ).join('');
}

function getAlignItemsOptions(current) {
  const options = ['stretch', 'flex-start', 'center', 'flex-end', 'baseline'];
  return options.map(o => 
    `<option value="${o}" ${current === o ? 'selected' : ''}>${formatCssValue(o)}</option>`
  ).join('');
}

function formatCssValue(value) {
  return value.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/* ===== IMPROVED PROPERTY CHANGE HANDLER ===== */

function handlePropertyChange(elementId, propKey, input) {
  const isNumber = input.type === 'number' || input.type === 'range';
  const raw = input.value;
  const value = isNumber ? (raw ? Number(raw) : 0) : raw;

  state.setState((prev) => {
    const proj = prev.project;
    const screens = proj.screens.map((s) => {
      if (s.id !== proj.activeScreenId) return s;
      const comps = s.components.map((c) => {
        if (c.id !== elementId) return c;

        let updated = { ...c };

        // Direct properties (x, y, width, height)
        if (['x', 'y', 'width', 'height'].includes(propKey)) {
          updated[propKey] = value;
          return updated;
        }

        // Content properties (text, label, placeholder, src, alt)
        if (['text', 'label', 'placeholder', 'src', 'alt'].includes(propKey)) {
          const props = { ...(updated.props || {}) };
          props[propKey] = value;
          updated.props = props;
          return updated;
        }

        // Style properties
        if (propKey.startsWith('style.')) {
          const [, styleKey] = propKey.split('.');
          const props = { ...(updated.props || {}) };
          const style = { ...(props.style || {}) };
          
          // Clean empty values
          if (value === '' || value === null || value === undefined) {
            delete style[styleKey];
          } else {
            style[styleKey] = value;
          }
          
          props.style = style;
          updated.props = props;
          return updated;
        }

        return updated;
      });
      return { ...s, components: comps };
    });

    return {
      project: {
        ...proj,
        screens
      }
    };
  });
}

  function handlePropertyChange(elementId, propKey, input) {
    const isNumberType =
      input.type === "number" || input.type === "range";
    const raw = input.value;
    const value = isNumberType ? Number(raw || 0) : raw;

    state.setState((prev) => {
      const proj = prev.project;
      const screens = proj.screens.map((s) => {
        if (s.id !== proj.activeScreenId) return s;
        const comps = s.components.map((c) => {
          if (c.id !== elementId) return c;

          let updated = { ...c };

          if (propKey === "content") {
            const props = { ...(updated.props || {}) };
            if (updated.type === "text") props.text = value;
            else if (updated.type === "button") props.label = value;
            else if (updated.type === "input") props.placeholder = value;
            else if (updated.type === "container") props.label = value;
            else if (updated.type === "image") props.alt = value;
            updated.props = props;
            return updated;
          }

          if (
            propKey === "x" ||
            propKey === "y" ||
            propKey === "width" ||
            propKey === "height"
          ) {
            updated[propKey] = value;
            return updated;
          }

          if (propKey.startsWith("style.")) {
            const [, key] = propKey.split(".");
            const props = { ...(updated.props || {}) };
            const style = { ...(props.style || {}) };
            style[key] = value;
            props.style = style;
            updated.props = props;
            return updated;
          }

          return updated;
        });
        return { ...s, components: comps };
      });

      return {
        project: {
          ...proj,
          screens
        }
      };
    });
  }

  /* ====== QUICK TEXT EDIT (dblclick) ====== */

  function openQuickTextEditor(elementId) {
    const s = state.getState();
    const proj = s.project;
    const screen = proj.screens.find((sc) => sc.id === proj.activeScreenId);
    if (!screen) return;
    const elem = screen.components.find((c) => c.id === elementId);
    if (!elem) return;

    // alleen voor deze types
    if (!["text", "button", "input", "container"].includes(elem.type)) return;

    const current =
      elem.type === "text"
        ? elem.props.text || ""
        : elem.type === "button"
        ? elem.props.label || ""
        : elem.type === "input"
        ? elem.props.placeholder || ""
        : elem.props.label || "";

    const result = window.prompt("Edit text:", current);
    if (result === null) return;

    state.setState((prev) => {
      const p = prev.project;
      const screens = p.screens.map((scr) => {
        if (scr.id !== p.activeScreenId) return scr;
        const comps = scr.components.map((c) => {
          if (c.id !== elementId) return c;
          const props = { ...(c.props || {}) };
          if (c.type === "text") props.text = result;
          else if (c.type === "button") props.label = result;
          else if (c.type === "input") props.placeholder = result;
          else if (c.type === "container") props.label = result;
          return { ...c, props };
        });
        return { ...scr, components: comps };
      });
      return { project: { ...p, screens } };
    });
  }

  /* ================== ASSETS: UPLOAD + GRID + DRAG ================== */

  function initAssetUpload() {
    if (!uploadAssetBtn) return;

    uploadAssetBtn.addEventListener("click", () => {
      if (!assetFileInput) {
        assetFileInput = document.createElement("input");
        assetFileInput.type = "file";
        assetFileInput.accept = "image/*";
        assetFileInput.multiple = true;
        assetFileInput.style.display = "none";
        document.body.appendChild(assetFileInput);

        assetFileInput.addEventListener("change", () => {
          handleAssetFiles(assetFileInput.files);
          assetFileInput.value = "";
        });
      }

      assetFileInput.click();
    });
  }

  function handleAssetFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target.result;
        const asset = {
          id:
            "asset_" +
            Date.now() +
            "_" +
            Math.random().toString(36).slice(2),
          type: "image",
          name: file.name,
          src
        };

        state.setState((prev) => {
          const proj = prev.project;
          const existing = proj.assets || [];
          return {
            project: {
              ...proj,
              assets: [...existing, asset]
            }
          };
        });
      };
      reader.readAsDataURL(file);
    });
  }

  function renderAssetsPanel(s) {
    if (!assetsGrid) return;

    const proj = s.project || {};
    const assets = proj.assets || [];

    if (!assets.length) {
      assetsGrid.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-image"></i>
          <p>No assets yet. Upload PNG/JPG to use in your design.</p>
        </div>
      `;
      return;
    }

    assetsGrid.innerHTML = "";
    assets.forEach((asset) => {
      const item = document.createElement("div");
      item.className = "asset-item";
      item.dataset.id = asset.id;

      if (asset.type === "image") {
        item.innerHTML = `
          <img src="${asset.src}" class="asset-preview" alt="${escapeHtml(
          asset.name
        )}" />
          <div class="asset-overlay">
            <div class="asset-name" title="${escapeHtml(
              asset.name
            )}">${escapeHtml(asset.name)}</div>
          </div>
        `;
      } else {
        item.innerHTML = `
          <div class="asset-placeholder">
            <i class="fas fa-file"></i>
          </div>
          <div class="asset-overlay">
            <div class="asset-name" title="${escapeHtml(
              asset.name
            )}">${escapeHtml(asset.name)}</div>
          </div>
        `;
      }

      assetsGrid.appendChild(item);
    });
  }

  function initAssetsDrag() {
    if (!assetsGrid || !phoneScreen) return;

    assetsGrid.addEventListener("pointerdown", (e) => {
      const item = e.target.closest(".asset-item");
      if (!item) return;

      e.preventDefault();

      const assetId = item.dataset.id;
      if (!assetId) return;
      dragAssetId = assetId;
      dragType = null;

      const proj = state.getState().project;
      const asset = (proj.assets || []).find((a) => a.id === assetId);
      if (!asset) {
        dragAssetId = null;
        return;
      }

      dragGhost = document.createElement("div");
      dragGhost.className = "drag-ghost";
      dragGhost.innerHTML = `<i class="fas fa-image"></i><span>${escapeHtml(
        asset.name
      )}</span>`;
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

        if (!dragAssetId) return;

        const currentProj = state.getState().project;
        const currentAsset = (currentProj.assets || []).find(
          (a) => a.id === dragAssetId
        );
        dragAssetId = null;

        if (!currentAsset || !phoneScreen) return;

        const rect = phoneScreen.getBoundingClientRect();
        const x = upEvent.clientX;
        const y = upEvent.clientY;

        const inside =
          x >= rect.left &&
          x <= rect.right &&
          y >= rect.top &&
          y <= rect.bottom;

        if (!inside) return;

        const defaultWidth = 180;
        const defaultHeight = 180;

        const instanceId =
          "elem_" +
          Date.now() +
          "_" +
          Math.random().toString(36).slice(2);

        const imageElement = {
          id: instanceId,
          type: "image",
          x: snapToGrid(x - rect.left - defaultWidth / 2),
          y: snapToGrid(y - rect.top - defaultHeight / 2),
          width: defaultWidth,
          height: defaultHeight,
          parentId: null,
          props: {
            src: currentAsset.src,
            alt: currentAsset.name,
            style: {
              backgroundColor: "transparent",
              textColor: "#0f172a",
              fontSize: 14,
              fontFamily:
                "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              borderRadius: 24,
              brightness: 1,
              overlay: "none",
              overlayIntensity: 0.45,
              elevation: 0
            }
          }
        };

        state.setState((prev) => {
          const proj = prev.project;
          const screens = proj.screens.map((s) => {
            if (s.id !== proj.activeScreenId) return s;
            return {
              ...s,
              components: [...s.components, imageElement]
            };
          });

          return {
            project: {
              ...proj,
              screens,
              selectedElementId: instanceId
            }
          };
        });
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    });
  }

  initAssetUpload();
  initAssetsDrag();
});

