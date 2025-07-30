import React, { useEffect, useState, useMemo, useCallback, Suspense, lazy } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import templates, { getTemplateWithConfig } from "../templates/templateRegistry";
import { useImmer } from "use-immer";
import SidebarInspector from "./components/SidebarInspector";
import BuilderHeader from "./components/BuilderHeader";
import ConfirmationModal from "../../../components/ConfirmationModal";

// Lazy load template components for code splitting
const templateComponents = {
  "classic-hero": lazy(() => import("../templates/ClassicHero/ClassicHeroTemplate")),
};

// Memoized components
const LivePreview = React.memo(({ templateComponent: Template, config }) => (
  <div className="h-full w-full bg-white rounded-lg shadow  overflow-auto">
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--color-primary)]"></div>
      </div>
    }>
      <Template config={config} />
    </Suspense>
  </div>
));

const CampaignBuilderPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedTemplateId = location.state?.selectedTemplate;

  // Memoize template lookup
  const selectedTemplate = useMemo(() => 
    templates.find((t) => t.id === selectedTemplateId),
    [selectedTemplateId]
  );

  // Redirect if no template selected
  useEffect(() => {
    if (!selectedTemplate) {
      navigate("/campaign-templates");
    }
  }, [selectedTemplate, navigate]);

  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Use immer for efficient immutable updates
    const [customPageSettings, updateCustomPageSettings] = useImmer(null);
  
  // Effect to load initial config from localStorage or fallback to default
  useEffect(() => {
    if (!selectedTemplate) return;

    setIsLoading(true);
    const storageKey = `campaignBuilder-${selectedTemplate.id}`;
    const savedConfig = localStorage.getItem(storageKey);

    const loadDefaultConfig = async () => {
      try {
        const templateWithConfig = await getTemplateWithConfig(selectedTemplateId);
        if (templateWithConfig) {
          updateCustomPageSettings(templateWithConfig.config);
        }
      } catch (error) {
        console.error('Failed to load template config:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (savedConfig) {
      try {
        updateCustomPageSettings(JSON.parse(savedConfig));
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to parse saved config, falling back to default:", error);
        loadDefaultConfig();
      }
    } else {
      loadDefaultConfig();
    }
  }, [selectedTemplate, selectedTemplateId, updateCustomPageSettings]);

  // Effect to save config changes to localStorage
  useEffect(() => {
    if (customPageSettings && selectedTemplate) {
      const storageKey = `campaignBuilder-${selectedTemplate.id}`;
      localStorage.setItem(storageKey, JSON.stringify(customPageSettings));
    }
  }, [customPageSettings, selectedTemplate]);

  // Memoized template component
  const TemplateComponent = useMemo(() => {
    return templateComponents[selectedTemplateId] || (() => <div>Template not found</div>);
  }, [selectedTemplateId]);

  // Memoized config change handler
  const handleConfigChange = useCallback((updater) => {
    updateCustomPageSettings(updater);
  }, [updateCustomPageSettings]);

  const handleBack = () => {
    setIsModalOpen(true);
  };

  const handleConfirmBack = () => {
    if (selectedTemplate) {
      const storageKey = `campaignBuilder-${selectedTemplate.id}`;
      localStorage.removeItem(storageKey);
    }
    navigate("/campaign-templates");
  };

  // Show loading state while config loads
  if (isLoading || !customPageSettings) {
    return (
      <div className="min-h-screen bg-[color:var(--color-background)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--color-primary)] mx-auto mb-4"></div>
          <p className="text-[color:var(--color-secondary-text)]">Loading template...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--color-background)] text-[color:var(--color-primary-text)] flex flex-col">
      <BuilderHeader onBack={handleBack} />
      <div className=" mx-auto w-full flex flex-col lg:flex-row gap-2 py-8 px-2 lg:px-6">
        {/* Live Preview (left) */}
        <div className="flex-1 min-w-0">
          <LivePreview
            templateComponent={TemplateComponent}
            config={customPageSettings}
          />
        </div>
        {/* Sidebar Inspector (right) */}
        <div className="w-full lg:w-[400px] flex-shrink-0">
          <SidebarInspector
            config={customPageSettings}
            onConfigChange={handleConfigChange}
          />
        </div>
      </div>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmBack}
        title="Are you sure?"
        message="If you go back, any unsaved changes will be lost. This action will clear your current draft."
        confirmText="Yes, Go Back"
      />
    </div>
  );
};

export default CampaignBuilderPage;
