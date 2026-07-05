"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function DownloadImageButton({
  url,
  filename,
}: {
  url: string;
  filename: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={loading}
      type="button"
    >
      {loading ? "Baixando..." : "Baixar foto"}
    </Button>
  );
}
