"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import Link from "@tiptap/extension-link";
import TurndownService from "turndown";
import { marked } from "marked";
import { EditorToolbar } from "./editor-toolbar";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  editable?: boolean;
}

export function Editor({ value, onChange, editable = true }: EditorProps) {
  // Initialize Turndown for HTML -> Markdown conversion
  const turndownService = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3], // Only allow H1, H2, H3
        },
      }),
      Placeholder.configure({
        placeholder: "Write something amazing...",
      }),
      Typography,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-4",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const markdown = turndownService.turndown(html);
      onChange(markdown);
    },
    editable,
    immediatelyRender: false,
  });

  // Sync content from prop when it changes externally (e.g. initial load)
  useEffect(() => {
    if (!editor) return;

    // Provide a way to compare if content drastically changed to avoid loops
    // Ideally we just check if it's empty to load initial state
    const currentContent = turndownService.turndown(editor.getHTML());

    // Only set content if the editor seems empty/different and we have a value
    // This is a naive check. For a robust controlled component we'd need deeper diffing,
    // but for this form usage (mostly write-only or load-once), this is often sufficient along with the `onCreate`.
    if (value && editor.isEmpty) {
      // Parse markdown to HTML
      // marked.parse returns a Promise | string. We force async: false or handle promise if updated.
      // marked 4+ is sync by default.
      const html = marked.parse(value, { async: false }) as string;
      editor.commands.setContent(html);
    }
  }, [value, editor]);

  return (
    <div
      className={cn(
        "glass-card rounded-xl overflow-hidden border border-input focus-within:ring-1 focus-within:ring-ring",
        !editable && "opacity-50",
      )}
    >
      {editable && <EditorToolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}
