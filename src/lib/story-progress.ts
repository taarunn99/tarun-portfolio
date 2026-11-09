/**
 * Progress (0 to 1) through a pinned scroll story: 0 when the story's top
 * reaches the top of the viewport, 1 when its sticky stage is about to
 * release. Shared by the CSS driver (motion/StoryScroll) and the WebGL
 * scenes so the captions and the 3D model never disagree.
 */
export function storyProgress(story: Element): number {
  const rect = story.getBoundingClientRect();
  const travel = rect.height - window.innerHeight;
  if (travel <= 0) return 0;
  const p = -rect.top / travel;
  return p < 0 ? 0 : p > 1 ? 1 : p;
}

export const STORY_SELECTOR = "[data-story]";
