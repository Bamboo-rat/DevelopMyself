import { createReactBlockSpec } from "@blocknote/react";
import { defaultProps } from "@blocknote/core";
import React, { lazy, Suspense } from "react";

// Lazy load TldrawWrapper to avoid SSR issues and keep the main bundle small
const TldrawWrapper = lazy(() => import('./TldrawWrapper'));

export const DrawingBlock = createReactBlockSpec(
  {
    type: "drawing",
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      textColor: defaultProps.textColor,
      data: {
        default: "{}",
      },
    },
    content: "none",
  },
  {
    render: (props) => {
      let parsedData = {};
      try {
        parsedData = JSON.parse(props.block.props.data);
      } catch (e) {
        // ignore
      }

      return (
        <div style={{ width: "100%", padding: "10px 0" }}>
          <div 
            contentEditable={false} 
            className="tldraw-container" 
            style={{ width: "100%", userSelect: "none" }}
            onKeyDown={(e) => e.stopPropagation()}
            onKeyUp={(e) => e.stopPropagation()}
          >
            <Suspense fallback={<div className="p-8 text-center bg-slate-50 text-slate-400 rounded-lg border border-slate-200">Đang tải bảng vẽ tldraw...</div>}>
              <TldrawWrapper 
                initialData={parsedData} 
                onChange={(snapshot) => {
                  props.editor.updateBlock(props.block, {
                    type: "drawing",
                    props: {
                      ...props.block.props,
                      data: JSON.stringify(snapshot)
                    }
                  });
                }} 
              />
            </Suspense>
          </div>
        </div>
      );
    },
  }
);
