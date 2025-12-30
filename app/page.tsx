"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Copy, Hash, Smile, RotateCcw } from "lucide-react";
import { track } from "@vercel/analytics";

const boldMap: Record<string, string> = {
  a: "𝗮", b: "𝗯", c: "𝗰", d: "𝗱", e: "𝗲", f: "𝗳", g: "𝗴", h: "𝗵", i: "𝗶", j: "𝗷",
  k: "𝗸", l: "𝗹", m: "𝗺", n: "𝗻", o: "𝗼", p: "𝗽", q: "𝗾", r: "𝗿", s: "𝘀",
  t: "𝘁", u: "𝘂", v: "𝘃", w: "𝘄", x: "𝘅", y: "𝘆", z: "𝘇",
};

const italicMap: Record<string, string> = {
  a: "𝘢", b: "𝘣", c: "𝘤", d: "𝘥", e: "𝘦", f: "𝘧", g: "𝘨", h: "𝘩", i: "𝘪", j: "𝘫",
  k: "𝘬", l: "𝘭", m: "𝘮", n: "𝘯", o: "𝘰", p: "𝘱", q: "𝘲", r: "𝘳", s: "𝘴",
  t: "𝘵", u: "𝘶", v: "𝘷", w: "𝘸", x: "𝘹", y: "𝘺", z: "𝘻",
};

const monoMap: Record<string, string> = {
  a: "𝚊", b: "𝚋", c: "𝚌", d: "𝚍", e: "𝚎", f: "𝚏", g: "𝚐", h: "𝚑", i: "𝚒", j: "𝚓",
  k: "𝚔", l: "𝚕", m: "𝚖", n: "𝚗", o: "𝚘", p: "𝚙", q: "𝚚", r: "𝚛", s: "𝚜",
  t: "𝚝", u: "𝚞", v: "𝚟", w: "𝚠", x: "𝚡", y: "𝚢", z: "𝚣",
};

const emojis = ["🔥", "🚀", "💡", "⭐", "✅", "⚡", "🤯", "👏", "🎯"];

function transform(text: string, map: Record<string, string>) {
  return text
    .split("")
    .map((c) => map[c.toLowerCase()] ?? c)
    .join("");
}

export default function LinkedInPostFormatter() {
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [text, setText] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);

  const applyFormat = useCallback((map: Record<string, string>) => {
    const el = editorRef.current;
    if (!el) return;

    const start = el.selectionStart ?? text.length;
    const end = el.selectionEnd ?? text.length;

    const selected = text.slice(start, end);
    const formatted = transform(selected, map);
    const next = text.slice(0, start) + formatted + text.slice(end);

    setText(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start, start + formatted.length);
    });
  }, [text]);

  const insertEmoji = (emoji: string) => {
    const el = editorRef.current;
    if (!el) return;

    const start = el.selectionStart ?? text.length;
    const end = el.selectionEnd ?? text.length;

    const next = text.slice(0, start) + emoji + text.slice(end);
    setText(next);

    requestAnimationFrame(() => {
      el.focus();
      const pos = start + emoji.length;
      el.setSelectionRange(pos, pos);
    });

    setShowEmojis(false);
    track('insert_emoji', { emoji }); // <- new event
  };

  const addHashtags = () => {
    setText((prev) => prev + "\n\n#technology #softwareengineering #ai");
    track('add_hashtags'); // <- new event tracking
  };

  const reset = () => setText("");

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    track('copy_post'); // <- new event tracking
    setTimeout(() => setCopied(false), 2000);
  };

  const charCount = text.length;
  const hashtagCount = (text.match(/#/g) || []).length;

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;

      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          applyFormat(boldMap);
          break;
        case 'i':
          e.preventDefault();
          applyFormat(italicMap);
          break;
        case 'm':
          e.preventDefault();
          applyFormat(monoMap);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [applyFormat]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardContent className="p-6 space-y-4">
          <h1 className="text-xl font-semibold">LinkedIn Post Formatter</h1>
          <p className="text-sm text-muted-foreground">
            Creator tools optimized for LinkedIn reach.
          </p>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => {applyFormat(boldMap); track('format_bold');}} title="Unicode Bold"><Bold size={16} /></Button>
            <Button size="sm" variant="outline" onClick={() => {applyFormat(italicMap); track('format_italic');}} title="Unicode Italic"><Italic size={16} /></Button>
            <Button size="sm" variant="outline" onClick={() => {applyFormat(monoMap); track('format_mono');}} title="Monospace">Mono</Button>
            <Button size="sm" variant="outline" onClick={addHashtags} title="Add hashtags"><Hash size={16} /></Button>
            <Button size="sm" variant="outline" onClick={() => setShowEmojis((v) => !v)} title="Emoji picker"><Smile size={16} /></Button>
            <Button size="sm" variant="outline" onClick={reset} title="Reset"><RotateCcw size={16} /></Button>
          </div>

          {showEmojis && (
            <div className="flex gap-2 flex-wrap">
              {emojis.map((e) => (
                <button key={e} onClick={() => insertEmoji(e)} className="text-xl">{e}</button>
              ))}
            </div>
          )}

          <textarea
            ref={editorRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[260px] w-full border rounded-md p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write your LinkedIn post here..."
          />

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{charCount} characters · {hashtagCount} hashtags</span>
            <span className={charCount > 210 ? "text-orange-600" : ""}>
              {charCount > 210 ? "‘See more’ will appear" : "Below LinkedIn fold"}
            </span>
          </div>

          <div className="flex justify-end">
            <Button onClick={copyToClipboard} className="flex gap-2">
              <Copy size={16} /> {copied ? "Copied!" : "Copy for LinkedIn"}
            </Button>
          </div>
          <div className="mt-4 text-xs text-muted-foreground text-right">
            Built by <a href="https://github.com/YOUR_USERNAME" className="underline hover:text-blue-600" target="_blank" rel="noreferrer">BegiBa</a>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
