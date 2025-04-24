import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// Use the simpler and more direct function export format
export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const id = context.params.id;

  try {
    const body = await request.json();

    const updateData: Record<string, any> = {};

    if (body.status) {
      updateData.status = body.status;
    }
    if (typeof body.completed !== "undefined") {
      updateData.completed = body.completed;
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}
