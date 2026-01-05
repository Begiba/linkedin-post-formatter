import { useMemo } from "react";
import { extractHashtags } from "./extractHashtags";

export function useHashtagSuggestions(text: string) {
  return useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) return [];
    return extractHashtags(trimmed);
  }, [text]);
}
