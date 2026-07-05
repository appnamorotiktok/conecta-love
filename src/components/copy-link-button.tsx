"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button
      variant="outline"
      className="mt-3 w-full"
      onClick={handleCopy}
      type="button"
    >
      {copied ? "Link copiado!" : "Copiar link de convite"}
    </Button>
  );
}
