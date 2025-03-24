"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, Send, Loader2, RefreshCw } from "lucide-react";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";




const Information = () => (
    <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-5 rounded-r-lg" role="alert">
        <p className="font-bold text-base mb-2">ℹ️ Information & Goal</p>
        <p className="mb-2 text-sm">
            Your goal is to leak the Bot's flag to a remote host by submitting a URL, below are the sequence of actions the bot will perform after receiving a URL:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Open the latest version of Firefox <Image className="inline-block align-middle" src="/firefox.png" alt="Firefox" width={16} height={16} /></li>
            <li>Visit the Challenge page URL</li>
            <li>Login using the flag as the password</li>
            <li>Navigate to the provided URL</li>
            <li>Click at the center of the page</li>
            <li>Wait 60 seconds then close the browser</li>
        </ul>
    </div>
);

const Rules = () => (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-5 rounded-r-lg" role="alert">
        <p className="font-bold text-base mb-2">📜 Rules & Instructions</p>
        <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Intended solution should work on the latest version of Chromium <Image src="/chromium.png" alt="Chromium" className="inline-block align-middle" width={16} height={16} /> & Firefox <Image src="/firefox.png" alt="Firefox" className="inline-block align-middle" width={16} height={16} /></li>
            <li>Please test your POC locally & ensure it works on the <a target="_blank" href="https://www.mozilla.org/en-US/firefox/new/"><span className="hover:text-blue-500" style={{ textDecoration: "underline", textDecorationColor: "red" }}>latest stable version of Firefox</span></a> before submitting a URL</li>
            <li>You may submit 1 URL every 30 minutes</li>
            <li>Have fun and happy hacking! 🎉</li>
        </ul>
    </div>
);

const SubmissionForm = ({ inputUrl, setInputUrl, handleSubmit, isSubmitting, error }) => (
    <form onSubmit={(e) => handleSubmit(e)}
        className="space-y-3">
        {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-5 rounded-r-lg" role="alert">
                <p className="font-bold text-base mb-2">⚠️ Error</p>
                <p className="text-sm">{error}</p>
            </div>
        )}
        <Input
            type="url"
            placeholder="https://..."
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            required
            className="text-base p-5"
        />
        <Button type="submit" className="w-full text-base py-5" disabled={isSubmitting}>
            {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <>
                    <Send className="mr-2 h-4 w-4" /> Submit Solution
                </>
            )}
        </Button>
    </form>
);

const BotStatus = ({ botStatus, urlQueue, isLoading, onRefresh }) => (
    <div className="w-full lg:w-96">
        <Card className="sticky top-6">
            <CardHeader>
                <CardTitle className="flex items-center text-xl">
                    <span className="mr-2" role="img" aria-label="Robot">
                        🤖
                    </span>{" "}
                    Bot Status
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-5 flex items-center justify-between">
                    {isLoading ? (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-base font-medium bg-gray-100 text-gray-800">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
                        </span>
                    ) : (
                        <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-base font-medium ${botStatus === "Idle"
                                ? "bg-blue-100 text-blue-800"
                                : botStatus === "Working"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                        >
                            {botStatus === "Idle"
                                ? "😴 Idle, waiting for URLs..."
                                : botStatus === "Working"
                                    ? "🏃‍♂️ Working..."
                                    : "🔌 Offline"}
                        </span>
                    )}
                    {!isLoading && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onRefresh}
                            className="ml-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    )}
                </div>
                {botStatus === "Working" && urlQueue.length > 0 && (
                    <div>
                        <h4 className="text-lg font-medium mb-3">🚦 Queue</h4>
                        <ScrollArea className="h-[250px] w-full rounded-md border p-3">
                            {urlQueue.map((url, index) => (
                                <div
                                    key={index}
                                    className={`flex items-center py-2 ${index === 0 ? "text-green-600" : "text-gray-600"}`}
                                >
                                    {index === 0 ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <AlertCircle className="mr-2 h-4 w-4" />
                                    )}
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="text-sm truncate overflow-hidden whitespace-nowrap">
                                                    {url}
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{url}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            ))}
                        </ScrollArea>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
);

export default function SubmissionPage() {
    const [botStatus, setBotStatus] = useState("Loading...");
    const [urlQueue, setUrlQueue] = useState([]);
    const [inputUrl, setInputUrl] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [Error, setError] = useState(null);
    const { toast } = useToast();

    const fetchBotStatus = async () => {
        try {
            const response = await fetch("/api/bot");
            if (!response.ok) {
                setError("Failed to fetch bot status");
                setTimeout(() => setError(null), 5000);
            }
            const data = await response.json();
            if (data.status === "ok") {
                setBotStatus(data.urls.length === 0 ? "Idle" : "Working");
                setUrlQueue(data.urls.reverse());
            } else {
                setBotStatus("Offline");
            }
        } catch (error) {
            console.error("Error fetching bot status:", error);
            setBotStatus("Offline");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBotStatus();
    }, []);

    const handleRefresh = () => {
        setIsLoading(true);
        fetchBotStatus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputUrl) return;

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/bot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: inputUrl }),
            });
            if (response.status === 429) {
                setError("You have already submitted a URL. Please wait 30 minutes.");
                setTimeout(() => setError(null), 5000);
                return;
            }
            if (!response.ok) {
                setError("Failed to submit URL");
                setTimeout(() => setError(null), 5000);
                return;
            }
            toast({
                title: "🎉 URL submitted successfully 🎉",
                variant: "success",
            });
            setBotStatus("Working");
            setUrlQueue((prev) => [...prev, inputUrl]);
            setInputUrl("");
        } catch (error) {
            console.error("Error submitting URL:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6">
            <Header />
            <div className="flex flex-col lg:flex-row mt-6 gap-6">
                <div className="flex-1 space-y-6">
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle className="text-2xl">🏆 Found the solution? 🏆</CardTitle>
                            <CardDescription className="text-lg">Submit your POC below 👇</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <Information />
                            <Rules />
                            <SubmissionForm
                                error={Error}
                                inputUrl={inputUrl}
                                setInputUrl={setInputUrl}
                                handleSubmit={handleSubmit}
                                isSubmitting={isSubmitting}
                            />
                        </CardContent>
                    </Card>
                </div>

                <BotStatus
                    botStatus={botStatus}
                    urlQueue={urlQueue}
                    isLoading={isLoading}
                    onRefresh={handleRefresh}
                />
            </div>
        </div>
    );
}