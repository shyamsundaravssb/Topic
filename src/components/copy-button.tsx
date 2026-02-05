"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CopyButtonProps {
  content: string;
}

export const CopyButton = ({ content }: CopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(content);
    setIsCopied(true);
    toast.success("Article content copied to clipboard!");

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onCopy}
      title="Copy article content"
    >
      {isCopied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4 text-muted-foreground" />
      )}
    </Button>
  );
};
