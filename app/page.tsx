"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Underline, List, ListOrdered, SquarePen, Eye, Undo, Redo, RotateCw } from "lucide-react";
import Image from 'next/image'
import avatar from '../public/avatar.png';
import { track } from "@vercel/analytics";
import { monoStyle, boldStyle, italicStyle } from "./components/BoldMap";
import { useHashtagSuggestions } from "./useHashtagSuggestions";
// const templates = [
//   { title: "Weekly Learnings", content: "This week I learned some amazing lessons:\n1. \n2. \n3. \n#learning #growth" },
//   { title: "Project Launch", content: "Excited to announce the launch of my project:\n[Project Name]\nCheck it out! #launch #productivity" },
//   { title: "Thank You Post", content: "I want to thank everyone who supported me:\n- \n- \n- \n#gratitude #community" }
// ];

const emojiCategories: Record<string, string[]> = {
  Objects: ["💡", "🚀", "⭐", "🔥", "✅", "⚡"],
  Nature: ["🌳", "🌸", "🌞", "🌈", "🍀", "🦄"],
  Food: ["🍕", "🍔", "🍣", "🍎", "🍩"],
  // GROWTH & SUCCESS: For milestones, results, and startups
  Growth: ["🚀", "📈", "🏆", "🎯", "💯", "🔥", "💎", "🌟", "🔝", "💰"],

  // ACTION & ATTENTION: For hooks and CTAs (Call to Actions)
  Attention: ["📢", "💡", "🚨", "✨", "👀", "👇", "👉", "🔗", "✅", "☑️", "🔲", "🔳", "⚪️", "🔘", "⚠️"],

  // OFFICE & PROFESSIONAL: Standard business environment
  Business: ["💼", "💻", "📊", "🗓️", "📝", "🏢", "🤝", "🎙️", "📚", "🧠"],

  // LISTS & STRUCTURE: Used instead of standard bullet points
  Structure: ["🔹", "♦️", "📍", "📌", "✔️", "❌", "▪️", "◈", "➖", "▶️", "🚩", "⚡"],

  // PEOPLE & COMMUNITY: For networking and team wins
  People: ["😀", "😎", "🤯", "😶", "😃", "🙌", "👏", "🤝", "👥", "🗣️", "🙏", "🤳", "👩‍💻", "👨‍💼", "🥳"],

  // CELEBRATION & POSITIVITY: For announcements
  Celebration: ["🎉", "🎊", "✨", "🎈", "🥂", "🥇", "💖", "🌈", "☀️", "✅"]
};

export default function LinkedInPostEditor() {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [text, setText] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("People");
  const [darkMode, setDarkMode] = useState(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem("darkMode") === "true";
    if (saved) document.documentElement.classList.add("dark");
    return saved;
  });
  const underlineChar = "\u0332";

  const BULLET = "•";
  const NUMBER_REGEX = /^\d+\.\s+/;
  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);
  const canUndo = undoStack.current.length > 0;
  const canRedo = redoStack.current.length > 0;
  const [, forceUpdate] = useState(0);
  const hashtags = useHashtagSuggestions(text);
  const isComposingRef = useRef(false);

  // Call refreshUI() after any operation that changes history.
  const refreshUI = () => {
    forceUpdate(v => v + 1);
  };

  const splitLines = (text: string) => text.split("\n");

  const isBulletLine = (line: string) =>
    line.trim().startsWith(`${BULLET} `);

  const isNumberedLine = (line: string) =>
    NUMBER_REGEX.test(line.trim());

  // Capture editor state (core logic)
  // Call this before any change.
  const saveSnapshot = useCallback(() => {
    const text = editorRef.current?.innerText ?? "";
    undoStack.current.push(text);
    redoStack.current = []; // invalidate redo
    refreshUI();
  }, []);

  // Restore state safely
  const restoreText = (text: string) => {
    const el = editorRef.current;
    if (!el) return;

    el.innerText = text;
    setText(text);

    // place cursor at end
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);

    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  };


  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return;

    const current = editorRef.current?.innerText ?? "";
    redoStack.current.push(current);

    const prev = undoStack.current.pop();
    if (prev !== undefined) {
      restoreText(prev);
    }
    refreshUI();
  }, []);

  const redo = useCallback(() => {

    if (redoStack.current.length === 0) return;

    const current = editorRef.current?.innerText ?? "";
    undoStack.current.push(current);

    const next = redoStack.current.pop();
    if (next !== undefined) {
      restoreText(next);
    }
    refreshUI();
  }, []);

  // Never start editor with empty inline nodes. 
  // If editor is empty, initialize it once:
  // This ensures the cursor always lives inside a real text node.
  useEffect(() => {
    if (editorRef.current?.innerHTML === "") {
      editorRef.current.innerHTML = "\n";
    }
  }, []);

  // useEffect(() => {
  //   const el = editorRef.current;
  //   if (!el) return;

  //   const handleKeyDown = (e: KeyboardEvent) => {
  //     // Check for Enter key
  //     if (e.key === "Enter" && !e.isComposing) {
  //       e.preventDefault();

  //       const selection = window.getSelection();
  //       const range = selection?.getRangeAt(0);

  //       if (range) {
  //         // 1. Create a <br> element
  //         const br = document.createElement("br");

  //         // 2. We also need a "Zero Width Space" or another <br> if we are at the end
  //         // to ensure the cursor actually moves to the next line visually
  //         const extraBr = document.createElement("br");

  //         range.deleteContents();
  //         range.insertNode(br);

  //         // 3. Position the cursor AFTER the first <br>
  //         range.setStartAfter(br);
  //         range.setEndAfter(br);

  //         // 4. Force selection update
  //         selection?.removeAllRanges();
  //         selection?.addRange(range);

  //         // Update your state
  //         // const text = el.innerText ?? "";
  //         // setText(text);
  //         // refreshUI();
  //       }
  //     }
  //   };

  //   // el.addEventListener("keydown", handleKeyDown);
  //   // return () => { el.removeEventListener("keydown", handleKeyDown) };
  // }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("darkMode", next.toString());
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };

  const normalizeEditor = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;

    const text = el.innerText; // flattens divs → \n
    el.innerText = text;
  }, []);

  const isFormattedText = (
    text: string,
    reverseMap: Record<string, string>
  ) => {
    for (const ch of text) {
      if (reverseMap[ch]) return true;
    }
    return false;
  };

  const transformText = useCallback((
    text: string,
    map: Record<string, string>,
    reverseMap: Record<string, string>
  ) => {
    const shouldApply = !isFormattedText(text, reverseMap);

    return [...text].map(char => {
      if (shouldApply) {
        return map[char] ?? char;
      }
      return reverseMap[char] ?? char;
    }).join("");
  }, [  ]);


  const applyFormat = useCallback((
    map: Record<string, string>,
    reverseMap: Record<string, string>
  ) => {
    const el = editorRef.current;
    if (!el) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const selectedText = selection.toString();
    const formatted = transformText(selectedText, map, reverseMap);
    // const formatted = selectedText
    //   .split(/\r?\n/)
    //   .map(line =>
    //     [...line].map(c => map[c] ?? c).join("")
    //   )
    //   .join("\n");

    range.deleteContents();
    const node = document.createTextNode(formatted);
    range.insertNode(node);

    setText(el.innerText);

    // Restore cursor
    range.setStartAfter(node);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }, [transformText]);

  const toggleUnderline = (text: string) => {
    const hasUnderline = text.includes(underlineChar);

    if (hasUnderline) {
      return text.replaceAll(underlineChar, "");
    }

    return [...text].map(c =>
      c === "\n" ? c : c + underlineChar
    ).join("");
  };

  const applyUnderline = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const seltext = selection.toString();
    const range = selection.getRangeAt(0);

    range.deleteContents();
    range.insertNode(
      document.createTextNode(toggleUnderline(seltext))
    );
  }, []);

  const replaceSelection = (
    selection: Selection,
    text: string
  ) => {
    const range = selection.getRangeAt(0);

    range.deleteContents();
    const node = document.createTextNode(text);
    range.insertNode(node);

    range.setStartAfter(node);
    range.collapse(true);

    selection.removeAllRanges();
    selection.addRange(range);
  };

  const toggleBulletList = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const text = sel.toString();
    if (!text) return;

    const lines = splitLines(text);

    const shouldRemove = lines.every(
      line => line.trim() === "" || isBulletLine(line)
    );

    const transformed = lines.map(line => {
      if (line.trim() === "") return line;

      return shouldRemove
        ? line.replace(/^(\s*)•\s+/, "$1")
        : `• ${line}`;
    }).join("\n");

    replaceSelection(sel, transformed);
  };

  const toggleNumberedList = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const text = sel.toString();
    if (!text) return;

    const lines = splitLines(text);

    const shouldRemove = lines.every(
      line => line.trim() === "" || isNumberedLine(line)
    );

    let index = 1;

    const transformed = lines.map(line => {
      if (line.trim() === "") return line;

      return shouldRemove
        ? line.replace(/^\s*\d+\.\s+/, "")
        : `${index++}. ${line}`;
    }).join("\n");

    replaceSelection(sel, transformed);
  };

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

  // Auto-resize editor
  const autoResize = (el: HTMLDivElement) => {
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  const categoryButtonClass = (cat: string) =>
    `px-2 py-1 rounded ${selectedCategory === cat
      ? "bg-blue-500 text-white"
      : "bg-gray-200 dark:bg-gray-700"
    }`;

  const reset = () => {
    const el = editorRef.current;
    if (!el) return;

    // Save current state so undo works
    undoStack.current.push(el.innerText);

    // Clear editor
    el.innerText = "";
    setText("");
    // Reset redo history
    redoStack.current = [];

    // Place cursor at start
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(true);

    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);

    refreshUI();
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
    // 1. ADD THIS: This prevents the element from using modern color spaces
    tempContainer.style.colorScheme = 'light';

    // 2. Explicitly override any inherited CSS variables that use 'lab' or 'oklch'
    // Most Next.js/Tailwind setups use these variable names:
    tempContainer.style.setProperty('--background', darkMode ? '#1f2937' : '#ffffff');
    tempContainer.style.setProperty('--foreground', darkMode ? '#f9fafb' : '#111827');

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

    console.log(tempContainer);
    html2pdf()
      .set({
        margin: 0.5,
        filename: 'linkedin_post.pdf',
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: darkMode ? '#1f2937' : '#ffffff',
          ignoreElements: (el: HTMLElement) => el.tagName === 'STYLE' || el.tagName === 'LINK'
        }
      })
      .from(tempContainer)
      .save()
      .finally(() => document.body.removeChild(tempContainer));


    track('export_pdf');
  };

  // Copy text for LinkedIn
  const copyToClipboard = async () => {
    if (!editorRef.current) return;
    await navigator.clipboard.writeText(editorRef.current.innerText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  function insertPlainText(text: string) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    range.deleteContents();

    const fragment = document.createDocumentFragment();
    const lines = text.split(/\r?\n/);

    lines.forEach((line, index) => {
      fragment.appendChild(document.createTextNode(line));
      if (index < lines.length - 1) {
        fragment.appendChild(document.createElement("br"));
      }
    });

    range.insertNode(fragment);

    // Move cursor to the end of pasted content
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    refreshUI();
  }



  const insertTextAtCursor = (text: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    saveSnapshot();
    const range = selection.getRangeAt(0);
    range.deleteContents();

    const node = document.createTextNode(text);
    range.insertNode(node);

    // Move cursor AFTER inserted text
    range.setStartAfter(node);
    range.setEndAfter(node);
    selection.removeAllRanges();
    selection.addRange(range);
  }
  // const addTemplate = (content: string)=>{
  //   const el = editorRef.current;
  //   if (!el) return;
  //   setText(prev => prev + "\n\n" + content);
  //   autoResize(el.parentElement as HTMLDivElement);

  // }

  const lastText = useRef("");

  const onInput = (e: React.FormEvent<HTMLDivElement>) => {
    console.log("INPUT HANDLER CALLED");
    const el = e.currentTarget;
    const text = editorRef.current?.innerText ?? "";
    if (text !== lastText.current) {
      undoStack.current.push(lastText.current);
      lastText.current = text;
      redoStack.current = [];
    }
    setText(text);
    autoResize(el);
  };

  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    console.log("PASTE HANDLER CALLED");
    e.preventDefault();
    e.stopPropagation();

    const text =
      e.clipboardData.getData("text/plain") ||
      e.clipboardData.getData("text");

    insertPlainText(text);
  }

  const charCount = (editorRef.current?.innerText ?? "").length;
  const hashtagCount = ((editorRef.current?.innerText ?? "").match(/#/g) || []).length;
 
  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          saveSnapshot();
          if (isComposingRef.current) return;
          applyFormat(boldStyle.map, boldStyle.reverse);
          normalizeEditor();
          track('format_bold');
          break;
        case 'i':
          e.preventDefault();
          saveSnapshot();
          if (isComposingRef.current) return;
          applyFormat(italicStyle.map, italicStyle.reverse);
          normalizeEditor();
          track('format_italic');
          break;
        case 'u':
          e.preventDefault();
          saveSnapshot();
          if (isComposingRef.current) return;
          applyUnderline();
          track('format_underline');
          break;
        case 'm':
          e.preventDefault();
          saveSnapshot();
          if (isComposingRef.current) return;
          applyFormat(monoStyle.map, monoStyle.reverse);
          track('format_mono');
          break;
        case 'z':
          e.preventDefault();
          if (undoStack.current.length === 0) return;
          undo();
          break;
        case 'y':
          e.preventDefault();
          if (redoStack.current.length === 0) return;
          redo();
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [applyFormat, applyUnderline, normalizeEditor, saveSnapshot, undo, redo]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-50 p-4">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardContent className="p-6 space-y-4">
          <h1 className="text-xl font-semibold">LinkedIn Post Editor</h1>

          {/* Toolbar */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              title="Bold (Ctrl+B)/(Cmd+B)"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                saveSnapshot();
                if (isComposingRef.current) return;
                applyFormat(boldStyle.map, boldStyle.reverse);
                normalizeEditor();
                track('format_bold');
              }}
            >
              <Bold size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              title="Italic (Ctrl+I)/(Cmd+I)"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                saveSnapshot();
                if (isComposingRef.current) return;
                applyFormat(italicStyle.map, italicStyle.reverse);
                normalizeEditor();
                track('format_italic');
              }}
            >
              <Italic size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              title="Underline (Ctrl+U)/(Cmd+U)"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                saveSnapshot();
                if (isComposingRef.current) return;
                applyUnderline();
                track('format_underline');
              }}
            >
              <Underline size={16} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                saveSnapshot();
                if (isComposingRef.current) return;
                applyFormat(monoStyle.map, monoStyle.reverse);
                track('format_mono');
              }}
              title="Monospace (Ctrl+M)/(Cmd+M)"
            >
              Mono
            </Button>
            <Button
              variant="outline"
              size="sm"
              title="Unordered List"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                saveSnapshot();
                if (isComposingRef.current) return;
                toggleBulletList();
                track('format_unordered_list');
              }}
            >
              <List />
            </Button>
            <Button
              variant="outline"
              size="sm"
              title="Ordered List"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                saveSnapshot();
                if (isComposingRef.current) return;
                toggleNumberedList();
                track('format_ordered_list');
              }}
            >
              <ListOrdered />
            </Button>
            {/* <Button
              size="sm"
              variant="outline"
              onClick={() => { saveSnapshot(); addHashtags(); track('add_hashtags'); }}
              title="Add hashtags"
            >
              #
            </Button> */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowEmojis(v => !v)}
              title="Emoji picker"
            >
              😊
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => undo()}
              title="Undo (Ctrl+Z)/(Cmd+Z)"
              disabled={!canUndo}
              className={!canUndo ? "opacity-40 cursor-not-allowed" : ""}
            >
              <Undo />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => redo()}
              title="Redo (Ctrl+Y)/(Cmd+Y)"
              disabled={!canRedo}
              className={!canRedo ? "opacity-40 cursor-not-allowed" : ""}
            >
              <Redo />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={reset}
              title="Reset"
              disabled={text.length === 0}
            >
              <RotateCw />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={toggleDarkMode}
              title="Toggle Dark Mode"
            >
              {darkMode ? "🌙" : "☀️"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              title={previewMode ? "Edit Mode" : "Preview Mode"}
              onClick={() => setPreviewMode(!previewMode)}
            >
              {previewMode ? <SquarePen /> : <Eye />}
            </Button>
          </div>

          {/* Templates Panel */}
          {/* <div className="flex flex-wrap gap-2 mt-2">
            {templates.map(t => (
              <Button 
                key={t.title} size="sm" variant="secondary" 
                onClick={() => { 
                  //setText(prev => prev + "\n\n" + t.content); 
                  addTemplate(t.content);
                  track('insert_template', { template: t.title }); 
                }}>
                  {t.title}
                </Button>
            ))}
          </div> */}
          {/* hashtag Panel */}
          {hashtags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {hashtags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  className="px-2 py-1 text-sm bg-gray-100 rounded hover:bg-blue-100"
                  onClick={() => {
                    editorRef.current?.focus();
                    if (isComposingRef.current) return;
                    insertTextAtCursor(` ${tag}`);
                    setText(editorRef.current!.innerText);
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* Emoji Picker with Categories */}
          {showEmojis && (
            <>
              <div className="flex gap-2 mt-2 flex-wrap">
                {Object.keys(emojiCategories).map(cat => (
                  <button
                    key={cat}
                    className={categoryButtonClass(cat)}
                    onClick={() => setSelectedCategory(cat)}>{cat}</button>
                ))}
              </div>
              <div className="grid grid-cols-8 gap-2 mt-2">
                {emojiCategories[selectedCategory].map(e => (
                  <button key={e} onClick={() => {
                    saveSnapshot();
                    if (isComposingRef.current) return;
                    insertEmoji(e)
                  }} className="text-xl hover:scale-125 transition-transform">{e}</button>
                ))}
              </div>
            </>
          )}

          <div className="relative w-full min-h-[260px]">
            <div
              className={`transition-opacity duration-200 ${previewMode ? "opacity-0 pointer-events-none absolute inset-0" : "opacity-100"
                }`}
            >
              {/* Editor / Preview */}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                className="editor w-full min-h-[220px] p-3 border rounded-md 
                          focus:outline-none focus:ring-2 focus:ring-blue-500 
                          whitespace-pre-wrap wordbreak-break-word overflow-y-auto"
                data-placeholder="Write your LinkedIn post here..."
                onCompositionStart={() => {
                  isComposingRef.current = true;
                }}
                onCompositionEnd={(e) => {
                  isComposingRef.current = false;
                  // ✅ Now it is safe to read text
                  setText(e.currentTarget.innerText);
                  saveSnapshot(); // optional, but correct place
                }}
                onInput={onInput}
                onPaste={handlePaste}
              />
            </div>
            <div
              className={`transition-opacity duration-200 ${previewMode ? "opacity-100" : "opacity-0 pointer-events-none absolute inset-0"
                }`}
            >
              <div className="w-full min-h-[260px] p-4 border rounded-md bg-gray-50 overflow-y-auto">
                {/* LinkedIn-style card */}
                <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <Image
                      src={avatar}
                      className="w-10 h-10 rounded-full"
                      alt="avatar"
                      width={40} // Matches the className width
                      height={40} // Matches the className height
                    />
                    <div>
                      <p className="font-semibold text-gray-900">HiHi24x7 • 2nd</p>
                      <p className="text-sm text-gray-500">
                        WellBeing at Best | Helping you grow within yourself!
                      </p>
                      <p className="text-xs text-gray-400">12h • 🌎︎</p>
                    </div>
                  </div>

                  {/* Post content */}
                  <div className="text-gray-900 mb-3 whitespace-pre-wrap">
                    {text}
                  </div>

                  {/* Reactions */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <span>❤️</span>
                      <span>57</span>
                    </div>
                    <div className="flex gap-2">
                      <span>24 comments</span>
                      <span>•</span>
                      <span>6 reposts</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex justify-between text-gray-500 border-t border-gray-200 pt-2">
                    <button className="flex items-center gap-1 hover:text-gray-900">
                      Like
                    </button>
                    <button className="flex items-center gap-1 hover:text-gray-900">
                      Comment
                    </button>
                    <button className="flex items-center gap-1 hover:text-gray-900">
                      Repost
                    </button>
                    <button className="flex items-center gap-1 hover:text-gray-900">
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
            Built by <a href="https://github.com/BegiBa" className="underline hover:text-blue-600" target="_blank" rel="noreferrer">Began BALAKRISHNAN</a>
            {/* https://www.linkedin.com/in/began-balakrishnan-0a20b221/ */}
            {/* https://github.com/BegiBa */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
