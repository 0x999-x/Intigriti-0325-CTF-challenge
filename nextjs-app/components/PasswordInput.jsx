import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export const PasswordInputCard = ({ onSubmit, isChildWindowLoaded }) => {
    const [password, setPassword] = useState("");
    const [err, setErr] = useState("");
  
    const handleSubmit = () => {
      if (password.length === 10) {
        onSubmit(password);
      } else {
        setErr("Password must be 10 characters long");
      }
    };
  
    return (
      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg space-y-4">
        {isChildWindowLoaded ? (
          <>
            <p className="text-gray-600 mb-6">
              This note is password-protected. Please enter the password to view it.
            </p>
            <Input
              type="password"
              placeholder="Enter 10-character password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={10}
              disabled={!isChildWindowLoaded}
              className="mb-4"
            />
            {err && <p className="text-red-500 text-sm mb-4">{err}</p>}
            <Button
              onClick={handleSubmit}
              disabled={!isChildWindowLoaded}
              className="w-full"
            >
              Submit
            </Button>
          </>
        ) : (
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        )}
      </div>
    );
  };