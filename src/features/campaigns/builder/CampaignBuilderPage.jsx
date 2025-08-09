import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  Suspense,
  lazy,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import templates, {
  getTemplateWithConfig,
} from "../templates/templateRegistry";
import { useImmer } from "use-immer";
import SidebarInspector from "./components/SidebarInspector";
import BuilderHeader from "./components/BuilderHeader";
import CampaignSubmissionForm from "./components/CampaignSubmissionForm";
import ConfirmationModal from "../../../components/ConfirmationModal";
import Notification from "../../../components/Notification";
import { saveCampaignDraft, getCampaignById } from "../services/campaignApi";
import { v4 as uuidv4 } from "uuid";

// Lazy load template components for code splitting
const templateComponents = {
  "classic-hero": lazy(() =>
    import("../templates/ClassicHero/ClassicHeroTemplate")
  ),
};

// Memoized components
const LivePreview = React.memo(({ templateComponent: Template, config }) => (
  <div className="h-full w-full bg-white rounded-lg shadow  overflow-auto">
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--color-primary)]"></div>
        </div>
      }
    >
      <Template config={config} />
    </Suspense>
  </div>
));

// Add a function to get or generate a stable draft UUID
function getDraftUUID(selectedTemplateId) {
  const storageKey = `campaignBuilder-draftUUID-${selectedTemplateId}`;
  let draftUUID = localStorage.getItem(storageKey);
  if (!draftUUID) {
    draftUUID = uuidv4();
    localStorage.setItem(storageKey, draftUUID);
  }
  return draftUUID;
}

const CampaignBuilderPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Parse campaignId from URL query parameters
  const urlParams = new URLSearchParams(location.search);
  const campaignId = urlParams.get("campaignId");
  const selectedTemplateId = location.state?.selectedTemplate;

  // State for campaign data when editing
  const [campaignData, setCampaignData] = useState(null);
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(false);
  const [campaignError, setCampaignError] = useState(null);

  // Notification state
  const [notification, setNotification] = useState({
    isVisible: false,
    type: "success",
    message: "",
  });

  // Memoize template lookup - use campaign's templateId if editing, otherwise use selected template
  const selectedTemplate = useMemo(() => {
    const templateId = campaignData?.templateId || selectedTemplateId;
    return templates.find((t) => t.id === templateId);
  }, [campaignData?.templateId, selectedTemplateId]);

  // Redirect if no template selected and not editing
  useEffect(() => {
    if (!selectedTemplate && !campaignId) {
      navigate("/campaign-templates");
    }
  }, [selectedTemplate, campaignId, navigate]);

  // Fetch campaign data if editing
  useEffect(() => {
    if (campaignId) {
      const fetchCampaign = async () => {
        setIsLoadingCampaign(true);
        setCampaignError(null);
        try {
          const response = await getCampaignById(campaignId);
          setCampaignData(response.data);
        } catch (error) {
          console.error("Failed to fetch campaign:", error);
          setCampaignError("Failed to load campaign. Please try again.");
        } finally {
          setIsLoadingCampaign(false);
        }
      };
      fetchCampaign();
    }
  }, [campaignId]);

  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedCampaignId, setSavedCampaignId] = useState(campaignId);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);

  // Use immer for efficient immutable updates
  const [customPageSettings, updateCustomPageSettings] = useImmer(null);

  // Effect to load initial config from campaign data, localStorage, or fallback to default
  useEffect(() => {
    if (!selectedTemplate) return;

    setIsLoading(true);
    const storageKey = `campaignBuilder-${selectedTemplate.id}`;

    const loadDefaultConfig = async () => {
      try {
        const templateWithConfig = await getTemplateWithConfig(
          selectedTemplate.id
        );
        if (templateWithConfig) {
          updateCustomPageSettings(templateWithConfig.config);
        }
      } catch (error) {
        console.error("Failed to load template config:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Priority: 1. Campaign data, 2. localStorage, 3. default config
    if (campaignData?.customPageSettings) {
      // Use campaign's custom page settings
      updateCustomPageSettings(campaignData.customPageSettings);
      setIsLoading(false);
    } else {
      const savedConfig = localStorage.getItem(storageKey);
      if (savedConfig) {
        try {
          updateCustomPageSettings(JSON.parse(savedConfig));
          setIsLoading(false);
        } catch (error) {
          console.error(
            "Failed to parse saved config, falling back to default:",
            error
          );
          loadDefaultConfig();
        }
      } else {
        loadDefaultConfig();
      }
    }
  }, [selectedTemplate, campaignData, updateCustomPageSettings]);

  // Effect to save config changes to localStorage (only for new campaigns)
  useEffect(() => {
    if (customPageSettings && selectedTemplate && !campaignId) {
      const storageKey = `campaignBuilder-${selectedTemplate.id}`;
      localStorage.setItem(storageKey, JSON.stringify(customPageSettings));
    }
  }, [customPageSettings, selectedTemplate, campaignId]);

  // Memoized template component
  const TemplateComponent = useMemo(() => {
    const templateId = selectedTemplate?.id;
    return (
      templateComponents[templateId] || (() => <div>Template not found</div>)
    );
  }, [selectedTemplate?.id]);

  // Memoized config change handler
  const handleConfigChange = useCallback(
    (updater) => {
      updateCustomPageSettings(updater);
    },
    [updateCustomPageSettings]
  );

  // Update handleImageMetadata to update customPageSettings directly
  const handleImageMetadata = useCallback(
    (sectionKey, field, metadata) => {
      updateCustomPageSettings((draft) => {
        if (!draft.sections) return;
        const section = draft.sections.find((s) => s.key === sectionKey);
        if (section && section.content && field in section.content) {
          section.content[field] = metadata;
        }
      });
    },
    [updateCustomPageSettings]
  );

  const handleBack = () => {
    setIsModalOpen(true);
  };

  const handleConfirmBack = () => {
    if (selectedTemplate && !campaignId) {
      const storageKey = `campaignBuilder-${selectedTemplate.id}`;
      localStorage.removeItem(storageKey);
    }
    navigate("/campaign-templates");
  };

  const handleNext = () => {
    setShowSubmissionForm(true);
  };

  const handleBackToBuilder = () => {
    setShowSubmissionForm(false);
  };

  // Handle saving campaign as draft
  const handleSaveAsDraft = async () => {
    if (!customPageSettings || !selectedTemplate) return;

    setIsSaving(true);
    try {
      const campaignData = {
        customPageSettings,
        templateId: selectedTemplate.id,
        // Optional fields that can be filled later
        title: null,
        description: null,
        startDate: null,
        endDate: null,
        categoryIds: [],
      };

      console.log("campaignData", campaignData);
      const savedCampaign = await saveCampaignDraft(
        campaignData,
        savedCampaignId
      );

      // Update the saved campaign ID for future updates
      setSavedCampaignId(savedCampaign.data.campaignId);

      // Clear localStorage since it's now saved in the database
      if (selectedTemplate && !campaignId) {
        const storageKey = `campaignBuilder-${selectedTemplate.id}`;
        localStorage.removeItem(storageKey);
      }

      // Show success notification
      setNotification({
        isVisible: true,
        type: "success",
        message: "Campaign draft saved successfully!",
      });

      console.log("Campaign draft saved successfully!", savedCampaign);
    } catch (error) {
      console.error("Failed to save campaign draft:", error);

      // Show error notification
      setNotification({
        isVisible: true,
        type: "error",
        message: "Failed to save campaign draft. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle notification close
  const handleNotificationClose = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  // Show loading state while config loads or campaign is being fetched
  if (isLoading || isLoadingCampaign || !customPageSettings) {
    return (
      <div className="min-h-screen bg-[color:var(--color-background)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--color-primary)] mx-auto mb-4"></div>
          <p className="text-[color:var(--color-secondary-text)]">
            {isLoadingCampaign ? "Loading campaign..." : "Loading template..."}
          </p>
          {campaignError && (
            <p className="text-red-500 text-sm mt-2">{campaignError}</p>
          )}
        </div>
      </div>
    );
  }

  // Show submission form if requested
  if (showSubmissionForm) {
    return (
      <CampaignSubmissionForm
        campaignId={savedCampaignId}
        customPageSettings={customPageSettings}
        templateId={selectedTemplate?.id}
        campaignData={campaignData} // Pass campaign data for pre-filling
        onBack={handleBackToBuilder}
      />
    );
  }

  // Generate deterministic keys for each image slot
  const getImageKey = (slot) => {
    // Use campaignId if available, otherwise use draft UUID
    const id = savedCampaignId || getDraftUUID(selectedTemplate?.id);
    // slot: e.g., 'logo', 'main', 'hero', etc.
    return `${slot}-${id}.jpg`;
  };

  return (
    <div className="min-h-screen bg-[color:var(--color-background)] text-[color:var(--color-primary-text)] flex flex-col">
      {/* Notification */}
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={handleNotificationClose}
        duration={4000}
      />

      <BuilderHeader
        onBack={handleBack}
        onSaveAsDraft={handleSaveAsDraft}
        onSubmit={handleNext}
        isSaving={isSaving}
        isEditing={!!campaignId}
      />
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
            onImageMetadata={handleImageMetadata}
            getImageKey={getImageKey}
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
