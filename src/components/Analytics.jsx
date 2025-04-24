import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function TaskAnalytics() {
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

  const completedTasks = tasks.filter(
    (task) => task.status === "COMPLETED"
  ).length;
  const totalTasks = tasks.length;
  const completionRate =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const priorityDistribution = [
    {
      name: "High",
      value: tasks.filter((task) => task.priority === "HIGH").length,
    },
    {
      name: "Medium",
      value: tasks.filter((task) => task.priority === "MEDIUM").length,
    },
    {
      name: "Low",
      value: tasks.filter((task) => task.priority === "LOW").length,
    },
  ];

  const pieData = [
    { name: "Completed", value: completionRate },
    { name: "Remaining", value: 100 - completionRate },
  ];

  const COLORS = ["#3b82f6", "#e5e7eb"];
  const PRIORITY_COLORS = ["#ef4444", "#3b82f6", "#22c55e"];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Task Analytics</h1>
        <div className="border rounded-lg px-4 py-2 text-sm">
          Apr 1 - Apr 30, 2025
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Task Completion Rate</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                innerRadius={70}
                outerRadius={90}
                paddingAngle={5}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-2xl font-bold"
              >
                {completionRate}%
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Priority Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={priorityDistribution}>
              <XAxis dataKey="name" />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="value">
                {priorityDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PRIORITY_COLORS[index % PRIORITY_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
