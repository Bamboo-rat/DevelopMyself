import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { Plus, MoreHorizontal, GripVertical, Trash2 } from 'lucide-react';

export interface Task {
  id: string;
  content: string;
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

export interface BoardData {
  columns: Column[];
}

interface KanbanBoardProps {
  initialData: BoardData;
  onSave: (data: BoardData) => void;
}

export const KanbanBoard = ({ initialData, onSave }: KanbanBoardProps) => {
  const [data, setData] = useState<BoardData>(initialData);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync back to parent when data changes (with debounce)
  useEffect(() => {
    if (!isMounted) return;
    const timer = setTimeout(() => {
      onSave(data);
    }, 1000);
    return () => clearTimeout(timer);
  }, [data, isMounted, onSave]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, type } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    if (type === 'column') {
      const newColumns = Array.from(data.columns);
      const [removed] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, removed);

      setData({ ...data, columns: newColumns });
      return;
    }

    const sourceColIndex = data.columns.findIndex(c => c.id === source.droppableId);
    const destColIndex = data.columns.findIndex(c => c.id === destination.droppableId);

    const sourceCol = data.columns[sourceColIndex];
    const destCol = data.columns[destColIndex];

    const sourceTasks = Array.from(sourceCol.tasks);
    const destTasks = source.droppableId === destination.droppableId ? sourceTasks : Array.from(destCol.tasks);

    const [removed] = sourceTasks.splice(source.index, 1);
    destTasks.splice(destination.index, 0, removed);

    const newColumns = Array.from(data.columns);
    newColumns[sourceColIndex] = { ...sourceCol, tasks: sourceTasks };
    if (source.droppableId !== destination.droppableId) {
      newColumns[destColIndex] = { ...destCol, tasks: destTasks };
    }

    setData({ ...data, columns: newColumns });
  };

  const addColumn = () => {
    const newCol: Column = {
      id: `col-${Date.now()}`,
      title: 'Cột mới',
      tasks: []
    };
    setData({ ...data, columns: [...data.columns, newCol] });
  };

  const addTask = (colId: string) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      content: 'Công việc mới'
    };
    const newColumns = data.columns.map(c => {
      if (c.id === colId) {
        return { ...c, tasks: [...c.tasks, newTask] };
      }
      return c;
    });
    setData({ ...data, columns: newColumns });
  };

  const updateTask = (colId: string, taskId: string, newContent: string) => {
    const newColumns = data.columns.map(c => {
      if (c.id === colId) {
        return {
          ...c,
          tasks: c.tasks.map(t => t.id === taskId ? { ...t, content: newContent } : t)
        };
      }
      return c;
    });
    setData({ ...data, columns: newColumns });
  };

  const deleteTask = (colId: string, taskId: string) => {
    const newColumns = data.columns.map(c => {
      if (c.id === colId) {
        return { ...c, tasks: c.tasks.filter(t => t.id !== taskId) };
      }
      return c;
    });
    setData({ ...data, columns: newColumns });
  };

  const updateColumnTitle = (colId: string, newTitle: string) => {
    const newColumns = data.columns.map(c => c.id === colId ? { ...c, title: newTitle } : c);
    setData({ ...data, columns: newColumns });
  };

  if (!isMounted) return null;

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden pt-4 pb-8 min-h-[500px]">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="board" type="column" direction="horizontal">
          {(provided) => (
            <div
              className="flex items-start h-full gap-6 px-2"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {data.columns.map((col, index) => (
                <Draggable key={col.id} draggableId={col.id} index={index}>
                  {(provided) => (
                    <div
                      className="bg-gray-100/80 rounded-2xl w-80 shrink-0 flex flex-col border border-gray-200/50 shadow-sm"
                      {...provided.draggableProps}
                      ref={provided.innerRef}
                    >
                      {/* Column Header */}
                      <div
                        className="p-4 flex items-center justify-between group/col"
                        {...provided.dragHandleProps}
                      >
                        <input
                          className="font-bold text-gray-700 bg-transparent focus:bg-white focus:ring-2 focus:ring-blue-100 rounded px-2 py-1 outline-none w-full mr-2 transition-all"
                          value={col.title}
                          onChange={(e) => updateColumnTitle(col.id, e.target.value)}
                        />
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                          <MoreHorizontal size={20} />
                        </button>
                      </div>

                      {/* Task List */}
                      <Droppable droppableId={col.id} type="task">
                        {(provided, snapshot) => (
                          <div
                            className={`flex-1 overflow-y-auto px-3 pb-3 min-h-[150px] transition-colors ${snapshot.isDraggingOver ? 'bg-blue-50/50 rounded-xl mx-2' : ''}`}
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                          >
                            {col.tasks.map((task, index) => (
                              <Draggable key={task.id} draggableId={task.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    className={`bg-white p-3 rounded-xl shadow-sm border border-gray-200/60 mb-3 group/task transition-all ${snapshot.isDragging ? 'shadow-lg rotate-2 scale-105 border-blue-200' : 'hover:border-blue-300'}`}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    ref={provided.innerRef}
                                  >
                                    <div className="flex items-start">
                                      <div className="text-gray-300 mt-1 mr-2 opacity-0 group-hover/task:opacity-100 transition-opacity cursor-grab">
                                        <GripVertical size={16} />
                                      </div>
                                      <textarea
                                        className="w-full text-sm text-gray-700 outline-none resize-none bg-transparent"
                                        rows={Math.max(2, task.content.split('\\n').length)}
                                        value={task.content}
                                        onChange={(e) => updateTask(col.id, task.id, e.target.value)}
                                        placeholder="Nhập nội dung công việc..."
                                      />
                                      <button
                                        onClick={() => deleteTask(col.id, task.id)}
                                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover/task:opacity-100 transition-all p-1"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}

                            {/* Add Task Button */}
                            <button
                              onClick={() => addTask(col.id)}
                              className="flex items-center text-gray-500 hover:text-gray-800 hover:bg-gray-200/50 w-full p-2.5 rounded-lg transition-colors text-sm font-medium mt-1"
                            >
                              <Plus size={18} className="mr-2" /> Thêm thẻ
                            </button>
                          </div>
                        )}
                      </Droppable>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}

              {/* Add Column Button */}
              <button
                onClick={addColumn}
                className="w-80 shrink-0 bg-gray-50/50 hover:bg-gray-100 border-2 border-dashed border-gray-200 hover:border-gray-300 rounded-2xl flex items-center justify-center p-4 text-gray-500 font-medium transition-all"
              >
                <Plus size={20} className="mr-2" /> Thêm danh sách
              </button>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};
