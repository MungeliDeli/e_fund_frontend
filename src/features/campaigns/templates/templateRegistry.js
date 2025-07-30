// Template Registry: List and export all available campaign templates
// Each template has: id, name, description, previewImage, config, allowedSections

// Lazy load configs to improve initial bundle size
const getTemplateConfig = async (templateId) => {
  switch (templateId) {
    case 'classic-hero':
      return (await import('./ClassicHero/config')).default;
    case 'modern-impact':
      return (await import('./ModernImpact/config')).default;
    default:
      throw new Error(`Unknown template: ${templateId}`);
  }
};

// Template metadata (lightweight)
const templates = [
  {
    id: "classic-hero",
    name: "Classic Hero",
    description:
      "A traditional layout with a hero section, recent donations, and major donors.",
    previewImage: "/images/templates/classic-hero.png",
    category: "traditional",
    features: ["hero-section", "donation-form", "goal-meter", "donor-wall"],
    // Config loaded lazily
    getConfig: () => getTemplateConfig('classic-hero'),
  },
  {
    id: "modern-impact",
    name: "Modern Impact",
    description: "A modern layout with impact stories and a bold hero area.",
    previewImage: "/images/templates/modern-impact.png",
    category: "modern",
    features: ["impact-stories", "bold-hero", "social-proof"],
    // Config loaded lazily
    getConfig: () => getTemplateConfig('modern-impact'),
  },
];

// For backward compatibility - loads config immediately
export const getTemplateWithConfig = async (templateId) => {
  const template = templates.find(t => t.id === templateId);
  if (!template) return null;
  
  const config = await template.getConfig();
  return { ...template, config };
};

export default templates;
