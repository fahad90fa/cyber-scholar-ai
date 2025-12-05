import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrainingDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: Date;
  status: "processing" | "ready" | "error";
}

const TrainingPage = () => {
  const [documents, setDocuments] = useState<TrainingDocument[]>([
    {
      id: "1",
      name: "OWASP_Testing_Guide.pdf",
      type: "PDF",
      size: "2.4 MB",
      uploadedAt: new Date(Date.now() - 86400000),
      status: "ready",
    },
    {
      id: "2",
      name: "pentesting_notes.md",
      type: "Markdown",
      size: "156 KB",
      uploadedAt: new Date(Date.now() - 172800000),
      status: "ready",
    },
  ]);
  const [isDragging, setIsDragging] = useState(false);

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
    // Handle file upload - will be implemented with backend
    const files = Array.from(e.dataTransfer.files);
    console.log("Files dropped:", files);
  };

  const handleDelete = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  return (
    <MainLayout>
      {/* Header */}
      <header className="px-6 py-4 border-b border-border bg-card/30 backdrop-blur-sm">
        <h1 className="text-lg font-semibold text-foreground">Training Data</h1>
        <p className="text-sm text-muted-foreground">
          Upload documents to enhance AI knowledge with your custom content
        </p>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-card/50"
            )}
          >
            <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Upload Training Documents</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Drag and drop files here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              Supported: PDF, TXT, MD, JSON • Max size: 10MB
            </p>
            <Button variant="outline" className="mt-4">
              Browse Files
            </Button>
          </div>

          {/* Info Box */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-secondary" />
              How Training Works
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Documents are processed and split into semantic chunks</li>
              <li>• Chunks are embedded and stored in vector database</li>
              <li>• Relevant content is retrieved during chat conversations</li>
              <li>• Your documents enhance AI responses with custom knowledge</li>
            </ul>
          </div>

          {/* Document List */}
          <div className="space-y-3">
            <h3 className="font-semibold">Uploaded Documents ({documents.length})</h3>
            
            {documents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No documents uploaded yet</p>
              </div>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.type} • {doc.size} • {doc.uploadedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {doc.status === "ready" && (
                      <span className="flex items-center gap-1 text-xs text-primary">
                        <CheckCircle2 className="w-3 h-3" />
                        Ready
                      </span>
                    )}
                    {doc.status === "processing" && (
                      <span className="text-xs text-terminal-amber">Processing...</span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(doc.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TrainingPage;
