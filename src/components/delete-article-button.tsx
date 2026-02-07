"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { deleteArticle } from "@/modules/articles/actions/delete-article";
import { toast } from "sonner";

interface DeleteArticleButtonProps {
  articleId: string;
}

export function DeleteArticleButton({ articleId }: DeleteArticleButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    startTransition(() => {
      deleteArticle(articleId).then((data) => {
        if (data.error) {
          toast.error(data.error);
          setOpen(false);
        }
        if (data.success) {
          toast.success(data.success);
          setOpen(false);
          // Redirect to the topic page
          if (data.redirectUrl) {
            router.push(data.redirectUrl);
          }
        }
      });
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">Delete</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            article and all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault(); // Prevent auto-close
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
              "Delete Article"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
