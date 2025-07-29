// Template Registry: List and export all available campaign templates
// Each template has: id, name, description, previewImage, config, allowedSections

import classicHeroConfig from "./ClassicHero/config";
import modernImpactConfig from "./ModernImpact/config";

const templates = [
  {
    id: "classic-hero",
    name: "Classic Hero",
    description:
      "A traditional layout with a hero section, recent donations, and major donors.",
    previewImage: "/images/templates/classic-hero.png", // placeholder path
    config: classicHeroConfig,
  },
  {
    id: "modern-impact",
    name: "Modern Impact",
    description: "A modern layout with impact stories and a bold hero area.",
    previewImage: "/images/templates/modern-impact.png", // placeholder path
    config: modernImpactConfig,
  },
];

export default templates;
