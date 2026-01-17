// scripts/components/forms.js
(function () {
  const registry = window.AutopilotComponents;
  if (!registry) return;

  const forms = [
    {
      type: "input",
      category: "forms",
      label: "Text input",
      icon: "fa-i-cursor",
      defaultSize: { width: 260, height: 40 },
      defaultProps: {
        placeholder: "Enter text...",
        style: {
          backgroundColor: "#f3f4f6",
          textColor: "#0f172a",
          fontSize: 14,
          fontFamily:
            "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          borderRadius: 999
        }
      }
    }
  ];

  registry.registerMany(forms);
})();