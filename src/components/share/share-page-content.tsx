"use client";

import { useCallback, useState } from "react";
import { Navbar } from "@/components/navbar";
import { ShareForm } from "@/components/share/share-form";
import { FullPageDropZone } from "@/components/share/full-page-drop-zone";

export function SharePageContent() {
  const [droppedFile, setDroppedFile] = useState<File | null>(null);

  const handleFileDrop = useCallback((file: File) => {
    setDroppedFile(file);
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <FullPageDropZone onFileDrop={handleFileDrop} />
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 pb-20 pt-28">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold tracking-tight">
            Share a secret
          </h1>
          <p className="text-muted-foreground">
            Everything is encrypted in your browser before it leaves your
            machine.
          </p>
        </div>
        <ShareForm droppedFile={droppedFile} onDroppedFileConsumed={() => setDroppedFile(null)} />
      </div>
    </main>
  );
}
