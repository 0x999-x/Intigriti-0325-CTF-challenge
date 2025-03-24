"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";


export const NoteCard = ({ title, content, password, onClick, className }) => {
  return (
    <Card
      className={cn("cursor-pointer hover:shadow-lg transition-shadow", className)}
      onClick={onClick}>
      <CardHeader>
        <CardTitle className="text-xl mb-4 font-semibold text-primary text-center break-words">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-14 flex items-center justify-center overflow-hidden">
        <p className="text-sm text-muted-foreground line-clamp-3 text-center">
          {password ? "🔒 This note is password-protected 🔒" : ""}
        </p>
      </CardContent>
    </Card>
  );
};