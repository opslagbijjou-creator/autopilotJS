// scripts/components/media.js
(function () {
  const registry = window.AutopilotComponents;
  if (!registry) return;

  const media = [
    {
      type: "image",
      category: "media",
      label: "Image placeholder",
      icon: "fa-image",
      defaultSize: { width: 180, height: 180 },
      defaultProps: {
        alt: "Image",
        style: {
          backgroundColor: "#e5e7eb",
          borderRadius: 24,
          elevation: 1
        }
      }
    }
  ];

  registry.registerMany(media);
})();