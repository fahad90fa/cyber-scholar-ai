import { useEffect, useState } from "react";
import { Trash2, FileText, Loader2, Shield, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trainingAPI } from "@/services/api";

interface Document {
  id: string;
  filename: string;
  source_name: string;
  file_type: string;
  chunk_count: number;
  checksum_sha256?: string;
  file_size?: number;
  created_at: string;
}

interface DocumentListProps {
  refreshTrigger?: number;
}

interface VerificationState {
  [key: string]: { status: string; message: string; loading: boolean };
}

export function DocumentList({ refreshTrigger = 0 }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<VerificationState>({});

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await trainingAPI.getDocuments();
      setDocuments(docs as Document[]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to load documents: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [refreshTrigger]);

  const handleDelete = async (sourceName: string) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    setDeleting(sourceName);
    try {
      await trainingAPI.deleteDocument(sourceName);
      setDocuments(docs => docs.filter(d => d.source_name !== sourceName));
      toast.success("Document deleted");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Delete failed: ${message}`);
    } finally {
      setDeleting(null);
    }
  };

  const handleVerifyIntegrity = async (sourceName: string) => {
    setVerifying(v => ({ ...v, [sourceName]: { status: "loading", message: "", loading: true } }));
    try {
      const result = await trainingAPI.verifyDocumentIntegrity(sourceName) as {
        verified: boolean;
        status: string;
        message: string;
        checksum?: string;
      };
      setVerifying(v => ({
        ...v,
        [sourceName]: {
          status: result.status,
          message: result.message,
          loading: false
        }
      }));
      if (result.verified) {
        toast.success("✓ Document integrity verified");
      } else {
        toast.error(`✗ ${result.message}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Verification failed";
      setVerifying(v => ({ ...v, [sourceName]: { status: "error", message, loading: false } }));
      toast.error(`Verification error: ${message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No documents uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map(doc => {
        const verification = verifying[doc.source_name];
        return (
          <div
            key={doc.id}
            className="p-4 border border-border rounded-lg bg-card/50 hover:bg-card transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3 flex-1">
                <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground truncate">
                    {doc.filename}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {doc.chunk_count} chunks • {doc.file_type.toUpperCase()} •{" "}
                    {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB • ` : ""}
                    {new Date(doc.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                {doc.checksum_sha256 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVerifyIntegrity(doc.source_name)}
                    disabled={verification?.loading || deleting === doc.source_name}
                    className="text-blue-400 hover:text-blue-300"
                    title="Verify file integrity"
                  >
                    {verification?.loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : verification?.status === "ok" ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : verification?.status ? (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <Shield className="w-4 h-4" />
                    )}
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(doc.source_name)}
                  disabled={deleting === doc.source_name || verification?.loading}
                  className="text-destructive hover:text-destructive/80"
                >
                  {deleting === doc.source_name ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {doc.checksum_sha256 && (
              <div className="ml-8 text-xs text-muted-foreground font-mono">
                SHA256: {doc.checksum_sha256.substring(0, 16)}...
                {verification && (
                  <span className={`ml-2 ${verification.status === "ok" ? "text-green-500" : "text-red-500"}`}>
                    [{verification.status === "ok" ? "✓ OK" : "✗ " + verification.status}]
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
