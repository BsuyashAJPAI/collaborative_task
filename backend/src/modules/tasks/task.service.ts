import { prisma } from "../../config/db";
import { io } from "../../server"; // Shared Socket.io instance
import { CreateTaskInput, UpdateTaskInput } from "./task.dto";

export class TaskService {
    /**
     * CREATE: Saves to DB + Global Broadcast + Targeted Assignee Notification
     */
    static async createTask(data: CreateTaskInput, creatorId: string) {
        const task = await prisma.task.create({
            data: {
                ...data,
                creatorId,
            },
        });

        // Notify everyone to add this task to their board
        io.emit("taskCreated", task);

        // If an assignee was picked during creation, notify them specifically
        if (task.assignedToId) {
            io.emit(`assignedTo:${task.assignedToId}`, task);
        }

        return task;
    }

    /**
     * READ: Fetches tasks relevant to the specific user
     */
    static async getTasksForUser(userId: string) {
        return prisma.task.findMany({
            where: {
                OR: [
                    { creatorId: userId },
                    { assignedToId: userId },
                ],
            },
            orderBy: { dueDate: "asc" },
            include: {
                creator: { select: { id: true, name: true, email: true } },
                assignedTo: { select: { id: true, name: true, email: true } },
            },
        });
    }

    /**
     * UPDATE: Saves to DB + Syncs all screens + Targeted Assignee Notification
     */
    static async updateTask(taskId: string, data: UpdateTaskInput) {
        const task = await prisma.task.update({
            where: { id: taskId },
            data,
        });

        // Broad broadcast so all users see the update (e.g., status change)
        io.emit("taskUpdated", task);

        // If the assignee was changed or updated, notify that specific user
        if (data.assignedToId) {
            io.emit(`assignedTo:${data.assignedToId}`, task);
        }

        return task;
    }

    /**
     * DELETE: Removes from DB + Removes from all user screens
     */
    static async deleteTask(taskId: string) {
        const deletedTask = await prisma.task.delete({
            where: { id: taskId },
        });

        // Tell all clients to remove this ID from their UI lists
        io.emit("taskDeleted", taskId);

        return deletedTask;
    }

    /**
     * FETCH BY ID: Detailed view for a single task
     */
    static async getTaskById(taskId: string) {
        return prisma.task.findUnique({
            where: { id: taskId },
            include: {
                creator: { select: { name: true } },
                assignedTo: { select: { name: true } },
            },
        });
    }
}