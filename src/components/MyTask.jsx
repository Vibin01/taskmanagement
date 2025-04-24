"use client";
import { useState, useEffect } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

const priorityColorMap = {
  HIGH: "bg-red-100 text-red-600",
  MEDIUM: "bg-blue-100 text-blue-600",
  LOW: "bg-green-100 text-green-600",
};

export default function MyTask() {
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [category, setCategory] = useState("FRONTEND");
  const [date, setDate] = useState(undefined);
  const [estimatedHours, setEstimatedHours] = useState();
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!title || !date || estimatedHours === undefined) {
      setError("Please fill in all required fields.");
      return;
    }

    const res = await fetch("/api/task", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        priority,
        category,
        dueDate: date,
        estimatedHours,
      }),
    });

    if (res.ok) {
      const newTask = await res.json();
      setSelectedTasks((prevTasks) => [...prevTasks, newTask]);
      onCancel();
      setShowCreateTaskModal(false);
    } else {
      setError("Failed to create task. Please try again.");
    }
  };

  const onCancel = () => {
    setShowCreateTaskModal(false);
    setTitle("");
    setDescription("");
    setPriority("MEDIUM");
    setCategory("FRONTEND");
    setDate(undefined);
    setEstimatedHours(undefined);
    setError("");
  };

  useEffect(() => {
    async function loadTasks() {
      const res = await fetch("/api/task");
      const data = await res.json();
      setSelectedTasks(data);
    }
    loadTasks();
  }, []);

  return (
    <div className="w-full">
      {showCreateTaskModal ? (
        <div className="max-w-2xl mx-auto py-6 px-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-semibold">Create New Task</h2>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task name..."
              />
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter task description..."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FRONTEND">Frontend</SelectItem>
                    <SelectItem value="BACKEND">Backend</SelectItem>
                    <SelectItem value="DESIGN">Design</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start w-full">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Input
                  type="number"
                  placeholder="Estimated Time (hours)"
                  value={estimatedHours ?? ""}
                  min={0}
                  onChange={(e) => setEstimatedHours(Number(e.target.value))}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  onClick={handleSubmit}
                >
                  Create
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto py-6 px-4">
          <h2 className="text-2xl font-bold mb-4">My Tasks</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button variant="outline">All Tasks</Button>
            <Button variant="outline">Priority</Button>
            <Button variant="outline">Category</Button>
            <Button variant="outline">Due Date</Button>
            <Button
              className="ml-auto bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => setShowCreateTaskModal(true)}
            >
              +
            </Button>
          </div>

          <div className="space-y-2 w-full">
            {selectedTasks.map((task) => (
              <Card
                key={task.id}
                className={`w-full flex flex-row justify-between px-4 py-3 items-center ${
                  task.completed ? "bg-muted" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={task.status === "COMPLETED"}
                    onCheckedChange={async (checked) => {
                      const newStatus = checked ? "COMPLETED" : "IN_PROGRESS"; // or any other status
                      const res = await fetch(`/api/task/${task.id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: newStatus }),
                      });

                      if (res.ok) {
                        setSelectedTasks((prev) =>
                          prev.map((t) =>
                            t.id === task.id ? { ...t, status: newStatus } : t
                          )
                        );
                      }
                    }}
                    className="rounded-full border-2 transition-all 
    data-[state=checked]:bg-blue-500 data-[state=checked]:text-white 
    data-[state=unchecked]:bg-transparent w-[20px] h-[20px]"
                  />

                  <div>
                    <h3
                      className={`font-semibold text-base 
      ${
        task.status === "COMPLETED" ? "line-through text-muted-foreground" : ""
      }`}
                    >
                      {task.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {task.category} • {task.priority} Priority • Due:{" "}
                      {format(new Date(task.dueDate), "MMM dd")}
                    </p>
                  </div>
                </div>
                <Badge className={priorityColorMap[task.priority]}>
                  {task.priority}
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
