import { notFound, redirect } from "next/navigation"; // Added redirect for safety
import Link from "next/link";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown"; // ✅ Import Renderer
import { ArrowLeft, Calendar, Hash, Pencil, Bot } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getArticleBySlug } from "@/modules/articles/actions/get-article";
import { auth } from "@/auth";
import { CopyButton } from "@/components/copy-button";
import { DeleteArticleButton } from "@/components/delete-article-button";
import { EngagementSection } from "@/modules/articles/components/engagement/discussion-section";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const ArticlePage = async ({ params, searchParams }: ArticlePageProps) => {
  const { slug } = await params;
  const { fromUser } = await searchParams;

  const session = await auth();
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  // Navigation Logic
  const backHref = fromUser
    ? `/user/${fromUser}`
    : article.topic?.slug
      ? `/topic/${article.topic.slug}`
      : "/dashboard";

  const backLabel = fromUser ? "Back to Profile" : "Back to Topic";

  const isAuthor = session?.user?.id === article.authorId;
  const isUpdated =
    new Date(article.updatedAt).getTime() >
    new Date(article.createdAt).getTime() + 60000;

  // Construct Edit URL with context
  const editHref = fromUser
    ? `/article/${article.slug}/edit?fromUser=${fromUser}`
    : `/article/${article.slug}/edit`;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 1. Sticky Header with Truncation Fixes */}
      <nav className="border-b border-border glass sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="pl-0 gap-2 text-muted-foreground hover:text-primary shrink-0"
          >
            <Link href={backHref}>
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{backLabel}</span>
            </Link>
          </Button>

          {/* Title in Header (Truncated) */}
          <div className="hidden md:block flex-1 min-w-0 text-center">
            <h2
              className="text-sm font-semibold truncate text-muted-foreground"
              title={article.title}
            >
              {article.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Edit Button */}
            {isAuthor && (
              <>
                <Button variant="outline" size="sm" asChild className="gap-2">
                  <Link href={editHref}>
                    <Pencil className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Edit</span>
                  </Link>
                </Button>
                <DeleteArticleButton articleId={article.id} />
              </>
            )}

            {/* ✅ Copy Button */}
            <CopyButton content={article.content} />

            {/* Topic Link (Truncated) */}
            <Button
              variant="secondary"
              size="sm"
              asChild
              className="gap-1 max-w-[150px]"
            >
              <Link
                href={`/topic/${article.topic.slug}`}
                title={article.topic.title}
              >
                <Hash className="h-3 w-3 shrink-0" />
                <span className="truncate">{article.topic.title}</span>
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <article className="max-w-3xl mx-auto px-4 py-10">
        {/* Article Metadata Header */}
        <header className="mb-10 space-y-6">
          <div className="space-y-2">
            <Link
              href={`/topic/${article.topic.slug}`}
              className="text-primary text-sm font-semibold tracking-wide uppercase hover:underline"
            >
              {article.topic.title}
            </Link>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              {article.title}
            </h1>
          </div>

          <div className="flex items-center justify-between border-b border-border pb-8">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-border">
                <AvatarImage src={article.author.image || ""} />
                <AvatarFallback>
                  {article.author.username?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">
                    {article.author.username || article.author.name}
                  </span>
                  {/* Bot Badge */}
                  {article.author.isBot && (
                    <span className="flex items-center gap-1 bg-muted text-muted-foreground text-[10px] px-2 py-0.5 rounded-full font-bold border border-border">
                      <Bot className="h-3 w-3" /> AI
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <span
                    title={`Published: ${format(new Date(article.createdAt), "PPP")}`}
                  >
                    {isUpdated
                      ? `Updated ${format(new Date(article.updatedAt), "MMM d, yyyy")}`
                      : format(new Date(article.createdAt), "MMM d, yyyy")}
                  </span>
                  <span>•</span>
                  {/* Read Time Calculation (Rough estimate) */}
                  <span>
                    {Math.ceil(article.content.split(" ").length / 200)} min
                    read
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ✅ MARKDOWN CONTENT RENDERER */}
        <div className="prose prose-lg dark:prose-invert prose-headings:font-bold prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-li:text-muted-foreground prose-a:text-primary max-w-none">
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </div>

        {/* Engagement Section */}
        <EngagementSection articleId={article.id} />
      </article>
    </div>
  );
};

export default ArticlePage;
