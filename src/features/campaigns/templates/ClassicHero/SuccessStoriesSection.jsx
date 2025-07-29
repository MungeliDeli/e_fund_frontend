import React from "react";
import story1 from "./templateAssets/story1.jpg";
import story2 from "./templateAssets/story2.jpg";
import story3 from "./templateAssets/story3.jpg";

const defaultStories = [
  {
    title: "A Fresh Start",
    text: "Lost and without a home, our organization provided a safe place and the essential support needed to get back on my feet.",
    image: story1,
  },
  {
    title: "Family's New Beginning",
    text: "My children and I had nowhere to go, your organization welcomed us. You helped us find a new home and ensured my kids could continue their education.",
    image: story2,
  },
  {
    title: "Journey to Recovery",
    text: "Battling addiction, I found rock bottom. This organization offered not just shelter, but a path to recovery and vital connections to counseling.",
    image: story3,
  },
];

const SuccessStoriesSection = ({ config }) => {
  const section = config.sections?.find((s) => s.key === "successStories");
  if (!section?.visible) return null;
 const bgColor = config.theme.backgroundColor;
 const textColor = config.theme.textColor;
  const stories = section.content?.stories?.length
    ? section.content.stories
    : defaultStories;

  return (
    <section
      className="success-stories-section mb-4"
      style={{ background: bgColor, color: textColor }}
    >
      <div className="font-semibold mb-2">Success stories</div>
      <div className="flex flex-col gap-2">
        {stories.map((story, idx) => (
          <div
            key={story.title + idx}
            className="flex gap-2 p-2  rounded items-center"
          >
            <img
              src={story.image}
              alt={story.title}
              className="w-12 h-12 object-cover rounded"
            />
            <div className="flex-1">
              <div className="font-medium">{story.title}</div>
              <div className="text-xs  line-clamp-2"
              style={{opacity:0.8}}
              >
                {story.text}
              </div>
            </div>
            <button className="text-xs  underline whitespace-nowrap">
              see more
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SuccessStoriesSection;
