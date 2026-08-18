export const computeKeywordMatchRatio = (text: string, keywords: Array<string>): number => {
  if (keywords.length === 0) {
    return 0;
  }

  const normalizedText = text.toLowerCase();
  const matchedCount = keywords.filter((keyword) =>
    normalizedText.includes(keyword.toLowerCase()),
  ).length;

  return matchedCount / keywords.length;
};
