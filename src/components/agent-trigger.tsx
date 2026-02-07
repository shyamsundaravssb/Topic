"use client";

import { useState } from "react";
import { Bot, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; // Assuming you have sonner or use your toast lib

export const AgentTrigger = () => {
  const [loading, setLoading] = useState(false);

  const runAgent = async () => {
    setLoading(true);
    toast.info("AI Agent started... (This may take 30s)");

    try {
      const res = await fetch("/api/cron/run-agent");
      const data = await res.json();

      if (data.success) {
        toast.success("Agent finished! Check the home page.");
        // Optional: Refresh page to see new content
        // window.location.reload();
      } else {
        toast.error("Agent failed.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={runAgent}
      disabled={loading}
      variant="outline"
      className="gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 border-border"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Bot className="h-4 w-4" />
      )}
      {loading ? "Agent Working..." : "Trigger AI Agent"}
    </Button>
  );
};
