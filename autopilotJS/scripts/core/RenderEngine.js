// scripts/core/RenderEngine.js
// RenderEngine v2 – begrijpt text-heading / button-primary / card-* etc.
// + klik / drag / resize + double-click om tekst te editen

(function () {
  const GRID_SIZE = 8;

  function snapToGrid(value) {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  }

  function inferKind(type) {
    if (!type) return "generic";
    if (type.startsWith("text-")) return "text";
    if (type.startsWith("button")) return "button";
    if (type.startsWith("card")) return "container";
    if (type.startsWith("badge")) return "badge";
    if (type.startsWith("top-nav")) return "navbar";
    if (type === "image") return "image";
    return "generic";
  }

  function getContentFromProps(comp) {
    const props = comp.props || {};
    return (
      props.text ||
      props.label ||
      props.placeholder ||
      props.title ||
      props.alt ||
      ""
    );
  }

  class RenderEngine {
    constructor(stateManager, eventBus) {
      this.stateManager = stateManager;
      this.eventBus = eventBus;
      this.phoneScreen = document.getElementById("phoneScreen");
      this.canvasWrapper = document.getElementById("canvasWrapper");
      this.gridOverlay = document.getElementById("gridOverlay");
      this.currentState = null;
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

      // alles van vorige render weg
      this.phoneScreen
        .querySelectorAll(".canvas-element")
        .forEach((el) => el.remove());

      const comps = activeScreen.components || [];
      const map = new Map();

      // eerst DOM maken
      comps.forEach((comp) => {
        const el = this.createElementForComponent(comp, project);
        map.set(comp.id, { comp, el });
      });

      // parent / child opbouwen
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
      const kind = inferKind(comp.type);
      const el = document.createElement("div");
      el.classList.add("canvas-element", "pop-in");
      el.dataset.id = comp.id;

      if (project.selectedElementId === comp.id) {
        el.classList.add("selected");
      }

      el.style.left = comp.x + "px";
      el.style.top = comp.y + "px";
      el.style.width = comp.width + "px";
      el.style.height = comp.height + "px";

      const props = comp.props || {};
      const style = props.style || {};

      const applyElevation = (target, elevation) => {
        if (elevation === 0 || elevation === "0" || elevation == null) {
          target.style.boxShadow = "none";
        } else if (elevation === 1 || elevation === "1") {
          target.style.boxShadow =
            "0 12px 30px rgba(15,23,42,0.35), 0 0 0 1px rgba(148,163,184,0.35)";
        } else {
          target.style.boxShadow =
            "0 18px 55px rgba(15,23,42,0.6), 0 0 0 1px rgba(129,140,248,0.55)";
        }
      };

      const applyStyles = (target) => {
        if (style.backgroundColor) target.style.backgroundColor = style.backgroundColor;
        if (style.textColor) target.style.color = style.textColor;
        if (style.fontSize) {
          target.style.fontSize =
            typeof style.fontSize === "number"
              ? style.fontSize + "px"
              : style.fontSize;
        }
        if (style.fontFamily) target.style.fontFamily = style.fontFamily;
        if (style.borderRadius != null) {
          target.style.borderRadius =
            typeof style.borderRadius === "number"
              ? style.borderRadius + "px"
              : style.borderRadius;
        }
        if (style.elevation != null) {
          applyElevation(target, style.elevation);
        }
      };

      // --- inhoud per soort ---
      if (kind === "text") {
        el.classList.add("element-text");
        el.textContent = getContentFromProps(comp) || "Text";
        applyStyles(el);
      } else if (kind === "button") {
        el.classList.add("element-button");
        el.textContent = getContentFromProps(comp) || "Button";
        applyStyles(el);
      } else if (kind === "container" || kind === "navbar") {
        el.classList.add("element-container");
        const title = document.createElement("div");
        title.className = "container-title";
        title.textContent = props.label || props.title || "Card";
        el.appendChild(title);
        applyStyles(el);
      } else if (kind === "badge") {
        el.classList.add("element-badge");
        el.textContent = props.label || "Badge";
        applyStyles(el);
      } else if (kind === "image") {
        el.classList.add("element-image");
        const img = document.createElement("img");
        img.className = "image-content";
        img.src = props.src || "";
        img.alt = props.alt || "";
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "cover";
        img.style.display = "block";

        const brightness =
          style.brightness !== undefined ? style.brightness : 1;
        img.style.filter = `brightness(${brightness})`;
        el.appendChild(img);
        applyStyles(el);
      } else {
        // fallback
        el.classList.add("element-generic");
        el.textContent = getContentFromProps(comp) || comp.type || "Element";
        applyStyles(el);
      }

      // chrome (duplicate / delete / resize)
      this.addUIChrome(el, comp);

      // selecteren
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

      // dubbelklik → tekst aanpassen via prompt (simpel)
      el.addEventListener("dblclick", (e) => {
        e.stopPropagation();
        const current = getContentFromProps(comp);
        const next = window.prompt("Edit text / label", current);
        if (next == null) return;

        this.stateManager.setState((prev) => {
          const proj = prev.project;
          const screens = proj.screens.map((s) => {
            if (s.id !== proj.activeScreenId) return s;
            const comps = s.components.map((c) => {
              if (c.id !== comp.id) return c;
              const props = { ...(c.props || {}) };

              if ("text" in props || comp.type.startsWith("text-")) {
                props.text = next;
              } else if ("label" in props || comp.type.startsWith("button")) {
                props.label = next;
              } else if ("placeholder" in props) {
                props.placeholder = next;
              } else if ("title" in props) {
                props.title = next;
              } else if ("alt" in props) {
                props.alt = next;
              } else {
                props.text = next;
              }

              return { ...c, props };
            });
            return { ...s, components: comps };
          });

          return { project: { ...proj, screens } };
        });
      });

      el.addEventListener("animationend", () => {
        el.classList.remove("pop-in");
      });

      return el;
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

    // ==== selectie / delete / duplicate ====

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
            x: original.x + 16,
            y: original.y + 16
          };
          comps.splice(idx + 1, 0, copy);
          return { ...s, components: comps };
        });
        return { project: { ...proj, screens } };
      });
    }

    // ==== drag / resize ====

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