import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "../api/axios";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useSocket } from "../context/socket";

const TaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().min(1, "Description is required"),
  dueDate: z.string().min(1, "Due date is required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"]),
  assignedToId: z.string().optional().or(z.literal("")),
});

type TaskInput = z.infer<typeof TaskSchema>;

export default function TaskForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const socket = useSocket();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<TaskInput>({
    resolver: zodResolver(TaskSchema),
    defaultValues: {
      priority: "MEDIUM",
      status: "TODO"
    }
  });

  // If editing, fetch task data
  useEffect(() => {
    if (id) {
      api.get(`/tasks/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }).then(res => {
        const task = res.data;
        // Format date for datetime-local input (YYYY-MM-DDThh:mm)
        if (task.dueDate) {
          task.dueDate = new Date(task.dueDate).toISOString().slice(0, 16);
        }
        Object.keys(task).forEach(key => {
            setValue(key as keyof TaskInput, task[key] ?? "");
        });
      });
    }
  }, [id, setValue]);

  const onSubmit = async (data: TaskInput) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      };

      // Clean up assignedToId if it's an empty string
      const payload = {
        ...data,
        ...(data.assignedToId ? { assignedToId: data.assignedToId } : {}),
        };


      if (id) {
        await api.patch(`/tasks/${id}`, payload, config);
      } else {
        await api.post("/tasks", payload, config);
      }

      // FIXED: TanStack Query v5 syntax
      queryClient.invalidateQueries({ queryKey: ["tasks"] });

      navigate("/dashboard");
    } catch (err: any) {
      alert(err.response?.data?.error || "Task save failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white border border-gray-200 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">{id ? "Edit Task" : "Create New Task"}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input type="text" {...register("title")} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea {...register("description")} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none h-24" />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
          <input type="datetime-local" {...register("dueDate")} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
          {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select {...register("priority")} className="w-full p-2 border rounded-md bg-white">
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select {...register("status")} className="w-full p-2 border rounded-md bg-white">
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="REVIEW">Review</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assign to (User ID)</label>
          <input type="text" {...register("assignedToId")} placeholder="Optional" className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={() => navigate("/dashboard")} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold">
            {id ? "Save Changes" : "Create Task"}
          </button>
        </div>
      </form>
    </div>
  );
}