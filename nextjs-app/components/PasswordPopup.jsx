import { CopyButton } from "@/components/CopyButton";
import { Button } from "@/components/ui/button";

export const PasswordPopup = ({ password, onClose }) => {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
        <div className="bg-white/90 p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
          <h2 className="text-xl font-bold mb-4">Your Generated password</h2>
          <p className="text-2xl font-mono bg-gray-100 p-3 rounded-md mb-4">
            {password}<CopyButton textToCopy={password} />
          </p>
          <p className="text-gray-600 mb-4">
            Please save this password. You will need it to access this note later.
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    );
  };