export type FormatStyle = {
  map: Record<string, string>;
  reverse: Record<string, string>;
};

export const makeReverseMap = (map: Record<string, string>) =>
  Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k]));