import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Check, Circle, Loader2, Terminal } from "lucide-react";
import { documentIntakeSteps } from "@/data/complianceData";

interface IntakeStep {
  label: string;
  completed: boolean;
}

interface DocumentIntakeProps {
  onAnalysisComplete: (result: any) => void;
}

export const DocumentIntake = ({ onAnalysisComplete }: DocumentIntakeProps) => {
  const [steps, setSteps] = useState<IntakeStep[]>(documentIntakeSteps);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const resetSteps = () => {
    setSteps(documentIntakeSteps.map(s => ({ ...s, completed: false })));
  };

  const markStepComplete = (index: number) => {
    setSteps(prev =>
      prev.map((step, i) =>
        i === index ? { ...step, completed: true } : step
      )
    );
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    setFiles(selected);
    setUploadedFiles(selected.map(f => f.name));
    resetSteps();
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Please select at least one document.");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      markStepComplete(0); // Documents received

      const formData = new FormData();
      files.forEach(file => formData.append("files", file));

      markStepComplete(1); // Uploading

      const res = await fetch("http://localhost:8000/analyze/document", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Document analysis failed");
      }

      markStepComplete(2); // Parsing

      const result = await res.json();

      markStepComplete(3); // Agents complete

      onAnalysisComplete(result);

      markStepComplete(4); // Case created
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unexpected error occurred");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="tech-card">
      <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2">
        <Terminal className="w-4 h-4 text-primary" />
        <h3 className="font-semibold font-mono text-sm">DOCUMENT_INTAKE</h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Upload Area */}
        <label className="border border-dashed border-primary/30 rounded-lg p-6 text-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all block">
          <Upload className="w-8 h-8 mx-auto mb-3 text-primary/50" />
          <p className="text-sm font-mono">Upload Property Documents</p>
          <p className="text-xs text-muted-foreground font-mono mb-3">
            Sale Deed • Stamp Receipt • Registration Extract (PDF)
          </p>
          <input
            type="file"
            accept="application/pdf"
            multiple
            hidden
            onChange={handleFileSelect}
          />
        </label>

        <Button
          size="sm"
          onClick={handleUpload}
          disabled={uploading}
          className="w-full bg-primary text-primary-foreground font-mono"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ANALYZING…
            </>
          ) : (
            "ANALYZE_DOCUMENTS"
          )}
        </Button>

        {error && (
          <p className="text-xs text-red-500 font-mono">{error}</p>
        )}

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-xs bg-primary/5 border border-primary/20 rounded px-3 py-2 font-mono"
              >
                <FileText className="w-4 h-4 text-primary" />
                <span>{file}</span>
                <Check className="w-4 h-4 text-emerald-500 ml-auto" />
              </div>
            ))}
          </div>
        )}

        {/* Step Tracker */}
        <div className="space-y-2 pt-2">
          <p className="text-[10px] font-mono text-primary uppercase tracking-wider">
            PROCESSING_STATUS
          </p>
          {steps.map((step, index) => (
            <div key={index} className="flex items-center gap-3 font-mono">
              {step.completed ? (
                <div className="w-5 h-5 rounded bg-emerald-500/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-emerald-400" />
                </div>
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground/30" />
              )}
              <span
                className={`text-xs ${
                  step.completed
                    ? "text-emerald-400"
                    : "text-muted-foreground/50"
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

