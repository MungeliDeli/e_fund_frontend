// Modern Impact Template Config

const modernImpactConfig = {
  templateId: "modern-impact",
  theme: {
    backgroundColor: "#f7f7f7",
    primaryColor: "#10b981",
    accentColor: "#6366f1",
    textColor: "#1a202c",
  },
  sections: [
    {
      key: "impactHero",
      label: "Impact Hero",
      visible: true,
      allowToggle: false,
      allowEdit: true,
      backgroundColor: "#e0f2fe",
      textColor: "#1a202c",
      content: {
        headline: "Be the Change",
        subheadline: "Join our mission for impact",
        image: null,
      },
    },
    {
      key: "impactStories",
      label: "Impact Stories",
      visible: true,
      allowToggle: true,
      allowEdit: true,
      backgroundColor: "#f1f5f9",
      textColor: "#1a202c",
      content: {
        stories: [],
      },
    },
    {
      key: "donorWall",
      label: "Donor Wall",
      visible: true,
      allowToggle: true,
      allowEdit: false,
      backgroundColor: "#fff",
      textColor: "#1a202c",
      content: {},
    },
    {
      key: "thankYou",
      label: "Thank You Section",
      visible: true,
      allowToggle: true,
      allowEdit: true,
      backgroundColor: "#e0e7ff",
      textColor: "#1a202c",
      content: {
        message: "Thank you for your support!",
      },
    },
  ],
};

export default modernImpactConfig;
