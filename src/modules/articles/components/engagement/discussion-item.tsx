"use client";

import { useTransition, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Trash2, Reply } from "lucide-react";
import { DiscussionForm } from "./discussion-form";
import { deleteDiscussion } from "@/modules/articles/actions/discussion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

// Define the type here or import from a shared types file
// For now, defining locally to speed up
type DiscussionWithUser = {
  id: string;
  content: string;
  createdAt: Date;
  parentId: string | null;
  user: {
    id: string;
    name: string | null;
    username: string | null;
    image: string | null;
  };
  replies?: DiscussionWithUser[];
};

interface DiscussionItemProps {
  discussion: DiscussionWithUser;
  currentUserId?: string;
  articleId: string;
}

export function DiscussionItem({
  discussion,
  currentUserId,
  articleId,
}: DiscussionItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const isAuthor = currentUserId === discussion.user.id;

  const handleDelete = () => {
    startTransition(() => {
      deleteDiscussion(discussion.id).then((data) => {
        if (data.error) toast.error(data.error);
        if (data.success) {
          toast.success(data.success);
          setIsDeleteDialogOpen(false);
        }
      });
    });
  };

  return (
    <>
      <div className="flex gap-3 group">
        <Avatar className="h-8 w-8 mt-1 border border-border">
          <AvatarImage src={discussion.user.image || ""} />
          <AvatarFallback>
            {discussion.user.username?.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-foreground">
              {discussion.user.username || discussion.user.name}
            </span>
            <span className="text-muted-foreground text-xs">
              {formatDistanceToNow(new Date(discussion.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
            {discussion.content}
          </div>

          <div className="flex items-center gap-4">
            {currentUserId && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 font-medium transition-colors"
              >
                <Reply className="h-3 w-3" /> Reply
              </button>
            )}

            {isAuthor && (
              <button
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={isPending}
                className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 font-medium transition-colors"
              >
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            )}
          </div>

          {isReplying && (
            <div className="mt-4 pl-4 border-l-2 border-primary/20">
              <DiscussionForm
                articleId={articleId}
                parentId={discussion.id}
                onSuccess={() => setIsReplying(false)}
                placeholder={`Reply to ${discussion.user.username}...`}
              />
            </div>
          )}

          {/* Nested Replies */}
          {discussion.replies && discussion.replies.length > 0 && (
            <div className="mt-4 space-y-4 pl-4 border-l border-border/50">
              {discussion.replies.map((reply) => (
                <DiscussionItem
                  key={reply.id}
                  discussion={reply}
                  currentUserId={currentUserId}
                  articleId={articleId}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove your comment and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
