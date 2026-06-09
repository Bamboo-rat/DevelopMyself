import React from 'react';
import { NotionEditor } from '~/component/features/NotionEditor';

interface NotePageViewProps {
  page: any;
  onSave: (data: any) => void;
}

export const NotePageView = ({ page, onSave }: NotePageViewProps) => {
  return (
    <div className="flex-1 flex flex-col mx-8 lg:mx-8 xl:mx-10 px-2 md:px-8">
      <NotionEditor
        initialBlocks={page.content?.blocks || []}
        onSave={(blocks) => onSave({ ...page.content, blocks })}
      />
    </div>
  );
};
