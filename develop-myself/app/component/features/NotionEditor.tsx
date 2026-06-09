import React, { useEffect, useState } from 'react';
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import { type PartialBlock } from "@blocknote/core";

interface NotionEditorProps {
  initialBlocks: any[];
  onSave: (blocks: any[]) => void;
}

export const NotionEditor = ({ initialBlocks, onSave }: NotionEditorProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    Promise.all([
      import("@blocknote/core/fonts/inter.css"),
      import("@blocknote/mantine/style.css")
    ]).then(() => {
      setIsMounted(true);
    });
  }, []);

  const editor = useCreateBlockNote({
    initialContent: initialBlocks && initialBlocks.length > 0 ? (initialBlocks as PartialBlock[]) : undefined,
  });

  if (!isMounted) {
    return <div className="p-8 text-center text-[#82CAFA]">Đang tải trình soạn thảo...</div>;
  }

  return (
    <BlockNoteView
      editor={editor}
      theme="light"
      onChange={() => {
        if ((window as any).saveContentTimeout) clearTimeout((window as any).saveContentTimeout);
        (window as any).saveContentTimeout = setTimeout(() => {
          onSave(editor.document);
        }, 1000);
      }}
    />
  );
};
