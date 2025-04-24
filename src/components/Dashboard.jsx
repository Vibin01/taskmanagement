"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MyTask from "./MyTask";
import TaskBoard from "./TaskBoard";
import TaskAnalytics from "./Analytics";

const data = [
  { name: "Jan", value: 5 },
  { name: "Feb", value: 3 },
  { name: "Mar", value: 7 },
  { name: "Apr", value: 10 },
  { name: "May", value: 12 },
  { name: "Jun", value: 11 },
  { name: "Jul", value: 13 },
];

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const response = await fetch("/api/task");
        if (response.ok) {
          const data = await response.json();
          setTasks(data);
        } else {
          console.error("Failed to fetch tasks");
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    }

    fetchTasks();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 flex">
        <Tabs defaultValue="dashboard" className="w-full flex flex-row">
          <div className="w-[30%] h-[100vh] mt-[200px]">
            <TabsList className="w-full flex flex-col justify-center content-center items-stretch bg-transparent gap-5 ">
              <TabsTrigger
                className="md:text-[24px] py-4 md:py-10"
                value="dashboard"
                defaultValue
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger
                className="md:text-[24px] py-4 md:py-10"
                value="tasks"
              >
                My Tasks
              </TabsTrigger>
              <TabsTrigger
                className="md:text-[24px] py-4 md:py-10"
                value="projects"
              >
                Task Board
              </TabsTrigger>
              <TabsTrigger
                className="md:text-[24px] py-4 md:py-10"
                value="analytics"
              >
                Analytics
              </TabsTrigger>
              <TabsTrigger
                className="md:text-[24px] py-4 md:py-10"
                value="settings"
              >
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="w-[70%] h-[100vh] overflow-y-scroll">
            <TabsContent value="dashboard">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-sm text-gray-500">Total Tasks</h3>
                    <p className="text-2xl font-bold">{tasks.length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-sm text-gray-500">In Progress</h3>
                    <p className="text-2xl font-bold">
                      {
                        tasks.filter((task) => task.status === "IN_PROGRESS")
                          .length
                      }
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-sm text-gray-500">Completed</h3>
                    <p className="text-2xl font-bold">
                      {
                        tasks.filter((task) => task.status === "COMPLETED")
                          .length
                      }
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="mb-6">
                <CardContent className="p-4">
                  <h3 className="text-sm text-gray-500 mb-2">
                    Task Completion Trend
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={data}>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        className="z-0 relative"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <h3 className="text-lg font-semibold mb-4">Task Board</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {["TODO", "IN_PROGRESS", "COMPLETED"].map((column) => (
                  <Card key={column} className="min-h-[200px] border-none">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-700 mb-2">
                        {column}
                      </h4>
                      <div className="rounded p-2 min-h-[100px]">
                        {tasks
                          .filter((task) => task.status === column)
                          .map((task) => (
                            <p key={task.id} className="text-sm text-gray-700">
                              {task.title}
                            </p>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tasks">
              <MyTask />
            </TabsContent>
            <TabsContent value="projects">
              <TaskBoard />
            </TabsContent>
            <TabsContent value="analytics">
              <TaskAnalytics />
            </TabsContent>
            <TabsContent value="settings">
              <p className="text-muted-foreground">Settings content here.</p>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
