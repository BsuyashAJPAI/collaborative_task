import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, LogIn } from "lucide-react";

const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginInput = z.infer<typeof LoginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema)
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      const res = await api.post("/auth/login", data);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user.id);
      navigate("/dashboard");
    } catch (err: any) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  return (
    /* This outer div handles the full-screen centering and background color */
    <div className="min-h-screen w-full bg-[#f3f4f6] flex items-center justify-center p-4 m-0 font-sans">
      
      {/* Main Card Container */}
      <div className="w-full max-w-[450px] bg-white rounded-[20px] shadow-2xl p-10 border border-gray-100 flex flex-col items-center">
        
        {/* Header Section */}
        <div className="w-full text-left mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-1">Sign in</h2>
          <p className="text-gray-500 text-sm">Welcome back! Please enter your details</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
          {/* Email Address */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input 
                type="email" 
                {...register("email")} 
                placeholder="you@example.com" 
                className={`w-full pl-12 pr-4 py-3 bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all`}
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input 
                type="password" 
                {...register("password")} 
                placeholder="••••••••" 
                className={`w-full pl-12 pr-4 py-3 bg-gray-50 border ${errors.password ? 'border-red-500' : 'border-gray-200'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all`}
              />
            </div>
            {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] mt-2"
          >
            Sign In
            <LogIn size={20} />
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm">
          <span className="text-gray-500">Don't have an account? </span>
          <Link to="/register" className="text-blue-600 font-bold hover:underline ml-1">
            Create one now
          </Link>
        </div>
      </div>
    </div>
  );
}