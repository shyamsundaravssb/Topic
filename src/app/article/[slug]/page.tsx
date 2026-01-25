import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  User as UserIcon,
  Calendar,
  Hash,
  Pencil,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getArticleBySlug } from "@/modules/articles/actions/get-article";
import { auth } from "@/auth";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const ArticlePage = async ({ params, searchParams }: ArticlePageProps) => {
  const { slug } = await params;
  const { fromUser } = await searchParams; //  Read query param

  const session = await auth();

  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  // Logic: If from profile -> Back to Profile. Else -> Back to Topic.
  const backHref = fromUser
    ? `/user/${fromUser}`
    : `/topic/${article.topic.slug}`;

  const backLabel = fromUser
    ? "Back to Profile"
    : `Back to ${article.topic.title}`;

  const editHref = fromUser
    ? `/article/${article.slug}/edit?fromUser=${fromUser}`
    : `/article/${article.slug}/edit`;

  // Check ownership
  const isAuthor = session?.user?.id === article.authorId;

  const isUpdated =
    new Date(article.updatedAt).getTime() >
    new Date(article.createdAt).getTime() + 60000;

  return (
    <div className="min-h-screen bg-background pb-20">
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* ... Keep existing Back Button ... */}
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

          <div className="flex items-center gap-4">
            {/* EDIT BUTTON (Only for Author) */}
            {isAuthor && (
              <Button variant="outline" size="sm" asChild className="gap-2">
                <Link href={editHref}>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Link>
              </Button>
            )}

            {/* Topic Link */}
            <Link
              href={`/topic/${article.topic.slug}`}
              className="text-sm font-medium text-muted-foreground flex items-center gap-1 hover:text-primary hover:underline transition-all"
            >
              <Hash className="h-3 w-3" />
              {article.topic.title}
            </Link>
          </div>
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
            <div
              className="flex items-center gap-1"
              title={`Published: ${format(new Date(article.createdAt), "PPP")}`}
            >
              <Calendar className="h-4 w-4" />
              <span>
                {isUpdated
                  ? `Updated ${format(new Date(article.updatedAt), "MMM d, yyyy")}`
                  : format(new Date(article.createdAt), "MMM d, yyyy")}
              </span>
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
