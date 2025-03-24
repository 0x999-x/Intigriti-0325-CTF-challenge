"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import { DrippingFaucet } from "@/components/DrippingFaucet";

export default function Home() {
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const { toast } = useToast();
  const router = useRouter();
  const { isAuthenticated, isLoading, login, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      toast({
        title: "❤️ Successfully logged in ❤️",
        variant: "success",
        duration: 2000,
      });
      router.push("/notes");
    }
  }, [isAuthenticated, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast({
        title: "❤️ Please enter a username and password ❤️",
        variant: "destructive",
      });
      return;
    }

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      toast({
        title: data.message,
        variant: "destructive",
      });
      return;
    }

    const data = await res.json();
    toast({
      title: data.message,
      variant: "success"
    });

    login();
    router.push("/notes");
  };

  return (
    <div className="w-full max-w-md space-y-8 bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-xl">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <DrippingFaucet className="w-44 h-44 relative text-[#4A90E2]" p="1" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900">Welcome to Leaky Flagment</h1>
        <p className="text-sm text-gray-600">Enter your username and password to view your notes.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          placeholder="Enter your username..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full"
        />
        <Input
          type="password"
          placeholder="Enter your password..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full"
        />
        <Button type="submit" className="w-full">
          Enter
        </Button>
      </form>
    </div>
  );
}
