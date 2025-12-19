import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/axios";
import { useSocket } from "../context/socket";
import toast from "react-hot-toast";

type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "COMPLETED";
  creatorId: string;
  assignedToId?: string;
};

export default function Dashboard() {
  const queryClient = useQueryClient();
  const socket = useSocket();

  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterPriority, setFilterPriority] = useState<string>("ALL");

  const { data: tasks, isLoading, isError } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await api.get("/tasks", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      return res.data;
    },
  });

  // --- DELETE HANDLER ---
  const handleDelete = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      await api.delete(`/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      // Refresh local data
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task deleted successfully");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete task");
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    };

    // Global Listeners
    socket.on("taskCreated", handleUpdate);
    socket.on("taskUpdated", handleUpdate);
    socket.on("taskDeleted", handleUpdate);

    // --- ASSIGNMENT NOTIFICATION LISTENER ---
    const userId = localStorage.getItem("userId");
    if (userId) {
      socket.on(`assignedTo:${userId}`, (task: Task) => {
        toast.success(`New Task Assigned: ${task.title}`, {
          duration: 5000,
          icon: '📝',
        });
        handleUpdate();
      });
    }

    return () => {
      socket.off("taskCreated", handleUpdate);
      socket.off("taskUpdated", handleUpdate);
      socket.off("taskDeleted", handleUpdate);
      if (userId) socket.off(`assignedTo:${userId}`);
    };
  }, [socket, queryClient]);

  if (isLoading) return <p className="p-6">Loading tasks...</p>;
  if (isError) return <p className="p-6 text-red-500">Error loading tasks.</p>;

  const filteredTasks = tasks?.filter((task) => {
    return (
      (filterStatus === "ALL" || task.status === filterStatus) &&
      (filterPriority === "ALL" || task.priority === filterPriority)
    );
  }) ?? [];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Collaborative Dashboard</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border p-2 rounded-md bg-white">
          <option value="ALL">All Status</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="REVIEW">Review</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="border p-2 rounded-md bg-white">
          <option value="ALL">All Priority</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <div key={task.id} className="flex flex-col p-5 border rounded-xl shadow-sm bg-white border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-lg font-bold text-gray-900">{task.title}</h2>
              <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-800">
                {task.priority}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">{task.description}</p>
            
            <div className="mt-auto flex justify-between items-center">
               <div className="text-xs text-gray-500">
                 <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                 <p className="capitalize">Status: {task.status.toLowerCase()}</p>
               </div>
               
               {/* DELETE BUTTON */}
               <button
                 onClick={() => handleDelete(task.id)}
                 className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded transition-colors"
               >
                 Delete
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}