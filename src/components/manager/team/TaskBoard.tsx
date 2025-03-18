// src/components/manager/team/TaskBoard.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Badge } from "@/components/ui/badge";

interface Task {
  id: string;
  title: string;
  assignee: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

const priorityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
};

export const TaskBoard = () => {
  // Replace with actual API call
  const columns: Column[] = [
    {
      id: 'todo',
      title: 'To Do',
      tasks: [
        {
          id: '1',
          title: 'Review Q4 Reports',
          assignee: 'John Doe',
          priority: 'high',
          dueDate: '2024-03-20'
        },
        // Add more tasks...
      ]
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      tasks: []
    },
    {
      id: 'done',
      title: 'Done',
      tasks: []
    }
  ];

  const onDragEnd = (result: any) => {
    // Implement drag and drop logic
    console.log(result);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {columns.map((column) => (
              <div key={column.id} className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium mb-4">
                  {column.title}
                  <Badge variant="outline" className="ml-2">
                    {column.tasks.length}
                  </Badge>
                </h3>
                <Droppable droppableId={column.id}>
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {column.tasks.map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-white p-3 rounded-md shadow-sm"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">{task.title}</h4>
                                <Badge className={priorityColors[task.priority]}>
                                  {task.priority}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-500">
                                <div>Assignee: {task.assignee}</div>
                                <div>Due: {task.dueDate}</div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </CardContent>
    </Card>
  );
};