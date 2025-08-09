import React, { useState, useEffect } from "react";
import { getTemplateWithConfig } from "../templates/templateRegistry";

function PreviewCollapse({ templateId, customPageSettings }) {
  const [open, setOpen] = useState(false);
  const [TemplateComp, setTemplateComp] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !templateId) return;
    let isMounted = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const tpl = await getTemplateWithConfig(templateId);
        // Dynamic import of template component by id
        let Comp = null;
        if (templateId === "classic-hero") {
          const mod = await import(
            "../templates/ClassicHero/ClassicHeroTemplate.jsx"
          );
          Comp = mod.default;
        } else if (templateId === "modern-impact") {
          const mod = await import("../templates/ModernImpact/config.js");
          // No component yet; skip render if unsupported
          Comp = null;
        }
        if (isMounted) {
          setConfig({ ...(tpl?.config || {}), ...(customPageSettings || {}) });
          setTemplateComp(() => Comp);
        }
      } catch (e) {
        if (isMounted) setError(e.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [open, templateId, customPageSettings]);

  return (
    <div className="mt-4">
      <button
        type="button"
        className="px-4 py-2 rounded-lg border border-[color:var(--color-muted)] bg-[color:var(--color-surface)] text-[color:var(--color-primary-text)] hover:bg-[color:var(--color-muted)]"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Hide Preview" : "Preview Page"}
      </button>
      {open && (
        <div className="mt-4 rounded-xl border border-[color:var(--color-muted)] overflow-hidden">
          {loading && (
            <div className="p-6 text-center text-[color:var(--color-secondary-text)]">
              Loading preview...
            </div>
          )}
          {error && (
            <div className="p-6 text-center text-red-500">
              Failed to load preview: {error}
            </div>
          )}
          {!loading && !error && TemplateComp && (
            <div className="bg-white">
              <TemplateComp config={config} />
            </div>
          )}
          {!loading && !error && !TemplateComp && (
            <div className="p-6 text-center text-[color:var(--color-secondary-text)]">
              Template preview not available.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PreviewCollapse;
