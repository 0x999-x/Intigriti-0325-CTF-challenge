"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NoteCard } from "@/components/Notecard";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { PasswordPopup } from "@/components/PasswordPopup";
import { PasswordInputCard } from "@/components/PasswordInput";
import { Header } from "@/components/Header";

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "", use_password: "false" });
  const [isSaving, setIsSaving] = useState(false);
  const [isNotesLoading, setIsNotesLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showpasswordPopup, setShowpasswordPopup] = useState(false);
  const [generatedpassword, setGeneratedpassword] = useState("");
  const [isChildWindowLoaded, setIsChildWindowLoaded] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [isChildWindowOpen, setIsChildWindowOpen] = useState(false);
  const notesPerPage = 8;
  const childWindowRef = useRef(null);

  const { toast } = useToast();
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading, login, logout } = useAuth();

  useEffect(() => {
    const checkAuthAndNotes = async () => {
      if (!isAuthLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isAuthLoading]);

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
        setNotes(data.notes.reverse());
        localStorage.setItem("notes", JSON.stringify(data.notes));
      }
    } catch (error) {
      toast({
        title: "An error occurred",
        description: "Failed to fetch notes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsNotesLoading(false);
    }
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!newNote.title.trim() || !newNote.content.trim()) {
      toast({
        title: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch("/api/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newNote),
      });

      if (!res.ok) {
        const data = await res.json();
        toast({
          title: data.message,
          variant: "destructive",
        });
        if (data.message === "Unauthorized") {
          await logout();
        }
        return;
      }

      const data = await res.json();
      setNotes([{ id: data.id, ...newNote, password: data.password }, ...notes]);
      const { use_password, ...newNoteData } = newNote;
      localStorage.setItem("notes", JSON.stringify([{ id: data.id, ...newNoteData, password: data.password }, ...notes]));
      setNewNote({ title: "", content: "", use_password: "false" });
      setIsCreating(false);

      if (data.password) {
        setGeneratedpassword(data.password);
        setShowpasswordPopup(true);
      }

      toast({
        title: "Note saved successfully",
        description: "Your note has been saved ❤️",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "An error occurred",
        description: "Failed to save the note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const toggleUsepassword = () => {
    setNewNote((prev) => ({ ...prev, use_password: prev.use_password === "true" ? "false" : "true" }));
  };

  const listener = useCallback((event) => {
    if (event.origin === window.location.origin && event.isTrusted) {
      if (event.data.type === "childLoaded") {
        setIsChildWindowLoaded(true);
      } else if (event.data.type === "success" && event.data.noteId) {
        toast({
          title: "🔓 Password Verified 🔓",
          description: "Redirecting to note...",
          variant: "success",
        });
        childWindowRef.current.focus();
        childWindowRef.current.location.href = `/view_protected_note?id=${event.data.noteId}`;
        window.removeEventListener("message", listener);
        setShowPasswordInput(false);
        setIsChildWindowOpen(false);
      } else if (event.data.type === "error") {
        toast({
          title: "Incorrect password",
          description: "Please try again.",
          variant: "destructive",
        });
        window.removeEventListener("message", listener);
        setShowPasswordInput(false);
        setIsChildWindowOpen(false);
        childWindowRef.current.close();
      }
    }
  }, []);
  

  const handlePasswordProtected = (noteId) => {
    setSelectedNoteId(noteId);
    setShowPasswordInput(true);
    setIsChildWindowLoaded(false);

    if (!childWindowRef.current || childWindowRef.current.closed) {
      const win = window.open("/protected-note", "Verify password", "width=650,height=650");
      if (!win) {
        toast({
          title: "Popup blocked",
          description: "Please allow popups for this site to proceed.",
          variant: "destructive",
        });
        return;
      }
      childWindowRef.current = win;
      setIsChildWindowOpen(true);
    } else {
      childWindowRef.current.focus();
      childWindowRef.current.location.href = "/protected-note";
    }

    window.addEventListener("message", listener);
  };

  const handlePasswordSubmit = (password) => {
    if (childWindowRef.current && !childWindowRef.current.closed) {
      childWindowRef.current.postMessage(
        { type: "submitPassword", password, noteId: selectedNoteId },
        window.location.origin
      );
    } else {
      setShowPasswordInput(false);
      toast({
        title: "Child window is closed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (isChildWindowOpen && childWindowRef.current) {
      const interval = setInterval(() => {
        if (childWindowRef.current.closed) {
          clearInterval(interval);
          setShowPasswordInput(false);
          window.removeEventListener("message", listener);
          setIsChildWindowLoaded(false);
          setIsChildWindowOpen(false);
          toast({
            title: "Child window closed",
            description: "The verification window was closed.",
            variant: "info",
          });
        }
      }, 500);

      return () => clearInterval(interval);
    }
  }, [isChildWindowOpen]);

  const indexOfLastNote = currentPage * notesPerPage;
  const indexOfFirstNote = indexOfLastNote - notesPerPage;
  const currentNotes = notes.slice(indexOfFirstNote, indexOfLastNote);

  const totalPages = Math.ceil(notes.length / notesPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const renderNoteCreationForm = () => (
    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg space-y-4">
      <Input
        placeholder="Note Title"
        value={newNote.title}
        onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
      />
      <Textarea
        placeholder="Write your note..."
        value={newNote.content}
        onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
        className="min-h-[200px]"
      />
      <div className="flex items-center gap-2">
        <Switch
          checked={newNote.use_password === "true"}
          onCheckedChange={toggleUsepassword}
        />
        <span>Use password</span>
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSaveNote} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Note"
          )}
        </Button>
        <Button variant="outline" onClick={() => setIsCreating(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );

  const renderNoteList = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {currentNotes.length > 0 ? (
        currentNotes.map((note) => (
          <div key={note.id} className="cursor-pointer">
            {note.password && showPasswordInput && selectedNoteId === note.id ? (
              <PasswordInputCard
                onSubmit={handlePasswordSubmit}
                isChildWindowLoaded={isChildWindowLoaded}
              />
            ) : (
              <div onClick={() => note.password && handlePasswordProtected(note.id)}>
                <a
                  key={note.id}
                  href={!note.password ? `/note/${note.id}` : "#"}
                  className="cursor-pointer"
                >
                  <NoteCard
                    title={note.title}
                    content={note.content}
                    className="bg-white/80"
                    password={note.password}
                  />
                </a>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="col-span-full flex justify-center items-center h-64">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-600 text-2xl font-semibold">
              No notes found 🥺
            </p>
            {!isCreating && (
              <p className="text-gray-500 mt-2">
                Click{" "}
                <button
                  onClick={() => setIsCreating(true)}
                  className="text-blue-600 underline hover:text-primary/80"
                >
                  here
                </button>{" "}
                to get started.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderPagination = () => (
    <div className="flex justify-center gap-4 mt-6">
      <Button
        onClick={goToPreviousPage}
        disabled={currentPage === 1}
        variant="outline"
      >
        Previous
      </Button>
      <span className="flex items-center text-gray-600">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        onClick={goToNextPage}
        disabled={currentPage === totalPages}
        variant="outline"
      >
        Next
      </Button>
    </div>
  );

  return (
    <div className="bg-gradient-to-r from-[#ee9ca7] to-[#ffdde1] p-4">
      {showpasswordPopup && (
        <PasswordPopup
          password={generatedpassword}
          onClose={() => setShowpasswordPopup(false)}
        />
      )}
      <div className="max-w-4xl mx-auto space-y-4">
        <Header handleLogout={handleLogout} />


        {isNotesLoading || !isAuthenticated ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            {isCreating ? (
              renderNoteCreationForm()
            ) : (
              <Button onClick={() => setIsCreating(true)} className="w-full">
                Create New Note
              </Button>
            )}
            {renderNoteList()}
            {notes?.length >= 8 && renderPagination()}
          </>
        )}
      </div>
    </div>
  );
}