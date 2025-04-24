import prisma from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  const body = await req.json();
  const task = await prisma.task.create({
    data: {
      title: body.title,
      description: body.description,
      priority: body.priority,
      category: body.category,
      dueDate: new Date(body.dueDate),
      estimatedHours: body.estimatedHours,
    },
  });
  return NextResponse.json(task);
}
