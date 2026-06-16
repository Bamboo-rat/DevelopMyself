import React, { useEffect, useState } from 'react';
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote, SuggestionMenuController, getDefaultReactSlashMenuItems } from "@blocknote/react";
import { BlockNoteSchema, defaultBlockSpecs, filterSuggestionItems } from "@blocknote/core";
import { type PartialBlock } from "@blocknote/core";
import { DrawingBlock } from "./DrawingBlock";
import { PenTool } from "lucide-react";
import { userService } from "~/service/userService";

// Define schema with custom drawing block
const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    drawing: DrawingBlock(),
  },
});

const insertDrawing = (editor: typeof schema.BlockNoteEditor) => ({
  title: "Drawing / Flowchart",
  onItemClick: () => {
    editor.insertBlocks([{ type: "drawing" }], editor.getTextCursorPosition().block, "after");
  },
  aliases: ["drawing", "flowchart", "ve", "diagram", "tldraw"],
  group: "Media",
  icon: <PenTool size={18} />,
  subtext: "Insert a tldraw canvas",
});

const uploadEditorImage = async (file: File) => {
  if (!file.type.startsWith("image/")) {
    throw new Error("Chỉ hỗ trợ tải ảnh lên trong ghi chú");
  }

  const res: any = await userService.uploadFile(file);
  const url = res?.data?.url;

  if (!res?.success || !url) {
    throw new Error(res?.message || "Không thể tải ảnh lên");
  }

  return url;
};

interface NotionEditorProps {
  initialBlocks: any[];
  onSave: (blocks: any[]) => void;
}

export const NotionEditor = ({ initialBlocks, onSave }: NotionEditorProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [fontSize, setFontSize] = useState("16px");

  useEffect(() => {
    Promise.all([
      import("@blocknote/core/fonts/inter.css"),
      import("@blocknote/mantine/style.css")
    ]).then(() => {
      setIsMounted(true);
    });

    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bn-font-size");
      if (saved) setFontSize(saved);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && isMounted) {
      localStorage.setItem("bn-font-size", fontSize);
    }
  }, [fontSize, isMounted]);

  const editor = useCreateBlockNote({
    schema,
    initialContent: initialBlocks && initialBlocks.length > 0 ? (initialBlocks as PartialBlock[]) : undefined,
    uploadFile: uploadEditorImage,
    pasteHandler: ({ event, editor, defaultPasteHandler }) => {
      // Check if we are inside a table
      const isInTable = editor.transact((tr) => {
        let inTable = false;
        for (let i = tr.selection.$from.depth; i > 0; i--) {
          if (tr.selection.$from.node(i).type.name === "table") {
            inTable = true;
            break;
          }
        }
        return inTable;
      });

      const hasHtml = event.clipboardData?.types.includes("text/html");

      // If inside a table and pasting HTML (like from Excel),
      // we return undefined to let the default ProseMirror (and prosemirror-tables) paste handler take over.
      // This allows it to map columns and rows properly instead of pasting as blocks inside a cell.
      if (isInTable && hasHtml) {
        return undefined;
      }

      return defaultPasteHandler();
    },
  });

  if (!isMounted) {
    return <div className="p-8 text-center text-[#82CAFA]">Đang tải trình soạn thảo...</div>;
  }

  return (
    <div className="flex flex-col w-full" style={{ fontSize, '--bn-font-size': fontSize } as any}>
      <div className="flex justify-end mb-2 px-10">
        <select 
          value={fontSize} 
          onChange={(e) => setFontSize(e.target.value)}
          className="border border-gray-200 rounded-md p-1.5 text-sm bg-white text-gray-700 outline-none focus:border-blue-300 transition-colors cursor-pointer"
        >
          <option value="14px">Cỡ chữ: Nhỏ (14px)</option>
          <option value="16px">Cỡ chữ: Vừa (16px)</option>
          <option value="18px">Cỡ chữ: Lớn (18px)</option>
          <option value="20px">Cỡ chữ: Rất lớn (20px)</option>
          <option value="24px">Cỡ chữ: Khổng lồ (24px)</option>
        </select>
      </div>
      <BlockNoteView
        editor={editor}
        theme="light"
        slashMenu={false}
        onChange={() => {
          if ((window as any).saveContentTimeout) clearTimeout((window as any).saveContentTimeout);
          (window as any).saveContentTimeout = setTimeout(() => {
            onSave(editor.document);
          }, 500);
        }}
      >
        <SuggestionMenuController
          triggerCharacter={"/"}
          getItems={async (query) =>
            filterSuggestionItems(
              [...getDefaultReactSlashMenuItems(editor), insertDrawing(editor)],
              query
            )
          }
        />
      </BlockNoteView>
    </div>
  );
};

