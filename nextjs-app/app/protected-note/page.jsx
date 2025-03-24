"use client";
import { useState, useEffect } from "react";
import { LockIcon } from "@/components/Icons";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";


export default function PasswordProtectedNote() {
    const [isSuccess, setIsSuccess] = useState(false);
    const [isMounted, setisMounted] = useState(false);
    const { isAuthenticated, isLoading, login, logout } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        const checkAuthAndNotes = async () => {
          if (!isLoading && !isAuthenticated) {
            toast({
              title: "❤️ Please login to continue ❤️",
              variant: "destructive",
            });
            router.push("/");
          } else if (isAuthenticated) {
            await fetchNotes();
          }
        };
    
        checkAuthAndNotes();
      }, [isAuthenticated, isLoading]);
       const fetchNotes = async () => {
    try {
      const res = await fetch("/api/post", {
        method: "GET",
      });
      if (!res.ok) {
        const data = await res.json();
        toast({
          title: data.message,
          variant: "destructive",
        });
        await logout();
      } else {
        const data = await res.json();
        localStorage.setItem("notes", JSON.stringify(data.notes));
      }
    } catch (error) {
      toast({
        title: "An error occurred",
        description: "Failed to fetch notes. Please try again.",
        variant: "destructive",
      });
    } 
  };
    useEffect(() => {
        if(window.opener){
        window.opener.postMessage({ type: "childLoaded" }, "*");
        }
        setisMounted(true);
        const handleMessage = (event) => {
            if (event.data.type === "submitPassword") {
                validatepassword(event.data.password);
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);

    const validatepassword = (submittedpassword) => {
        const notes = JSON.parse(localStorage.getItem("notes") || "[]");
        const foundNote = notes.find(note => note.password === submittedpassword);

        if (foundNote) {
            window.opener.postMessage({ type: "success", noteId: foundNote.id }, "*");
            setIsSuccess(true);
        } else {
            window.opener.postMessage({ type: "error" }, "*");
            setIsSuccess(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-[#ee9ca7] to-[#ffdde1] p-4 flex items-center justify-center">
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-lg text-center max-w-md w-full">
                {isSuccess ? (
                    <div>
                        <h1 className="text-2xl font-bold text-gray-700">Success!</h1>
                        <p className="text-gray-600 mt-4">Redirecting...</p>
                    </div>
                ) : !isMounted ? (
                    <div className="flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spassword text-gray-700" />
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <LockIcon className="w-8 h-8 text-gray-700" />
                            <h1 className="text-2xl font-bold text-gray-700">Protected Note</h1>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Password is required to unlock this note.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}



