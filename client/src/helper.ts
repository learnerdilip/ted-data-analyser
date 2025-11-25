import type { Notice } from "./types";

export const getTedLink = (notice: Notice): string | undefined => {
  if (!notice.links?.html) return undefined;

  // 1. Try English
  if (notice.links.html["ENG"]) return notice.links.html["ENG"];
  // 2. Try German
  if (notice.links.html["DEU"]) return notice.links.html["DEU"];

  // 3. Fallback: Take the first available link
  const availableLinks = Object.values(notice.links.html);
  if (availableLinks.length > 0) return availableLinks[0];

  return undefined;
};
