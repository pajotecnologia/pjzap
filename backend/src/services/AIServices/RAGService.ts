import fs from "fs";
import path from "path";

export const getRelevantContext = (userMessage: string, documentText: string, maxChars: number = 2000): string => {
  if (!documentText) return "";

  const paragraphs = documentText.split(/\n\s*\n/);
  const keywords = userMessage.toLowerCase().split(/\s+/).filter(w => w.length > 3);

  if (keywords.length === 0) {
    return documentText.slice(0, maxChars);
  }

  const scoredParagraphs = paragraphs.map(p => {
    const pLower = p.toLowerCase();
    let score = 0;
    keywords.forEach(kw => {
      if (pLower.includes(kw)) score += 1;
    });
    return { paragraph: p, score };
  });

  scoredParagraphs.sort((a, b) => b.score - a.score);

  let selectedContext = "";
  for (const item of scoredParagraphs) {
    if (item.score === 0 && selectedContext.length > 0) break;
    if ((selectedContext + item.paragraph).length > maxChars) break;
    selectedContext += item.paragraph + "\n\n";
  }

  return selectedContext.trim() || documentText.slice(0, maxChars);
};

export default getRelevantContext;
