// scripts/components/patterns-login.js
(function () {
  const registry = window.AutopilotComponents;
  if (!registry) return;

  const patterns = [
    {
      type: "pattern-login",
      category: "patterns",
      label: "Login · Classic",
      icon: "fa-right-to-bracket"
      // layout wordt gedaan in main.js -> createLoginPattern(...)
    }
  ];

  registry.registerMany(patterns);
})();