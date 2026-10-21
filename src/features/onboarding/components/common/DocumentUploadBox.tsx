"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle2, Trash2, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { UploadedDocument } from "../../types";
import { validateUploadedFile, createMockUploadedDoc } from "../../utils/documentHelpers";
import { formatFileSize } from "../../utils/formatters";
import { VerificationBadge } from "./VerificationBadge";

interface DocumentUploadBoxProps {
  label: string;
  description?: string;
  required?: boolean;
  documentType: string;
  document?: UploadedDocument;
  onDocumentChange: (doc?: UploadedDocument) => void;
  error?: string;
}

export function DocumentUploadBox({
  label,
  description,
  required = false,
  documentType,
  document,
  onDocumentChange,
  error,
}: DocumentUploadBoxProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileProcess = (file: File) => {
    setUploadError(null);
    const validation = validateUploadedFile(file);

    if (!validation.isValid) {
      setUploadError(validation.error || "File invalid");
      return;
    }

    // Simulate upload progress
    setIsUploading(true);
    setUploadProgress(15);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          setTimeout(() => {
            const uploadedDoc = createMockUploadedDoc(file, documentType);
            onDocumentChange(uploadedDoc);
            setIsUploading(false);
            setUploadProgress(100);
          }, 300);
          return 95;
        }
        return prev + 25;
      });
    }, 150);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleRemove = () => {
    onDocumentChange(undefined);
    setUploadProgress(0);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          {label}
          {required && <span className="text-destructive font-bold">*</span>}
        </label>
        {document && (
          <VerificationBadge status={document.status} label="Scanned & Validated" size="sm" />
        )}
      </div>

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp"
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Uploading State */}
      {isUploading ? (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground flex items-center gap-2">
              <RefreshCw className="size-3.5 animate-spin text-primary" />
              Simulating secure document OCR & forensic upload...
            </span>
            <span className="font-semibold text-primary">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-1.5" />
        </div>
      ) : document ? (
        /* Document Preview & State */
        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3 shadow-2xs hover:border-primary/40 transition-colors">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <FileText className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {document.name}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{formatFileSize(document.size)}</span>
                <span>•</span>
                <span className="flex items-center text-success font-medium">
                  <CheckCircle2 className="mr-1 size-3" />
                  Ready
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => fileInputRef.current?.click()}
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
            >
              Replace
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={handleRemove}
              className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
              title="Remove document"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        /* Drag & Drop Zone */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-all ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/40"
          } ${error || uploadError ? "border-destructive/60 bg-destructive/5" : ""}`}
        >
          <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors mb-2">
            <UploadCloud className="size-5" />
          </div>
          <p className="text-sm font-medium text-foreground">
            <span className="text-primary underline-offset-4 group-hover:underline">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PDF, PNG, JPG, or WEBP (Max 5MB)
          </p>
        </div>
      )}

      {(uploadError || error) && (
        <div className="flex items-center gap-1.5 text-xs text-destructive mt-1 font-medium">
          <AlertCircle className="size-3.5 shrink-0" />
          <span>{uploadError || error}</span>
        </div>
      )}
    </div>
  );
}
