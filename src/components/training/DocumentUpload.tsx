import { useState } from "react";
import { Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trainingAPI } from "@/services/api";
import { ChecksumUtils } from "@/utils/checksum";

interface DocumentUploadProps {
  onUploadSuccess: () => void;
}

interface UploadProgress {
  [key: string]: {
    filename: string;
    clientChecksum: string;
    progress: number;
    status: "computing" | "uploading" | "verifying" | "success" | "error";
    message: string;
  };
}

export function DocumentUpload({ onUploadSuccess }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});

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
      const fileKey = `${file.name}-${Date.now()}`;
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
      setUploadProgress((prev) => ({
        ...prev,
        [fileKey]: {
          filename: file.name,
          clientChecksum: "",
          progress: 0,
          status: "computing",
          message: "Computing client-side checksum...",
        },
      }));

      try {
        setUploadProgress((prev) => ({
          ...prev,
          [fileKey]: { ...prev[fileKey], progress: 25, message: "Computing SHA256..." },
        }));

        const clientChecksum = await ChecksumUtils.computeSHA256(file);

        setUploadProgress((prev) => ({
          ...prev,
          [fileKey]: {
            ...prev[fileKey],
            clientChecksum,
            progress: 50,
            status: "uploading",
            message: "Uploading to server...",
          },
        }));

        const response = await trainingAPI.uploadDocumentWithChecksum(file, clientChecksum);

        setUploadProgress((prev) => ({
          ...prev,
          [fileKey]: {
            ...prev[fileKey],
            progress: 75,
            status: "verifying",
            message: "Verifying two-way integrity...",
          },
        }));

        const verificationResult = response as {
          verified: boolean;
          client_checksum: string;
          server_checksum: string;
          match: boolean;
        };

        if (verificationResult.match) {
          setUploadProgress((prev) => ({
            ...prev,
            [fileKey]: {
              ...prev[fileKey],
              progress: 100,
              status: "success",
              message: "✓ Two-way verification successful",
            },
          }));

          toast.success(`✓ Uploaded & verified: ${file.name}`);
          onUploadSuccess();

          setTimeout(() => {
            setUploadProgress((prev) => {
              const updated = { ...prev };
              delete updated[fileKey];
              return updated;
            });
          }, 2000);
        } else {
          setUploadProgress((prev) => ({
            ...prev,
            [fileKey]: {
              ...prev[fileKey],
              status: "error",
              message: "✗ Checksum mismatch - integrity verification failed",
            },
          }));

          toast.error(
            `✗ Checksum mismatch: ${file.name}. File may be corrupted during upload.`
          );
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        setUploadProgress((prev) => ({
          ...prev,
          [fileKey]: {
            ...prev[fileKey],
            status: "error",
            message: message,
          },
        }));

        toast.error(`Upload failed: ${message}`);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="space-y-4">
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
          Supported formats: PDF, TXT, MD, JSON (Max 50MB) • Two-way checksum verification
        </p>
      </div>

      {Object.entries(uploadProgress).map(([key, progress]) => (
        <div
          key={key}
          className="p-4 rounded-lg border border-border bg-card/50 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              {progress.filename}
            </span>
            {progress.status === "success" && (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            )}
            {progress.status === "error" && (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            {["computing", "uploading", "verifying"].includes(progress.status) && (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            )}
          </div>

          <p className="text-xs text-muted-foreground">{progress.message}</p>

          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                progress.status === "error"
                  ? "bg-red-500"
                  : progress.status === "success"
                    ? "bg-green-500"
                    : "bg-primary"
              }`}
              style={{ width: `${progress.progress}%` }}
            />
          </div>

          {progress.clientChecksum && (
            <p className="text-xs font-mono text-muted-foreground">
              Client: {progress.clientChecksum.substring(0, 16)}...
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
