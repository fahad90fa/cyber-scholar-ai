import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trainingAPI } from "@/services/api";

interface DocumentUploadProps {
  onUploadSuccess: () => void;
}

export function DocumentUpload({ onUploadSuccess }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    for (const file of files) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      const allowed = ["pdf", "txt", "md", "json"];

      if (!allowed.includes(ext || "")) {
        toast.error(`Invalid file type: ${file.name}. Allowed: PDF, TXT, MD, JSON`);
        continue;
      }

      if (file.size > 50 * 1024 * 1024) {
        toast.error(`File too large: ${file.name}. Max 50MB`);
        continue;
      }

      setIsUploading(true);
      try {
        await trainingAPI.uploadDocument(file);
        toast.success(`Uploaded: ${file.name}`);
        onUploadSuccess();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        toast.error(`Upload failed: ${message}`);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border bg-background hover:border-primary/50"
      }`}
    >
      <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Upload Training Documents
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Drag and drop files here, or click to select
      </p>

      <label>
        <Button
          variant="secondary"
          size="sm"
          disabled={isUploading}
          type="button"
          asChild
        >
          <span>
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Select Files
              </>
            )}
          </span>
        </Button>
        <input
          type="file"
          multiple
          accept=".pdf,.txt,.md,.json"
          onChange={handleFileSelect}
          disabled={isUploading}
          className="hidden"
        />
      </label>

      <p className="text-xs text-muted-foreground mt-4">
        Supported formats: PDF, TXT, MD, JSON (Max 50MB)
      </p>
    </div>
  );
}
