// scripts/components/navigation.js
(function () {
  const registry = window.AutopilotComponents;
  if (!registry) return;

  const nav = [
    {
      type: "navbar",
      category: "basic",
      label: "Top navbar",
      icon: "fa-bars",
      defaultSize: { width: 360, height: 56 },
      defaultProps: {
        label: "Navbar",
        style: {
          backgroundColor: "#0f172a",
          textColor: "#f9fafb",
          fontSize: 16,
          fontFamily:
            "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }
      }
    }
  ];

  registry.registerMany(nav);
})();