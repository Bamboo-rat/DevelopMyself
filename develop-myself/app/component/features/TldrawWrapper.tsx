import React, { useEffect, useRef } from 'react';
import { Tldraw, Editor, getSnapshot, loadSnapshot } from 'tldraw';
import 'tldraw/tldraw.css';

interface TldrawWrapperProps {
  initialData?: any;
  onChange: (data: any) => void;
}

const TldrawWrapper = React.memo(({ initialData, onChange }: TldrawWrapperProps) => {
  const isMounted = useRef(false);

  const handleMount = (editor: Editor) => {
    isMounted.current = true;
    if (initialData && Object.keys(initialData).length > 0) {
      try {
        loadSnapshot(editor.store, initialData);
      } catch (e) {
        console.error("Failed to load tldraw snapshot:", e);
      }
    }

    let timeoutId: any;
    editor.store.listen(() => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (!isMounted.current) return;
        const snapshot = getSnapshot(editor.store);
        onChange(snapshot);
      }, 1000);
    }, { source: 'user', scope: 'document' });
  };

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '500px', position: 'relative', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', zIndex: 0 }}>
      <Tldraw onMount={handleMount} />
    </div>
  );
}, (prevProps, nextProps) => {
  // Chỉ render lại nếu initialData bị thay đổi thực sự (không quan tâm tham chiếu object mới)
  // Thực tế, tldraw quản lý state nội bộ nên chúng ta không bao giờ cần TldrawWrapper re-render sau khi mount!
  return true; 
});

export default TldrawWrapper;
