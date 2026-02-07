"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Upload,
  X,
  Star,
  ImageIcon,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadedImage {
  id: string;
  url: string;
  alt_text?: string | null;
  is_primary: boolean;
}

interface ImageUploadProps {
  images: UploadedImage[];
  onUpload: (files: File[]) => Promise<void>;
  onRemove: (imageId: string) => void;
  onSetPrimary: (imageId: string) => void;
  multiple?: boolean;
  uploading?: boolean;
  className?: string;
}

export function ImageUpload({
  images,
  onUpload,
  onRemove,
  onSetPrimary,
  multiple = true,
  uploading = false,
  className,
}: ImageUploadProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;
      setDragging(false);

      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (files.length > 0) await onUpload(multiple ? files : [files[0]]);
    },
    [onUpload, multiple]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length > 0) await onUpload(multiple ? files : [files[0]]);
      if (inputRef.current) inputRef.current.value = "";
    },
    [onUpload, multiple]
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative cursor-pointer rounded-xl border-2 border-dashed py-10 text-center transition-all duration-200",
          dragging
            ? "border-brand bg-brand-light/50 scale-[1.01]"
            : "border-border hover:border-muted hover:bg-surface/50",
          uploading && "pointer-events-none opacity-60"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
            <p className="text-sm font-medium text-charcoal">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface text-muted">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-charcoal">
                Drop images here or{" "}
                <span className="text-brand">browse</span>
              </p>
              <p className="mt-0.5 text-xs text-muted">
                PNG, JPG, WebP up to 10MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img) => (
            <div
              key={img.id}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-xl border-2 bg-surface transition-all duration-200",
                img.is_primary
                  ? "border-brand shadow-[0_0_0_1px_theme(--color-brand)]"
                  : "border-border hover:border-muted"
              )}
            >
              <Image
                src={img.url}
                alt={img.alt_text ?? "Product image"}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 25vw"
              />

              {/* Primary badge */}
              {img.is_primary && (
                <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-xs font-medium text-white shadow-sm">
                  <Star className="h-3 w-3 fill-current" />
                  Primary
                </div>
              )}

              {/* Hover overlay with actions */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-charcoal/60 opacity-0 backdrop-blur-[1px] transition-opacity duration-200 group-hover:opacity-100">
                {!img.is_primary && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSetPrimary(img.id);
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-charcoal shadow-sm hover:bg-brand hover:text-white transition-colors"
                    title="Set as primary"
                  >
                    <Star className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(img.id);
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-red-600 shadow-sm hover:bg-red-600 hover:text-white transition-colors"
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Add more placeholder */}
          <button
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border text-muted hover:border-muted hover:bg-surface/50 transition-colors"
          >
            <ImageIcon className="h-5 w-5" />
            <span className="text-xs font-medium">Add more</span>
          </button>
        </div>
      )}
    </div>
  );
}
