const STOPWORDS = new Set([
    "the", "and", "to", "of", "in", "a", "with", "for", "on", "is", "that", "this",
    "it", "as", "are", "be", "by", "from", "or", "an", "at", "your", "you"
]);

function extractPhrases(words: string[], maxWords = 3) {
    const phrases: string[] = [];

    for (let size = 2; size <= maxWords; size++) {
        for (let i = 0; i <= words.length - size; i++) {
            phrases.push(words.slice(i, i + size).join(" "));
        }
    }

    return phrases;
}

function toHashtag(phrase: string) {
    return (
        "#" +
        phrase
            .split(" ")
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join("")
    );
}

export function extractHashtags(text: string) {
    const cleaned = text
        .replace(/https?:\/\/\S+/g, "") // remove URLs
        .replace(/#\w+/g, "")           // remove existing hashtags
        .replace(/[^\w\s]/g, "")        // remove punctuation
        .toLowerCase();

    const words = cleaned
        .split(/\s+/)
        .filter(w => w.length > 3);

    const single = words.map(w => `#${w}`);

    const phrases = extractPhrases(words);
    const multi = phrases.map(toHashtag);

    // Deduplicate + LinkedIn-friendly limit
    return Array.from(new Set([...multi, ...single])).slice(0, 8);
}

export function extractHashtags2(
    text: string,
    maxTags = 8
): string[] {
    if (!text.trim()) return [];

    const words = text
        .toLowerCase()
        .replace(/https?:\/\/\S+/g, "") // remove URLs        
        .replace(/[^\w\s]/g, "")        // remove punctuation
        .split(/\s+/);

    const freq: Record<string, number> = {};

    for (const word of words) {
        if (word.length < 3) continue;
        if (STOPWORDS.has(word)) continue;
        freq[word] = (freq[word] || 0) + 1;
    }

    return Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, maxTags)
        .map(([word]) => `#${word}`);
}
