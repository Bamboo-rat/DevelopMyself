import React, { useEffect, useState } from 'react';
import { BlockNoteView } from "@blocknote/mantine";
import { 
  useCreateBlockNote, 
  SuggestionMenuController, 
  getDefaultReactSlashMenuItems,
  FormattingToolbar,
  FormattingToolbarController,
  BlockTypeSelect,
  BasicTextStyleButton,
  TextAlignButton,
  ColorStyleButton,
  NestBlockButton,
  UnnestBlockButton,
  CreateLinkButton,
  useBlockNoteEditor,
  useActiveStyles,
  createReactStyleSpec
} from "@blocknote/react";
import { BlockNoteSchema, defaultBlockSpecs, defaultStyleSpecs, filterSuggestionItems } from "@blocknote/core";
import { type PartialBlock } from "@blocknote/core";
import { DrawingBlock } from "./DrawingBlock";
import { PenTool } from "lucide-react";
import { userService } from "~/service/userService";

const FontSizeStyle = createReactStyleSpec(
  {
    type: "fontSize",
    propSchema: "string",
  },
  {
    render: (props) => (
      <span ref={props.contentRef} style={{ fontSize: props.value }} />
    ),
  }
);

// Define schema with custom drawing block and font size style
const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    drawing: DrawingBlock(),
  },
  styleSpecs: {
    ...defaultStyleSpecs,
    fontSize: FontSizeStyle,
  }
});

const FontSizeSelect = () => {
  const editor = useBlockNoteEditor(schema);
  const activeStyles = useActiveStyles(editor);
  const currentSize = activeStyles?.fontSize || "16px";

  return (
    <select 
      value={currentSize}
      onChange={(e) => {
        editor.addStyles({ fontSize: e.target.value });
      }}
      className="mx-1 h-7 border border-gray-200 rounded text-xs bg-white text-gray-700 outline-none focus:border-blue-300 cursor-pointer"
    >
      <option value="12px">12px</option>
      <option value="14px">14px</option>
      <option value="16px">16px</option>
      <option value="18px">18px</option>
      <option value="20px">20px</option>
      <option value="24px">24px</option>
      <option value="30px">30px</option>
    </select>
  );
};

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

const CustomFormattingToolbar = () => (
  <FormattingToolbar>
    <BlockTypeSelect key="blockTypeSelect" />
    <FontSizeSelect key="fontSizeSelect" />
    <BasicTextStyleButton basicTextStyle="bold" key="boldStyleButton" />
    <BasicTextStyleButton basicTextStyle="italic" key="italicStyleButton" />
    <BasicTextStyleButton basicTextStyle="underline" key="underlineStyleButton" />
    <BasicTextStyleButton basicTextStyle="strike" key="strikeStyleButton" />
    <BasicTextStyleButton key="codeStyleButton" basicTextStyle="code" />
    <TextAlignButton textAlignment="left" key="textAlignLeftButton" />
    <TextAlignButton textAlignment="center" key="textAlignCenterButton" />
    <TextAlignButton textAlignment="right" key="textAlignRightButton" />
    <ColorStyleButton key="colorStyleButton" />
    <NestBlockButton key="nestBlockButton" />
    <UnnestBlockButton key="unnestBlockButton" />
    <CreateLinkButton key="createLinkButton" />
  </FormattingToolbar>
);

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
    <div className="flex flex-col w-full">
      <BlockNoteView
        editor={editor}
        theme="light"
        slashMenu={false}
        formattingToolbar={false}
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
        <FormattingToolbarController
          formattingToolbar={CustomFormattingToolbar}
        />
      </BlockNoteView>
    </div>
  );
};

