import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Settings, Shield, Database, Zap, ExternalLink } from "lucide-react";

const SettingsPage = () => {
  return (
    <MainLayout>
      {/* Header */}
      <header className="px-6 py-4 border-b border-border bg-card/30 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-primary" />
          <div>
            <h1 className="text-lg font-semibold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Configure your CyberAI experience
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Safety Settings */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Safety Settings</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Content Filter</p>
                  <p className="text-xs text-muted-foreground">
                    Block requests for illegal activities
                  </p>
                </div>
                <Switch defaultChecked disabled />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Educational Disclaimers</p>
                  <p className="text-xs text-muted-foreground">
                    Add warnings for sensitive topics
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Defense Perspective</p>
                  <p className="text-xs text-muted-foreground">
                    Include countermeasures in responses
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>

          {/* AI Configuration */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-5 h-5 text-secondary" />
              <h2 className="font-semibold">AI Configuration</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Model</label>
                <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm">
                  <option>Gemini 2.5 Flash (Default)</option>
                  <option>Gemini 2.5 Pro</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Response Style</label>
                <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm">
                  <option>Detailed with code examples</option>
                  <option>Concise</option>
                  <option>Tutorial style</option>
                </select>
              </div>
            </div>
          </div>

          {/* Data & Storage */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-5 h-5 text-terminal-cyan" />
              <h2 className="font-semibold">Data & Storage</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Chat History</p>
                  <p className="text-xs text-muted-foreground">
                    Store conversation history
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Button variant="outline" className="w-full">
                Clear All Chat History
              </Button>
              
              <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                Delete All Training Data
              </Button>
            </div>
          </div>

          {/* Resources */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="font-semibold mb-4">Recommended Resources</h2>
            
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "HackTheBox", url: "https://hackthebox.com" },
                { name: "TryHackMe", url: "https://tryhackme.com" },
                { name: "DVWA", url: "https://github.com/digininja/DVWA" },
                { name: "PortSwigger Academy", url: "https://portswigger.net/web-security" },
              ].map((resource) => (
                <a
                  key={resource.name}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-background border border-border rounded-md hover:border-primary/50 transition-colors text-sm"
                >
                  <ExternalLink className="w-4 h-4 text-primary" />
                  {resource.name}
                </a>
              ))}
            </div>
          </div>

          {/* Version Info */}
          <div className="text-center text-xs text-muted-foreground font-mono">
            <p>CyberSecurity AI v1.0.0</p>
            <p className="text-primary mt-1">Educational Purpose Only</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
