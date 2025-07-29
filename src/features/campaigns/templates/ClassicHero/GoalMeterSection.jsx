import React from "react";

const GoalMeterSection = ({ config }) => {
  const section = config.sections?.find((s) => s.key === "goalMeter");
  // If not present in config, use fallback values
  const visible = section?.visible ?? true;
  if (!visible) return null;
  const bgColor = config.theme.backgroundColor;
  const textColor = config.theme.textColor;
  const accentColor = config.theme.accentColor;
  const raised = section?.content?.raised;
  const goal = section?.content?.goal;
  const percent = Math.min(100, (raised / goal) * 100);

  return (
    <section
      className="goal-meter-section mb-4"
      style={{ background: bgColor, color: textColor }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold">K{raised} raised</span>
        <span className=" text-sm">of K{goal}</span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-3  rounded-full transition-all duration-300"
          style={{ width: percent + "%", background: accentColor }}
        />
      </div>
    </section>
  );
};

export default GoalMeterSection;
