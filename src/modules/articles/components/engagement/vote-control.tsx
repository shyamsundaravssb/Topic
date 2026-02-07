"use client";

import { useOptimistic, useTransition } from "react";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toggleVote } from "@/modules/articles/actions/vote";
// import { $Enums } from "@prisma/client";
import { toast } from "sonner";

type VoteType = "UP" | "DOWN";

interface VoteControlProps {
  articleId: string;
  initialUpvotes: number;
  initialDownvotes: number;
  initialUserVote?: VoteType | null;
}

export function VoteControl({
  articleId,
  initialUpvotes,
  initialDownvotes,
  initialUserVote,
}: VoteControlProps) {
  const [isPending, startTransition] = useTransition();

  const [optimisticState, addOptimisticVote] = useOptimistic(
    {
      upvotes: initialUpvotes,
      downvotes: initialDownvotes,
      userVote: initialUserVote,
    },
    (state, newVote: VoteType) => {
      // If clicking the same vote, remove it
      if (state.userVote === newVote) {
        return {
          ...state,
          userVote: null,
          upvotes: newVote === "UP" ? state.upvotes - 1 : state.upvotes,
          downvotes: newVote === "DOWN" ? state.downvotes - 1 : state.downvotes,
        };
      }

      // If switching vote
      if (state.userVote) {
        return {
          userVote: newVote,
          upvotes: newVote === "UP" ? state.upvotes + 1 : state.upvotes - 1,
          downvotes:
            newVote === "DOWN" ? state.downvotes + 1 : state.downvotes - 1,
        };
      }

      // If new vote
      return {
        ...state,
        userVote: newVote,
        upvotes: newVote === "UP" ? state.upvotes + 1 : state.upvotes,
        downvotes: newVote === "DOWN" ? state.downvotes + 1 : state.downvotes,
      };
    },
  );

  const handleVote = (type: VoteType) => {
    startTransition(() => {
      addOptimisticVote(type);
      toggleVote(articleId, type).then((res) => {
        if (res?.error) {
          toast.error(res.error);
        }
      });
    });
  };

  const score = optimisticState.upvotes - optimisticState.downvotes;

  return (
    <div className="flex items-center gap-1 bg-secondary/30 rounded-full p-1 border border-border/50">
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-8 w-8 rounded-full hover:bg-transparent",
          optimisticState.userVote === "UP" && "text-green-500 bg-green-500/10",
        )}
        onClick={() => handleVote("UP")}
        disabled={isPending}
      >
        <ArrowBigUp
          className={cn(
            "h-6 w-6 transition-transform",
            optimisticState.userVote === "UP" && "fill-current scale-110",
          )}
        />
      </Button>

      <span
        className={cn(
          "text-sm font-bold min-w-[20px] text-center",
          score > 0
            ? "text-green-500"
            : score < 0
              ? "text-red-500"
              : "text-muted-foreground",
        )}
      >
        {score}
      </span>

      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-8 w-8 rounded-full hover:bg-transparent",
          optimisticState.userVote === "DOWN" && "text-red-500 bg-red-500/10",
        )}
        onClick={() => handleVote("DOWN")}
        disabled={isPending}
      >
        <ArrowBigDown
          className={cn(
            "h-6 w-6 transition-transform",
            optimisticState.userVote === "DOWN" && "fill-current scale-110",
          )}
        />
      </Button>
    </div>
  );
}
