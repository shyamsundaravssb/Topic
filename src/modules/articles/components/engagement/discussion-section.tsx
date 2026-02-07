import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { VoteControl } from "./vote-control";
import { DiscussionForm } from "./discussion-form";
import { DiscussionList } from "./discussion-list";
import { Separator } from "@/components/ui/separator";

interface EngagementSectionProps {
  articleId: string;
}

export async function EngagementSection({ articleId }: EngagementSectionProps) {
  const session = await auth();
  const userId = session?.user?.id;

  // Fetch Votes
  const [upvotes, downvotes, userVote] = await Promise.all([
    prisma.vote.count({ where: { articleId, type: "UP" } }),
    prisma.vote.count({ where: { articleId, type: "DOWN" } }),
    userId
      ? prisma.vote.findUnique({
          where: { userId_articleId: { userId, articleId } },
        })
      : null,
  ]);

  // Fetch Discussions (Flat for now, we process into tree)
  const allDiscussions = await prisma.discussion.findMany({
    where: { articleId },
    include: {
      user: {
        select: { id: true, name: true, username: true, image: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Process discussions into tree structure
  const discussionTree = allDiscussions
    .filter((d) => !d.parentId)
    .map((d) => ({
      ...d,
      replies: allDiscussions.filter((reply) => reply.parentId === d.id),
    }));

  return (
    <section className="mt-16 border-t border-border pt-10">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold tracking-tight">Discussion</h3>

        {/* Vote Control */}
        <VoteControl
          articleId={articleId}
          initialUpvotes={upvotes}
          initialDownvotes={downvotes}
          initialUserVote={userVote?.type}
        />
      </div>

      <div className="space-y-10">
        {/* Comment Input */}
        <div className="glass-card p-6 rounded-xl">
          <h4 className="text-sm font-semibold mb-4 text-muted-foreground">
            Leaving a comment as{" "}
            <span className="text-foreground">
              {session?.user?.username || "Guest"}
            </span>
          </h4>
          <DiscussionForm articleId={articleId} />
        </div>

        {/* Comment List */}
        <DiscussionList
          discussions={discussionTree}
          currentUserId={userId}
          articleId={articleId}
        />
      </div>
    </section>
  );
}
