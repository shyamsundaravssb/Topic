"use client";

import { DiscussionItem } from "./discussion-item";

// Type definition matching the one in DiscussionItem
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

interface DiscussionListProps {
  discussions: DiscussionWithUser[];
  currentUserId?: string;
  articleId: string;
}

export function DiscussionList({
  discussions,
  currentUserId,
  articleId,
}: DiscussionListProps) {
  if (discussions.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <p>No comments up until now.</p>
        <p className="text-sm">Be the first to start the discussion!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {discussions.map((discussion) => (
        <DiscussionItem
          key={discussion.id}
          discussion={discussion}
          currentUserId={currentUserId}
          articleId={articleId}
        />
      ))}
    </div>
  );
}
