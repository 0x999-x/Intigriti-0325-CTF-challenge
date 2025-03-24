'use client';
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";

export default function Error({ error, reset }) {
  const { logout } = useAuth();
    const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#ee9ca7] to-[#ffdde1]">
      <div className="text-center space-y-8 p-8 bg-white/30 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20">
        <p className="text-2xl text-gray-700 font-medium">Oops! Something went wrong.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-8 py-3 bg-cyan-800 text-white rounded-xl shadow-lg hover:bg-cyan-600 transition-all duration-200"
          >
            Try Again
          </button>
          <button
            onClick={() => logout() && router.push("/")}
            className="px-8 py-3 bg-pink-600 text-white rounded-xl shadow-lg hover:bg-pink-400 transition-all duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}