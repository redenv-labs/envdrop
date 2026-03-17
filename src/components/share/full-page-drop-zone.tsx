"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileUp, Shield } from "lucide-react";

interface FullPageDropZoneProps {
  onFileDrop: (file: File) => void;
}

export function FullPageDropZone({ onFileDrop }: FullPageDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer?.types.includes("Files")) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer?.files[0];
      if (file) onFileDrop(file);
    },
    [onFileDrop]
  );

  useEffect(() => {
    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop]);

  return (
    <AnimatePresence>
      {isDragging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-100 flex items-center justify-center bg-background/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="relative">
              <div className="absolute -inset-8 rounded-full bg-primary/10 blur-2xl" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border-2 border-dashed border-primary/50 bg-primary/5">
                <FileUp className="h-10 w-10 text-primary" />
              </div>
            </div>

            <div className="text-center">
              <p className="text-2xl font-semibold tracking-tight">
                Drop your file here
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                .env, .env.local, .txt and other files supported
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-border/50 bg-secondary/50 px-4 py-2 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5" />
              Encrypted client-side before upload
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
