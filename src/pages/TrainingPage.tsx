import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { AlertCircle } from "lucide-react";
import { DocumentUpload } from "@/components/training/DocumentUpload";
import { DocumentList } from "@/components/training/DocumentList";

const TrainingPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
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
          <DocumentUpload onUploadSuccess={handleUploadSuccess} />

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
            <h3 className="font-semibold">Uploaded Documents</h3>
            <DocumentList refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TrainingPage;
