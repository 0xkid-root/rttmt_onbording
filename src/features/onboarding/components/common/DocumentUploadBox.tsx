"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Trash2,
  RefreshCw,
  AlertCircle,
  Eye,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { UploadedDocument } from "../../types";
import { validateUploadedFile, createMockUploadedDoc } from "../../utils/documentHelpers";
import { formatFileSize } from "../../utils/formatters";

interface DocumentUploadBoxProps {
  label: string;
  description?: string;
  sideBadge?: string;
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
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

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

  const isImageFile = document?.type?.startsWith("image/");

  return (
    <div className="flex flex-col space-y-2">
      {/* Uniform fixed-height header */}
      <div className="h-11 flex items-center justify-between gap-2">
        <label className="text-xs sm:text-sm font-semibold text-foreground line-clamp-2 leading-snug">
          {label} {required && <span className="text-destructive font-bold">*</span>}
        </label>
        {document && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
            <CheckCircle2 className="size-3" />
            Uploaded
          </span>
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

      {/* Uploading State: Uniform h-[96px] */}
      {isUploading ? (
        <div className="h-[96px] w-full flex flex-col justify-center rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground flex items-center gap-2 truncate">
              <RefreshCw className="size-3.5 animate-spin text-primary shrink-0" />
              Uploading document...
            </span>
            <span className="font-semibold text-primary shrink-0">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-1.5" />
        </div>
      ) : document ? (
        /* Document Preview: Uniform h-[96px] */
        <div className="h-[96px] w-full flex items-center justify-between rounded-lg border border-border bg-card p-3 hover:border-primary/40 transition-colors">
          <div className="flex items-center gap-3 overflow-hidden min-w-0">
            {isImageFile && document.fileUrl ? (
              <button
                type="button"
                onClick={() => {
                  setImageLoadError(false);
                  setShowPreviewModal(true);
                }}
                className="relative size-11 shrink-0 overflow-hidden rounded-md border border-border bg-muted/70 group/thumb cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-center"
                title="Click to view image preview"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={document.fileUrl}
                  alt={document.name}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                  className="size-full object-cover transition-transform group-hover/thumb:scale-105"
                />
                <FileText className="size-5 text-muted-foreground pointer-events-none" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Eye className="size-3.5" />
                </div>
              </button>
            ) : (
              <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary border border-primary/20">
                <FileText className="size-5" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs sm:text-sm font-medium text-foreground" title={document.name}>
                {document.name}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                <span>{formatFileSize(document.size)}</span>
                <span>•</span>
                <span className="uppercase text-[10px] tracking-wider font-mono">
                  {document.type.split("/")[1] || "FILE"}
                </span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Ready</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {isImageFile && document.fileUrl && (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => setShowPreviewModal(true)}
                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                title="Preview image"
              >
                <Eye className="size-3.5 mr-1" />
                <span className="hidden sm:inline">Preview</span>
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => fileInputRef.current?.click()}
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
            >
              Replace
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={handleRemove}
              className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
              title="Remove document"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        /* Drag & Drop Zone: Uniform h-[96px] */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className={`group h-[96px] w-full flex cursor-pointer items-center justify-center gap-3 rounded-lg border-2 border-dashed p-4 text-center transition-all ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/40"
          } ${error || uploadError ? "border-destructive/60 bg-destructive/5" : ""}`}
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
            <UploadCloud className="size-4" />
          </div>
          <div className="text-left min-w-0">
            <p className="text-xs sm:text-sm font-medium text-foreground">
              <span className="text-primary underline-offset-4 group-hover:underline">Click to upload</span> or drag and drop
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              PDF, PNG, JPG, or WEBP (Max 5MB)
            </p>
          </div>
        </div>
      )}

      {(uploadError || error) && (
        <div className="flex items-center gap-1.5 text-xs text-destructive mt-1 font-medium" role="alert">
          <AlertCircle className="size-3.5 shrink-0" />
          <span>{uploadError || error}</span>
        </div>
      )}

      {/* Simple Image Preview Lightbox Modal */}
      {showPreviewModal && document?.fileUrl && isImageFile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs"
          onClick={() => setShowPreviewModal(false)}
        >
          <div
            className="relative max-h-[90vh] max-w-3xl overflow-hidden rounded-lg bg-card border border-border p-4 shadow-xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="font-semibold text-sm truncate pr-4 text-foreground">{document.name}</span>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="text-muted-foreground hover:text-foreground rounded p-1"
                aria-label="Close preview"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="max-h-[75vh] min-h-[160px] overflow-auto flex items-center justify-center bg-muted/30 rounded p-4 text-center">
              {imageLoadError ? (
                <div className="flex flex-col items-center gap-2 max-w-sm text-center py-4">
                  <FileText className="size-10 text-muted-foreground/60" />
                  <p className="text-xs font-semibold text-foreground">
                    Original binary preview unavailable
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    In-memory browser file references expire across session restores.
                    The uploaded document metadata ({document.name}) remains recorded for review. To inspect or replace the image preview, please re-upload the file.
                  </p>
                </div>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={document.fileUrl}
                  alt={document.name}
                  onError={() => setImageLoadError(true)}
                  className="max-h-[70vh] w-auto max-w-full rounded object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
