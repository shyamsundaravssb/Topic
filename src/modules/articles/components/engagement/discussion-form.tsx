"use client";

import { useTransition, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";
import { createDiscussion } from "@/modules/articles/actions/discussion";
import { toast } from "sonner";

interface DiscussionFormProps {
  articleId: string;
  parentId?: string; // If replying
  onSuccess?: () => void;
  placeholder?: string;
}

export function DiscussionForm({
  articleId,
  parentId,
  onSuccess,
  placeholder = "Join the discussion...",
}: DiscussionFormProps) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const onSubmit = (formData: FormData) => {
    const content = formData.get("content") as string;

    startTransition(() => {
      createDiscussion(articleId, content, parentId).then((data) => {
        if (data.error) {
          toast.error(data.error);
        }
        if (data.success) {
          toast.success(data.success);
          formRef.current?.reset();
          onSuccess?.();
        }
      });
    });
  };

  return (
    <form ref={formRef} action={onSubmit} className="space-y-4">
      <Textarea
        name="content"
        placeholder={placeholder}
        disabled={isPending}
        className="min-h-[80px] bg-secondary/30 resize-none glass-card focus:bg-background transition-colors"
      />
      <div className="flex justify-end">
        <Button size="sm" type="submit" disabled={isPending}>
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Post <Send className="ml-2 h-3 w-3" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
