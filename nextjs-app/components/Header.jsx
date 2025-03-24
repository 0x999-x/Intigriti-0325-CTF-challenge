"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SquareArrowLeft, FolderDown, LogOut, Bot } from "lucide-react";
import { DrippingFaucet } from "@/components/DrippingFaucet";

export const Header = ({ handleLogout, note_password }) => {
    const pathname = usePathname();

    const routes = {
        "/notes": {
            title: "My Notes",
            buttons: (
                <>
                    <Link href="source.zip">
                        <Button
                            variant="outline"
                            className="bg-green-300 hover:bg-green-400"
                        >
                            <span>Source Code</span>
                            <FolderDown className="w-3 h-3" />
                        </Button>
                    </Link>
                    <Link href="/submit-solution">
                        <Button variant="outline" className="bg-blue-300 hover:bg-blue-400">
                            Bot
                            <Bot className="w-4 h-4" />
                        </Button>
                    </Link>
                    <Button
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-200"
                        onClick={handleLogout}
                    >
                        Logout
                        <LogOut className="w-4 h-4" />
                    </Button>
                </>
            ),
        },
        "/submit-solution": {
            title: "Challenge Submissions",
            buttons: (
                <Link href="/notes">
                    <Button variant="ghost" className="text-gray-600 hover:text-rose-600">
                        <SquareArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                </Link>
            ),
        },
        "/note/:id": {
            title: "My Note",
            buttons: !note_password ? (
                <Link href="/notes">
                    <Button variant="ghost" className="text-gray-600 hover:text-rose-600">
                        <SquareArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                </Link>
            ) : null,
        },
    };

    const { title, buttons } =
        routes[
            pathname === "/notes"
                ? "/notes"
                : pathname === "/submit-solution"
                ? "/submit-solution"
                : "/note/:id"
        ] || {
            title: "My Notes",
            buttons: null,
        };

    return (
        <header className="flex flex-col md:flex-row md:items-center justify-between bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
                <DrippingFaucet className="w-14 h-14 text-[#4A90E2]" />
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{title}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3 font-medium">
                {buttons}
            </div>
        </header>
    );
};



