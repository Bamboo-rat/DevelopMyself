import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { Plus, MoreHorizontal, GripVertical, Trash2, Calendar, CheckSquare, Clock, AlignLeft, X } from 'lucide-react';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  title?: string;
  content?: string; // Tương thích dữ liệu cũ
  description?: string;
  priority?: Priority;
  deadline?: string;
  checklist?: ChecklistItem[];
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

// ---------------------------------------------------------
// Component Modal Chi Tiết Task
// ---------------------------------------------------------
const TaskDetailModal = ({ task, colId, onClose, onUpdate, onDelete }: {
  task: Task;
  colId: string;
  onClose: () => void;
  onUpdate: (updatedTask: Task) => void;
  onDelete: () => void;
}) => {
  const [editedTask, setEditedTask] = useState<Task>({ ...task, priority: task.priority || 'LOW' });
  const [newChecklistItem, setNewChecklistItem] = useState('');

  const handleSave = () => {
    // Tương thích ngược
    const finalTask = { ...editedTask };
    if (!finalTask.title) {
      finalTask.title = finalTask.content || 'Công việc mới';
    }
    onUpdate(finalTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#023468]/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#AED8E6]/40">
          <input 
            className="text-xl font-bold text-[#023468] outline-none w-full mr-4 bg-transparent"
            value={editedTask.title || editedTask.content || ''}
            onChange={e => setEditedTask({ ...editedTask, title: e.target.value, content: undefined })}
            placeholder="Tên công việc..."
          />
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-3 gap-6 overflow-y-auto flex-1">
          <div className="col-span-2 space-y-6">
            {/* Description */}
            <div>
              <div className="flex items-center gap-2 text-[#023468] font-semibold mb-2">
                <AlignLeft size={18} /> Mô tả
              </div>
              <textarea 
                className="w-full bg-[#F8FBFC] border border-[#AED8E6]/60 rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#82CAFA] min-h-[100px] text-sm text-[#023468]/80 resize-y"
                placeholder="Thêm mô tả chi tiết..."
                value={editedTask.description || ''}
                onChange={e => setEditedTask({ ...editedTask, description: e.target.value })}
              />
            </div>

            {/* Checklist */}
            <div>
              <div className="flex items-center gap-2 text-[#023468] font-semibold mb-3">
                <CheckSquare size={18} /> Danh sách việc cần làm
              </div>
              
              <div className="space-y-2 mb-3">
                {(editedTask.checklist || []).map(item => (
                  <div key={item.id} className="flex items-center gap-3 group">
                    <input 
                      type="checkbox" 
                      checked={item.isCompleted}
                      onChange={e => {
                        const newChecklist = (editedTask.checklist || []).map(i => 
                          i.id === item.id ? { ...i, isCompleted: e.target.checked } : i
                        );
                        setEditedTask({ ...editedTask, checklist: newChecklist });
                      }}
                      className="w-4 h-4 text-[#82CAFA] rounded border-gray-300 focus:ring-[#82CAFA] cursor-pointer"
                    />
                    <input 
                      className={`flex-1 text-sm outline-none bg-transparent ${item.isCompleted ? 'line-through text-gray-400' : 'text-[#023468]'}`}
                      value={item.text}
                      onChange={e => {
                        const newChecklist = (editedTask.checklist || []).map(i => 
                          i.id === item.id ? { ...i, text: e.target.value } : i
                        );
                        setEditedTask({ ...editedTask, checklist: newChecklist });
                      }}
                    />
                    <button 
                      onClick={() => {
                        const newChecklist = (editedTask.checklist || []).filter(i => i.id !== item.id);
                        setEditedTask({ ...editedTask, checklist: newChecklist });
                      }}
                      className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input 
                  className="flex-1 text-sm border border-[#AED8E6] bg-[#F8FBFC] rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#82CAFA] text-[#023468]"
                  placeholder="Thêm mục..."
                  value={newChecklistItem}
                  onChange={e => setNewChecklistItem(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newChecklistItem.trim()) {
                      const newItem = { id: `chk-${Date.now()}`, text: newChecklistItem.trim(), isCompleted: false };
                      setEditedTask({ ...editedTask, checklist: [...(editedTask.checklist || []), newItem] });
                      setNewChecklistItem('');
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Sidebar options */}
          <div className="col-span-1 space-y-5">
            <div>
              <div className="text-xs font-bold text-[#023468]/60 uppercase tracking-wider mb-2">Mức độ ưu tiên</div>
              <select 
                className="w-full border border-[#AED8E6] bg-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#82CAFA] text-[#023468] cursor-pointer"
                value={editedTask.priority || 'LOW'}
                onChange={e => setEditedTask({ ...editedTask, priority: e.target.value as Priority })}
              >
                <option value="LOW">Thấp</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="HIGH">Cao</option>
                <option value="URGENT">Khẩn cấp</option>
              </select>
            </div>

            <div>
              <div className="text-xs font-bold text-[#023468]/60 uppercase tracking-wider mb-2">Hạn chót</div>
              <input 
                type="date"
                className="w-full border border-[#AED8E6] bg-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#82CAFA] text-[#023468] cursor-pointer"
                value={editedTask.deadline || ''}
                onChange={e => setEditedTask({ ...editedTask, deadline: e.target.value })}
              />
            </div>
            
            <div className="pt-4 mt-4 border-t border-[#AED8E6]/40">
              <button 
                onClick={() => {
                  if(window.confirm('Xóa thẻ này?')) {
                    onDelete();
                    onClose();
                  }
                }}
                className="w-full flex items-center justify-center gap-2 text-red-600 bg-red-50 hover:bg-red-100 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Trash2 size={16} /> Xóa thẻ
              </button>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-[#AED8E6]/40 flex justify-end gap-3 bg-[#F8FBFC] rounded-b-2xl">
          <button onClick={onClose} className="px-5 py-2 text-[#023468]/70 font-medium hover:bg-[#AED8E6]/30 rounded-lg transition-colors">Hủy</button>
          <button onClick={handleSave} className="px-5 py-2 bg-[#82CAFA] hover:bg-[#023468] text-white font-medium rounded-lg transition-colors shadow-sm">Lưu lại</button>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------
// Component Chính
// ---------------------------------------------------------
export const KanbanBoard = ({ initialData, onSave }: KanbanBoardProps) => {
  const [data, setData] = useState<BoardData>(initialData);
  const [isMounted, setIsMounted] = useState(false);
  const [editingTask, setEditingTask] = useState<{ task: Task, colId: string } | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync back to parent when data changes
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
      title: 'Công việc mới',
      priority: 'LOW'
    };
    const newColumns = data.columns.map(c => {
      if (c.id === colId) {
        return { ...c, tasks: [...c.tasks, newTask] };
      }
      return c;
    });
    setData({ ...data, columns: newColumns });
    
    // Open modal directly after creating
    setEditingTask({ task: newTask, colId });
  };

  const updateTask = (colId: string, updatedTask: Task) => {
    const newColumns = data.columns.map(c => {
      if (c.id === colId) {
        return {
          ...c,
          tasks: c.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
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

  const deleteColumn = (colId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa danh sách này và toàn bộ thẻ bên trong?')) return;
    const newColumns = data.columns.filter(c => c.id !== colId);
    setData({ ...data, columns: newColumns });
  };

  const updateColumnTitle = (colId: string, newTitle: string) => {
    const newColumns = data.columns.map(c => c.id === colId ? { ...c, title: newTitle } : c);
    setData({ ...data, columns: newColumns });
  };

  const getPriorityColor = (priority?: Priority) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-700';
      case 'HIGH': return 'bg-orange-100 text-orange-700';
      case 'MEDIUM': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getPriorityLabel = (priority?: Priority) => {
    switch (priority) {
      case 'URGENT': return 'Khẩn cấp';
      case 'HIGH': return 'Cao';
      case 'MEDIUM': return 'TB';
      default: return 'Thấp';
    }
  };

  const isOverdue = (deadline?: string) => {
    if (!deadline) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(deadline);
    return date < today;
  };

  if (!isMounted) return null;

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden pt-4 pb-8 min-h-[500px]">
      
      {editingTask && (
        <TaskDetailModal 
          task={editingTask.task} 
          colId={editingTask.colId}
          onClose={() => setEditingTask(null)}
          onUpdate={(task) => updateTask(editingTask.colId, task)}
          onDelete={() => deleteTask(editingTask.colId, editingTask.task.id)}
        />
      )}

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
                      className="bg-gray-100/80 rounded-2xl w-[320px] shrink-0 flex flex-col border border-gray-200/50 shadow-sm"
                      {...provided.draggableProps}
                      ref={provided.innerRef}
                    >
                      {/* Column Header */}
                      <div
                        className="p-4 flex items-center justify-between group/col"
                        {...provided.dragHandleProps}
                      >
                        <input
                          className="font-bold text-gray-700 bg-transparent focus:bg-white focus:ring-2 focus:ring-[#82CAFA] rounded px-2 py-1 outline-none w-full mr-2 transition-all"
                          value={col.title}
                          onChange={(e) => updateColumnTitle(col.id, e.target.value)}
                        />
                        <button 
                          onClick={() => deleteColumn(col.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          title="Xóa danh sách"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Task List */}
                      <Droppable droppableId={col.id} type="task">
                        {(provided, snapshot) => (
                          <div
                            className={`flex-1 overflow-y-auto px-3 pb-3 min-h-[150px] transition-colors ${snapshot.isDraggingOver ? 'bg-[#AED8E6]/20 rounded-xl mx-2' : ''}`}
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                          >
                            {col.tasks.map((task, index) => {
                              const completedChecks = task.checklist?.filter(c => c.isCompleted).length || 0;
                              const totalChecks = task.checklist?.length || 0;
                              
                              return (
                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      onClick={() => setEditingTask({ task, colId: col.id })}
                                      className={`bg-white p-3 rounded-xl shadow-sm border border-gray-200/60 mb-3 group/task transition-all cursor-pointer ${snapshot.isDragging ? 'shadow-lg rotate-2 scale-105 border-[#82CAFA]' : 'hover:border-[#82CAFA] hover:shadow-md'}`}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      ref={provided.innerRef}
                                    >
                                      {/* Task Tags (Priority) */}
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                                          {getPriorityLabel(task.priority)}
                                        </span>
                                      </div>

                                      {/* Task Title */}
                                      <div className="text-sm font-medium text-gray-800 mb-3">
                                        {task.title || task.content || 'Công việc mới'}
                                      </div>

                                      {/* Task Metadata (Deadline, Checklist) */}
                                      <div className="flex items-center gap-4 text-gray-400 text-xs font-medium">
                                        {task.deadline && (
                                          <div className={`flex items-center gap-1 ${isOverdue(task.deadline) ? 'text-red-500' : ''}`}>
                                            <Clock size={12} />
                                            <span>{task.deadline}</span>
                                          </div>
                                        )}
                                        {totalChecks > 0 && (
                                          <div className={`flex items-center gap-1 ${completedChecks === totalChecks ? 'text-green-500' : ''}`}>
                                            <CheckSquare size={12} />
                                            <span>{completedChecks}/{totalChecks}</span>
                                          </div>
                                        )}
                                        {task.description && (
                                          <div className="flex items-center gap-1">
                                            <AlignLeft size={12} />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              );
                            })}
                            {provided.placeholder}

                            {/* Add Task Button */}
                            <button
                              onClick={() => addTask(col.id)}
                              className="flex items-center text-[#023468]/60 hover:text-[#023468] hover:bg-white w-full p-2.5 rounded-xl transition-all text-sm font-medium mt-1 shadow-sm border border-transparent hover:border-[#AED8E6]/50"
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
                className="w-[320px] shrink-0 bg-[#F8FBFC] hover:bg-white border-2 border-dashed border-[#AED8E6] hover:border-[#82CAFA] rounded-2xl flex items-center justify-center p-4 text-[#023468]/60 hover:text-[#023468] font-medium transition-all"
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
