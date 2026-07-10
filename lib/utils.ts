export const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
export const randomItem = <T,>(items: T[]): T | undefined => items[Math.floor(Math.random() * items.length)];
