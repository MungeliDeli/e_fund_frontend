// Classic Hero Template Config

const classicHeroConfig = {
  templateId: "classic-hero",
  theme: {
    backgroundColor: "#ffffff", 
    accentColor: "#facc15",
    textColor: "#222222",
  },
  sections: [
    {
      key: "header",
      label: "Header Section",
      visible: true,
      allowToggle: false,
      allowEdit: true,
      content: {
        orgName: "Unza Nasa",
        image: null,
      },
    },
    {
      key: "hero",
      label: "Hero Section",
      visible: true,
      allowToggle: false,
      allowEdit: true,
      content: {
        title: "Help Us Make a Difference",
        subtitle: "Your support changes lives",
        image: null,
        mission:
          "Our mission is to offer immediate refuge and compassionate care to vulnerable individuals, ensuring their basic need for shelter is met while empowering them to rebuild their lives with dignity and respect.",
      },
    },
    {
      key: "majorDonors",
      label: "Major Donors",
      visible: true,
      allowToggle: true,
      allowEdit: false,
      content: {},
    },
    {
      key: "goalMeter",
      label: "Goal Meter",
      visible: true,
      allowToggle: true,
      allowEdit: true,
      content: {
        raised: 7452,
        goal: 10000,
      },
    },
    {
      key: "donationForm",
      label: "Donation Form",
      visible: true,
      allowToggle: true,
      allowEdit: true,

      content: {
        presetAmounts: [500, 200, 100, 50, 20, 5],
      },
    },
    {
      key: "recentDonations",
      label: "Recent Donations",
      visible: true,
      allowToggle: true,
      allowEdit: false,

      content: {},
    },
    {
      key: "successStories",
      label: "Success Stories",
      visible: true,
      allowToggle: true,
      allowEdit: true,

      content: {
        stories: [], // array of {title, text, image}
      },
    },
    {
      key: "signupPrompt",
      label: "Signup Prompt",
      visible: true,
      allowToggle: true,
      allowEdit: false,
      content: {},
    },
  ],
};

export default classicHeroConfig;
