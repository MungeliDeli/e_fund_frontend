# Campaigns Feature Documentation

This document provides a comprehensive overview of the **Campaigns** feature in the FundFlow application. It covers the architecture, workflow, and key components involved in creating, managing, and displaying fundraising campaigns.

## 1. Overview

The Campaigns feature is the core of the FundFlow platform, enabling organization users to create  customizable fundraising pages. The system is built around a dynamic, template-based architecture that allows for easy extension and modification.

Key functionalities include:
- **Template Selection**: Users can choose from a variety of pre-designed templates.
- **Live Campaign Builder**: A real-time editor for customizing campaign pages. for now just content and colours
- **Dynamic Configuration**: Each template is driven by a `config.js` file that defines its structure, content, and editable properties.
- **Component-Based Architecture**: The system is modular, with clear separation of concerns between templates, the builder UI, and state management.

---

## 2. Directory Structure

The `src/features/campaigns` directory is organized as follows:

```
/features/campaigns
├── builder/         # Core components for the campaign creation workflow
│   ├── components/  # Reusable UI components for the SidebarInspector
│   │   ├── controls/    # Individual input controls (ColorPicker, TextInput, etc.)
│   │   └── ...
│   ├── CampaignBuilderPage.jsx
│   └── TemplateSelector.jsx
├── pages/           # Top-level pages for campaigns (e.g., dashboards)
├── services/        # API calls related to campaigns (e.g., create, update, fetch)
└── templates/       # Contains all available campaign templates
    ├── ClassicHero/ # Example template folder
    │   ├── ClassicHeroTemplate.jsx
    │   └── config.js
    └── templateRegistry.js # Central registry for all templates
```

- **`builder/`**: Contains the multi-step campaign creation and editing interface.
- **`builder/components/`**: Houses the components that make up the `SidebarInspector`, such as the `ThemeEditor` and `SectionEditor`.
- **`pages/`**: Includes pages for viewing and managing campaigns, such as the `OrganizerDashboardPage` and admin panels.
- **`services/`**: Manages all API interactions with the backend for campaign data.
- **`templates/`**: The heart of the campaign display layer. Each sub-directory represents a unique template with its own components and configuration.

---

## 3. Campaign Creation Workflow

The campaign creation process is a guided, multi-step workflow designed for a seamless user experience.

### Step 1: Template Selection (`TemplateSelector.jsx`)

- **Purpose**: To display all available campaign templates and allow the user to choose one.
- **Functionality**:
  - It fetches template metadata from `templateRegistry.js`.
  - It displays a preview card for each template, including its name and description.
  - When a user selects a template, its `id` is stored and passed to the next step via `react-router-dom`'s state.

### Step 2: Campaign Building (`CampaignBuilderPage.jsx`)

- **Purpose**: To provide a live preview and a powerful editor for customizing the selected template.
- **Architecture**:
  - The page is split into two main panels: `LivePreview` and `SidebarInspector`.
  - It uses the template `id` from the previous step to dynamically load the template's component and configuration.
- **State Management**:
  - It uses the `useImmer` hook for efficient and immutable updates to the campaign's configuration object.
  - The `customPageSettings` state holds the entire configuration, which is passed down to both the `LivePreview` and `SidebarInspector`.

### Step 3: Real-Time Customization (`SidebarInspector.jsx`)

- **Purpose**: To provide a user-friendly interface for editing the campaign's theme and content.
- **Functionality**:
  - **Dynamic Rendering**: The sidebar inspects the `config` object and dynamically renders controls for each editable section and theme property.
  - **Tabbed Navigation**: It separates concerns into two tabs: **Content** and **Theme**.
  - **Content Editing**: The `SectionEditor` creates an accordion menu for each section defined in `config.sections`. Each section's controls are generated based on its `content` object.
  - **Theme Editing**: The `ThemeEditor` provides color pickers for global styles like `backgroundColor`, `primaryColor`, etc.
  - **Data Flow**: When a user makes a change (e.g., edits text, picks a color), the `onConfigChange` callback is invoked, which updates the central state in `CampaignBuilderPage` using `immer`. This triggers a re-render of the `LivePreview` with the new settings.

---

## 4. Template System

The template system is designed to be highly modular and extensible.

### `templateRegistry.js`

- This file acts as a central directory for all campaign templates.
- It exports an array of template objects, each containing metadata like `id`, `name`, `description`, and a `getConfig` function for lazy-loading its configuration.

### Template Structure

Each template resides in its own folder (e.g., `ClassicHero/`) and must contain at least two files:

1.  **`config.js`**: This is the most important file. It exports a JavaScript object that defines the template's entire structure, default content, and editable properties.
    - `theme`: Defines the global color scheme.
    - `sections`: An array of objects, where each object represents a section of the page (e.g., Hero, About, Donors). Each section object specifies its `key`, `label`, `visible` status, and `content` fields.

2.  **`<TemplateName>Template.jsx`**: The main React component for the template.
    - It receives the `config` object as a prop.
    - It renders the template's layout and components, using the `config` prop to populate content and apply styles.

---

## 5. Performance Optimizations

Several strategies are used to ensure the campaign builder is fast and responsive:

- **Code Splitting**: `React.lazy` and `Suspense` are used in `CampaignBuilderPage.jsx` to only load the code for the selected template, reducing the initial bundle size.
- **Lazy Loading Configs**: The `templateRegistry.js` uses dynamic `import()` to lazy-load configuration files, preventing all template configs from being bundled together.
- **Memoization**: `React.memo` is used on `LivePreview` and `SidebarInspector` to prevent unnecessary re-renders when props haven't changed.
- **Efficient State Updates**: The `use-immer` library is used for handling state updates to the complex configuration object. This avoids deep-cloning the entire state on every change, improving performance.
