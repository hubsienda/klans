let sequence = 0;

export const uid = (prefix: string): string => {
  sequence += 1;
  return `${prefix}-${Date.now().toString(36)}-${sequence.toString(36)}`;
};

export const shuffle = <T>(items: T[], rng: () => number = Math.random): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const randomItem = <T>(items: T[], rng: () => number = Math.random): T | undefined => {
  if (items.length === 0) return undefined;
  return items[Math.floor(rng() * items.length)];
};
