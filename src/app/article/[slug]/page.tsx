import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, User as UserIcon, Calendar, Hash } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getArticleBySlug } from "@/modules/articles/actions/get-article";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const ArticlePage = async ({ params, searchParams }: ArticlePageProps) => {
  const { slug } = await params;
  const { fromUser } = await searchParams; //  Read query param

  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  // Logic: If from profile -> Back to Profile. Else -> Back to Topic.
  const backHref = fromUser
    ? `/user/${fromUser}`
    : `/topic/${article.topic.slug}`;

  const backLabel = fromUser
    ? "Back to Profile"
    : `Back to ${article.topic.title}`;

  return (
    <div className="min-h-screen bg-background pb-20">
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* 1. Dynamic Back Button */}
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="pl-0 gap-2 text-muted-foreground hover:text-primary"
          >
            <Link href={backHref}>
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Link>
          </Button>

          {/* 2. Topic Link Badge (Your Idea!) */}
          <Link
            href={`/topic/${article.topic.slug}`}
            className="text-sm font-medium text-muted-foreground flex items-center gap-1 hover:text-primary hover:underline transition-all"
          >
            <Hash className="h-3 w-3" />
            {article.topic.title}
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 pt-10">
        {/* 2. Article Header */}
        <header className="mb-10 space-y-6">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            {article.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-muted-foreground border-b border-border pb-8">
            {/* Author Info */}
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={article.author.image || ""} />
                <AvatarFallback>
                  {article.author.username?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-foreground">
                {article.author.username || article.author.name}
              </span>
            </div>

            <span>•</span>

            {/* Date */}
            <div className="flex items-center gap-1">
              <span>{format(new Date(article.createdAt), "MMM d, yyyy")}</span>
            </div>
          </div>
        </header>

        {/* 3. Article Content */}
        <article className="prose prose-lg dark:prose-invert max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
          {article.content}
        </article>
      </main>
    </div>
  );
};

export default ArticlePage;
