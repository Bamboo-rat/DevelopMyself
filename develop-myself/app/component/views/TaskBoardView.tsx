import React from 'react';
import { KanbanBoard } from '~/component/board/KanbanBoard';

interface TaskBoardViewProps {
  page: any;
  onSave: (data: any) => void;
}

export const TaskBoardView = ({ page, onSave }: TaskBoardViewProps) => {
  const initialData = page.content?.board?.columns ? page.content.board : (page.content?.columns ? { columns: page.content.columns } : {
    columns: [
      { id: 'todo', title: 'Cần làm', tasks: [] },
      { id: 'in-progress', title: 'Đang làm', tasks: [] },
      { id: 'done', title: 'Đã xong', tasks: [] }
    ]
  });

  return (
    <div className="flex-1 flex flex-col mx-8 lg:mx-8 xl:mx-10 px-2 md:px-8">
      <KanbanBoard 
        initialData={initialData}
        onSave={(boardData) => onSave({ ...page.content, board: boardData })}
      />
    </div>
  );
};
