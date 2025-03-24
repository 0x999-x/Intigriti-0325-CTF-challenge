"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const { toast } = useToast();

    useEffect(() => {
        const authFlag = localStorage.getItem("isAuthenticated");
        if (authFlag === "true") {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
        setIsLoading(false);
    }, []);

    const login = () => {
        localStorage.setItem("isAuthenticated", "true");
        setIsAuthenticated(true);
    };

    const logout = async () => {
        const res = await fetch("/api/auth", {
            method: "DELETE",
        });
        if (!res.ok) {
            const data = await res.json();
            console.error("Failed to logout", data.message);
            return;
        }

        const data = await res.json();
        toast({
            title: data.message,
            variant: "success",
        });
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("notes");
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);