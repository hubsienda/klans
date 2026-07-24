let sequence = 0;

export const uid = (prefix = 'id'): string => {
  sequence += 1;
  return `${prefix}-${Date.now().toString(36)}-${sequence.toString(36)}`;
};

export const shuffle = <T,>(items: readonly T[]): T[] => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
};

export const randomItem = <T,>(items: readonly T[]): T | undefined =>
  items.length > 0 ? items[Math.floor(Math.random() * items.length)] : undefined;
