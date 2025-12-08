import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-content prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown
        components={{
          h1: ({node, ...props}) => <h1 className="text-lg font-bold mt-3 mb-2 break-words" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-base font-bold mt-2.5 mb-1.5 break-words" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-sm font-bold mt-2 mb-1 break-words" {...props} />,
          p: ({node, ...props}) => <p className="mb-2 break-words" {...props} />,
          li: ({node, ...props}) => <li className="ml-6 mb-1 break-words" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc mb-2" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal mb-2 ml-4" {...props} />,
          strong: ({node, ...props}) => <strong className="font-semibold text-primary" {...props} />,
          em: ({node, ...props}) => <em className="italic text-muted-foreground" {...props} />,
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match;
            
            if (isInline) {
              return (
                <code className="bg-muted px-1.5 py-0.5 rounded text-primary font-mono text-sm break-words" {...props}>
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock language={match[1]}>
                {String(children).replace(/\n$/, "")}
              </CodeBlock>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

interface CodeBlockProps {
  language: string;
  children: string;
}

function CodeBlock({ language, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4 rounded-lg overflow-hidden border border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
        <span className="text-xs font-mono text-muted-foreground uppercase">
          {language}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 mr-1 text-primary" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>
      
      {/* Code */}
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          padding: "1rem",
          background: "hsl(var(--card))",
          fontSize: "0.875rem",
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}
