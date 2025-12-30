"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { Bold, Italic, Copy, Hash, RotateCcw } from "lucide-react";
import { track } from "@vercel/analytics";

const boldMap: Record<string, string> = { a: "𝗮", b: "𝗯", c: "𝗰", d: "𝗱", e: "𝗲", f: "𝗳", g: "𝗴", h: "𝗵", i: "𝗶", j: "𝗷", k: "𝗸", l: "𝗹", m: "𝗺", n: "𝗻", o: "𝗼", p: "𝗽", q: "𝗾", r: "𝗿", s: "𝘀", t: "𝘁", u: "𝘂", v: "𝘃", w: "𝘄", x: "𝘅", y: "𝘆", z: "𝘇" };
const italicMap: Record<string, string> = { a: "𝘢", b: "𝘣", c: "𝘤", d: "𝘥", e: "𝘦", f: "𝘧", g: "𝘨", h: "𝘩", i: "𝘪", j: "𝘫", k: "𝘬", l: "𝘭", m: "𝘮", n: "𝘯", o: "𝘰", p: "𝘱", q: "𝘲", r: "𝘳", s: "𝘴", t: "𝘵", u: "𝘶", v: "𝘷", w: "𝘸", x: "𝘹", y: "𝘺", z: "𝘻" };
const monoMap: Record<string, string> = { a: "𝚊", b: "𝚋", c: "𝚌", d: "𝚍", e: "𝚎", f: "𝚏", g: "𝚐", h: "𝚑", i: "𝚒", j: "𝚓", k: "𝚔", l: "𝚕", m: "𝚖", n: "𝚗", o: "𝚘", p: "𝚙", q: "𝚚", r: "𝚛", s: "𝚜", t: "𝚝", u: "𝚞", v: "𝚟", w: "𝚠", x: "𝚡", y: "𝚢", z: "𝚣" };

const templates = [
  { title: "Weekly Learnings", content: "This week I learned some amazing lessons:\n1. \n2. \n3. \n#learning #growth" },
  { title: "Project Launch", content: "Excited to announce the launch of my project:\n[Project Name]\nCheck it out! #launch #productivity" },
  { title: "Thank You Post", content: "I want to thank everyone who supported me:\n- \n- \n- \n#gratitude #community" }
];

const emojiCategories: Record<string, string[]> = {
  People: ["😀", "😎", "🤯", "👏", "❤️"],
  Objects: ["💡", "🚀", "⭐", "🔥", "✅", "⚡"],
  Nature: ["🌳", "🌸", "🌞", "🌈", "🍀"],
  Food: ["🍕", "🍔", "🍣", "🍎", "🍩"]
};

export default function LinkedInPostFormatter() {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("People");
  const [darkMode, setDarkMode] = useState(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem("darkMode") === "true";
    if (saved) document.documentElement.classList.add("dark");
    return saved;
  });

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("darkMode", next.toString());
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };

  const applyFormat = useCallback((map: Record<string, string>) => {
    const el = editorRef.current;
    if (!el) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    const formatted = selectedText.split("").map(c => map[c.toLowerCase()] ?? c).join("");


    range.deleteContents();
    range.insertNode(document.createTextNode(formatted));


    setText(el.innerText);
  }, []);

  const insertEmoji = (emoji: string) => {
    const el = editorRef.current;
    if (!el) return;
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);
    if (range) {
      range.deleteContents();
      range.insertNode(document.createTextNode(emoji));
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
      setText(el.innerText);
    }
    setShowEmojis(false);
    track('insert_emoji', { emoji });
  };

  const addHashtags = () => {
    setText(prev => prev + "\n\n#technology #softwareengineering #ai");
    track('add_hashtags');
  };

  const reset = () => {
    const el = editorRef.current;
    if (el) {
      el.innerText = '';
      setText('');
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    track('copy_post');
    setTimeout(() => setCopied(false), 2000);
  };

  const exportMarkdown = () => {
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "linkedin_post.md";
    link.click();
    URL.revokeObjectURL(url);
    track('export_markdown');
  };

  const exportPDF = async () => {
    if (!editorRef.current) return;
    const html2pdf = (await import('html2pdf.js')).default;


    const tempContainer = document.createElement('div');
    tempContainer.style.backgroundColor = darkMode ? '#1f2937' : '#ffffff';
    tempContainer.style.color = darkMode ? '#f9fafb' : '#111827';
    tempContainer.style.fontFamily = 'sans-serif';
    tempContainer.style.padding = '20px';
    tempContainer.style.width = '800px';
    tempContainer.style.whiteSpace = 'pre-wrap';
    tempContainer.style.lineHeight = '1.5';
    tempContainer.style.fontSize = '16px';
    tempContainer.textContent = text;


    document.body.appendChild(tempContainer);


    html2pdf()
      .set({ margin: 0.5, filename: 'linkedin_post.pdf', html2canvas: { scale: 2, useCORS: true, allowTaint: true, backgroundColor: darkMode ? '#1f2937' : '#ffffff' } })
      .from(tempContainer)
      .save()
      .finally(() => document.body.removeChild(tempContainer));


    track('export_pdf');
  };

  const exec = (command: string) => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();

    // Ensure cursor exists
    const selection = window.getSelection();
    const hasValidSelection =
      selection &&
      selection.rangeCount > 0 &&
      el.contains(selection.anchorNode);

      if (!hasValidSelection) {
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);

      selection?.removeAllRanges();
      selection?.addRange(range);
    }

    document.execCommand(command);
    setText(el.innerText); // update state
  };

  const categoryButtonClass = (cat: string) =>
    `px-2 py-1 rounded ${selectedCategory === cat
      ? "bg-blue-500 text-white"
      : "bg-gray-200 dark:bg-gray-700"
    }`;

  const charCount = text.length;
  const hashtagCount = (text.match(/#/g) || []).length;

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      switch (e.key.toLowerCase()) {
        case 'b': e.preventDefault(); applyFormat(boldMap); track('format_bold'); break;
        case 'i': e.preventDefault(); applyFormat(italicMap); track('format_italic'); break;
        case 'm': e.preventDefault(); applyFormat(monoMap); track('format_mono'); break;
        case 'z': e.preventDefault(); exec('undo'); break;
        case 'y': e.preventDefault(); exec('redo'); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [applyFormat]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-3xl shadow-lg bg-white dark:bg-gray-800">
        <CardContent className="p-6 space-y-4 text-black dark:text-white">
          <h1 className="text-xl font-semibold">LinkedIn Post Formatter</h1>
          <p className="text-sm text-muted-foreground">Creator tools optimized for LinkedIn reach.</p>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => { applyFormat(boldMap); track('format_bold'); }} title="Unicode Bold">B</Button>
            <Button size="sm" variant="outline" onClick={() => { applyFormat(italicMap); track('format_italic'); }} title="Unicode Italic">I</Button>
            <Button size="sm" variant="outline" onClick={() => { applyFormat(monoMap); track('format_mono'); }} title="Monospace">Mono</Button>
            <Button size="sm" variant="outline" onClick={addHashtags} title="Add hashtags">#</Button>
            <Button size="sm" variant="outline" onClick={() => setShowEmojis(v => !v)} title="Emoji picker">😊</Button>
            <Button size="sm" variant="outline" onClick={() => exec('undo')}>Undo</Button>
            <Button size="sm" variant="outline" onClick={() => exec('redo')}>Redo</Button>
            <Button size="sm" variant="outline" onMouseDown={(e) => e.preventDefault()} onClick={() => exec('insertOrderedList')}>• List</Button>
            <Button size="sm" variant="outline" onMouseDown={(e) => e.preventDefault()} onClick={() => exec('insertOrderedList')}>1. List</Button>
            <Button size="sm" variant="outline" onClick={reset} title="Reset">⟳</Button>
            <Button size="sm" variant="outline" onClick={toggleDarkMode} title="Toggle Dark Mode">{darkMode ? "🌙" : "☀️"}</Button>
          </div>

          {/* Templates Panel */}
          <div className="flex flex-wrap gap-2 mt-2">
            {templates.map(t => (
              <Button key={t.title} size="sm" variant="secondary" onClick={() => { setText(prev => prev + "\n\n" + t.content); track('insert_template', { template: t.title }); }}>{t.title}</Button>
            ))}
          </div>

          {/* Emoji Picker with Categories */}
          {showEmojis && (
            <>
              <div className="flex gap-2 mt-2 flex-wrap">
                {Object.keys(emojiCategories).map(cat => (
                  <button key={cat} className={categoryButtonClass(cat)} onClick={() => setSelectedCategory(cat)}>{cat}</button>
                ))}
              </div>
              <div className="grid grid-cols-8 gap-2 mt-2">
                {emojiCategories[selectedCategory].map(e => (
                  <button key={e} onClick={() => insertEmoji(e)} className="text-xl hover:scale-125 transition-transform">{e}</button>
                ))}
              </div>
            </>
          )}

          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            className="editor"
            onInput={(e: React.FormEvent<HTMLDivElement>) =>
              setText((e.currentTarget).innerText)
            }
            data-placeholder="Write your LinkedIn post here..."
          ></div>

          <div className="flex gap-2 mt-2">
            <Button size="sm" variant="outline" onClick={exportMarkdown}>Export .MD</Button>
            <Button size="sm" variant="outline" onClick={exportPDF}>Export PDF</Button>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{charCount} characters · {hashtagCount} hashtags</span>
            <span className={charCount > 210 ? "text-orange-600" : ""}>{charCount > 210 ? "‘See more’ will appear" : "Below LinkedIn fold"}</span>
          </div>

          <div className="flex justify-end">
            <Button onClick={copyToClipboard} className="flex gap-2">Copy {copied ? "✔" : "📋"}</Button>
          </div>

          <div className="mt-4 text-xs text-muted-foreground text-right">
            Built by <a href="https://github.com/YOUR_USERNAME" className="underline hover:text-blue-600" target="_blank" rel="noreferrer">BegiBa</a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
