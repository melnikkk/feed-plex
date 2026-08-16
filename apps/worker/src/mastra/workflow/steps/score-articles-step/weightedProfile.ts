export const weightedAverage = <T extends { weight: number }>(
  items: Array<T>,
  scoreForItem: (item: T) => number,
): number => {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);

  if (totalWeight === 0) {
    return 0;
  }

  const weightedSum = items.reduce(
    (sum, item) => sum + item.weight * scoreForItem(item),
    0,
  );

  return weightedSum / totalWeight;
};
