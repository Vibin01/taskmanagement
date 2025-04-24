import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Task = {
  id: string;
  title: string;
  category: string;
  dueDate?: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status?: "TODO" | "IN_PROGRESS" | "COMPLETED";
  completed?: boolean;
};

type GroupedTasks = {
  TODO: Task[];
  IN_PROGRESS: Task[];
  COMPLETED: Task[];
};

const priorityColorMap = {
  HIGH: "bg-red-100 text-red-600",
  MEDIUM: "bg-blue-100 text-blue-600",
  LOW: "bg-green-100 text-green-600",
};

function SortableTask({
  task,
  column,
}: {
  task: Task;
  column: keyof GroupedTasks;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: `${task.id}-${column}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        className={`p-4 space-y-1 border rounded-xl ${
          task.completed ? "bg-muted" : ""
        }`}
      >
        <div className="flex items-center justify-between">
          <h3
            className={`font-medium ${
              task.completed ? "line-through text-muted-foreground" : ""
            }`}
          >
            {task.title}
          </h3>
          <Badge variant="default" className={priorityColorMap[task.priority]}>
            {task.priority}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{task.category}</p>
        <p className="text-sm text-muted-foreground">
          Due: {task.dueDate || "N/A"}
        </p>
      </Card>
    </div>
  );
}

function DroppableColumn({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className="min-h-[120px] space-y-4 flex flex-col">
      {children}
    </div>
  );
}

export default function TaskBoard() {
  const [boardData, setBoardData] = useState<GroupedTasks>({
    TODO: [],
    IN_PROGRESS: [],
    COMPLETED: [],
  });

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    const fetchTasks = async () => {
      const res = await fetch("/api/task");
      const data = await res.json();

      const grouped: GroupedTasks = {
        TODO: [],
        IN_PROGRESS: [],
        COMPLETED: [],
      };

      (data as Task[]).forEach((task: Task) => {
        const isCompleted: boolean =
          task.completed || task.status === "COMPLETED";
        const key: keyof GroupedTasks = isCompleted
          ? "COMPLETED"
          : task.status || "TODO";
        if (grouped[key]) {
          grouped[key].push({
            ...task,
            completed: isCompleted,
          });
        }
      });

      setBoardData(grouped);
    };

    fetchTasks();
  }, []);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const activeId = active.id.split("-")[0];
    const sourceCol = (
      Object.keys(boardData) as (keyof typeof boardData)[]
    ).find((col) =>
      boardData[col].some((task) => `${task.id}-${col}` === active.id)
    );
    const destCol = over.id as keyof GroupedTasks;

    if (!sourceCol || !destCol || sourceCol === destCol) return;

    const activeTask = boardData[sourceCol].find(
      (t) => `${t.id}-${sourceCol}` === active.id
    );
    if (!activeTask) return;

    const updatedTask: Task = {
      ...activeTask,
      status: destCol,
      completed: destCol === "COMPLETED",
    };

    setBoardData((prev) => {
      const newSource = prev[sourceCol].filter(
        (t) => `${t.id}-${sourceCol}` !== active.id
      );
      const newDest = [...(prev[destCol] || []), updatedTask];
      return {
        ...prev,
        [sourceCol]: newSource,
        [destCol]: newDest,
      };
    });

    fetch(`/api/tasks/${activeId}`, {
      method: "PATCH", // Change from PUT to PATCH
      body: JSON.stringify({
        status: destCol,
        completed: destCol === "COMPLETED",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  const columnLabels: Record<keyof GroupedTasks, string> = {
    TODO: "To Do",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-4">Task Board</h1>

      <div className="flex gap-2 mb-6">
        <span className="text-muted-foreground">Filter by:</span>
        <Button variant="outline" className={""} size="default">
          Priority
        </Button>
        <Button variant="outline" className={""} size="default">
          Category
        </Button>
        <Button variant="outline" className={""} size="default">
          Assigned
        </Button>
        <Button className="ml-auto" variant="default" size="default">
          +
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-3 gap-6">
          {Object.entries(boardData).map(([column, tasks]) => (
            <div key={column} className="space-y-4">
              <h2 className="font-semibold text-lg">
                {columnLabels[column as keyof GroupedTasks]}
              </h2>

              <DroppableColumn id={column}>
                <SortableContext
                  items={tasks.map((t) => `${t.id}-${column}`)}
                  strategy={rectSortingStrategy}
                >
                  {tasks.length > 0 ? (
                    tasks.map((task) => (
                      <SortableTask
                        key={`${task.id}-${column}`}
                        task={task}
                        column={column as keyof GroupedTasks}
                      />
                    ))
                  ) : (
                    <div className="flex-grow text-muted-foreground text-center">
                      {/* Empty space when no tasks */}
                    </div>
                  )}
                </SortableContext>
              </DroppableColumn>
            </div>
          ))}
        </div>
      </DndContext>
    </div>
  );
}
