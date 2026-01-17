// scripts/components/basic.js
(function () {
  const registry = window.AutopilotComponents;
  if (!registry) return;

  const BASIC_FONT =
    "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

  const basicComponents = [
    // ===== TEXT =====
    {
      type: "text-heading",
      category: "basic",
      label: "Heading",
      icon: "fa-heading",
      defaultSize: { width: 220, height: 40 },
      defaultProps: {
        text: "Your headline goes here",
        style: {
          textColor: "#0f172a",
          fontSize: 22,
          fontFamily: BASIC_FONT,
          borderRadius: 0,
          elevation: 0
        }
      }
    },
    {
      type: "text-body",
      category: "basic",
      label: "Body text",
      icon: "fa-align-left",
      defaultSize: { width: 260, height: 60 },
      defaultProps: {
        text:
          "Add some descriptive copy here. You can adjust color, size and font.",
        style: {
          textColor: "#4b5563",
          fontSize: 14,
          fontFamily: BASIC_FONT,
          borderRadius: 0,
          elevation: 0
        }
      }
    },

    // ===== BUTTONS =====
    {
      type: "button-primary",
      category: "basic",
      label: "Button · Primary",
      icon: "fa-square",
      defaultSize: { width: 180, height: 44 },
      defaultProps: {
        label: "Continue",
        style: {
          backgroundColor: "#2563eb",
          textColor: "#f9fafb",
          fontSize: 15,
          fontFamily: BASIC_FONT,
          borderRadius: 999,
          elevation: 2
        }
      }
    },
    {
      type: "button-ghost",
      category: "basic",
      label: "Button · Ghost",
      icon: "fa-border-all",
      defaultSize: { width: 160, height: 40 },
      defaultProps: {
        label: "Secondary",
        style: {
          backgroundColor: "rgba(15,23,42,0.03)",
          textColor: "#0f172a",
          fontSize: 14,
          fontFamily: BASIC_FONT,
          borderRadius: 999,
          elevation: 0
        }
      }
    },

    // ===== CONTAINERS / CARDS =====
    {
      type: "container-card",
      category: "basic",
      label: "Card · Soft",
      icon: "fa-rectangle-list",
      defaultSize: { width: 320, height: 200 },
      defaultProps: {
        label: "Card title",
        style: {
          backgroundColor: "rgba(255,255,255,0.96)",
          textColor: "#0f172a",
          fontSize: 16,
          fontFamily: BASIC_FONT,
          borderRadius: 24,
          elevation: 1,
          // glass=false -> gewone kaart, maar via properties kan je later glass true maken
          glass: false
        }
      }
    },
    {
      type: "container-glass",
      category: "basic",
      label: "Card · Glass",
      icon: "fa-clone",
      defaultSize: { width: 320, height: 220 },
      defaultProps: {
        label: "Glass panel",
        style: {
          backgroundColor: "rgba(15,23,42,0.45)",
          textColor: "#e5e7eb",
          fontSize: 16,
          fontFamily: BASIC_FONT,
          borderRadius: 28,
          elevation: 2,
          glass: true,
          glassBorderAlpha: 0.22
        }
      }
    },

    // ===== BADGE / LABEL =====
    {
      type: "badge",
      category: "basic",
      label: "Badge",
      icon: "fa-tag",
      defaultSize: { width: 100, height: 32 },
      defaultProps: {
        label: "New",
        style: {
          backgroundColor: "rgba(34,197,94,0.1)",
          textColor: "#16a34a",
          fontSize: 12,
          fontFamily: BASIC_FONT,
          borderRadius: 999,
          elevation: 0
        }
      }
    }
  ];

  registry.registerMany(basicComponents);
})();