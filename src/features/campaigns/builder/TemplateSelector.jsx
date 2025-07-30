import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiCheck } from "react-icons/fi";
import templates from "../templates/templateRegistry";

const TemplateSelector = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const navigate = useNavigate();

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
  };

  const handleNext = () => {
    if (selectedTemplate) {
      navigate("/campaign-builder", {
        state: { selectedTemplate: selectedTemplate.id },
      });
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-[color:var(--color-background)] text-[color:var(--color-primary-text)]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-[color:var(--color-primary)]">
            Create Your Campaign
          </h1>
          <p className="text-lg text-[color:var(--color-secondary-text)] max-w-2xl mx-auto">
            Choose a template to get started with your fundraising campaign.
            Each template is designed to help you tell your story and connect
            with donors effectively.
          </p>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`relative bg-[color:var(--color-surface)] rounded-lg p-2 cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
                selectedTemplate?.id === template.id
                  ? "border-[color:var(--color-primary)] shadow-lg"
                  : "border-transparent hover:border-[color:var(--color-muted)]"
              }`}
              onClick={() => handleTemplateSelect(template)}
            >
              {/* Selection Indicator */}
              {selectedTemplate?.id === template.id && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-[color:var(--color-primary)] rounded-full flex items-center justify-center">
                  <FiCheck className="text-white text-sm" />
                </div>
              )}

              {/* Template Preview Image */}
              <div className="w-full h-48 bg-[color:var(--color-muted)] rounded-lg mb-4 flex items-center justify-center">
                <div className="text-[color:var(--color-secondary-text)] text-center">
                  <div className="text-4xl mb-2">📄</div>
                  <div className="text-sm">Template Preview</div>
                </div>
              </div>

              {/* Template Info */}
              <h3 className="text-xl font-semibold mb-2 text-[color:var(--color-primary-text)]">
                {template.name}
              </h3>
              <p className="text-[color:var(--color-secondary-text)] text-sm leading-relaxed">
                {template.description}
              </p>

             
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-6 py-3 text-[color:var(--color-secondary-text)] hover:text-[color:var(--color-primary-text)] transition-colors"
          >
            <FiArrowLeft />
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={!selectedTemplate}
            className={`flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
              selectedTemplate
                ? "bg-[color:var(--color-primary)] text-white hover:bg-[color:var(--color-accent)] shadow-lg"
                : "bg-[color:var(--color-muted)] text-[color:var(--color-secondary-text)] cursor-not-allowed"
            }`}
          >
            Continue to Builder
            <FiArrowRight />
          </button>
        </div>

        {/* Selection Helper */}
        {!selectedTemplate && (
          <div className="text-center mt-8">
            <p className="text-[color:var(--color-secondary-text)]">
              Select a template above to continue
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateSelector;
