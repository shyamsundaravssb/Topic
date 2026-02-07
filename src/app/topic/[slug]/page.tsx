import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { PenTool, Calendar, ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { getTopicBySlug } from "@/modules/topics/actions/get-topic";
import { stripMarkdown } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EditTopicModal } from "@/modules/topics/components/edit-topic-modal";

interface TopicPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const TopicPage = async ({ params, searchParams }: TopicPageProps) => {
  const { slug } = await params;
  const { fromUser } = await searchParams;

  const session = await auth();
  const topic = await getTopicBySlug(slug);

  if (!topic) notFound();

  const backHref = fromUser ? `/user/${fromUser}` : "/dashboard";
  const backLabel = fromUser ? "Back to Profile" : "Back to Dashboard";
  const isCreator = session?.user?.id === topic.creatorId;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 1. Navigation Bar (Kept clean at the top) */}
      <div className="max-w-6xl mx-auto px-4 py-4">
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
      </div>

      {/* 2.  NEW: Cover Image Banner (Improved Visibility) */}
      <div className="w-full h-[300px] relative bg-muted group overflow-hidden">
        {topic.image ? (
          <img
            src={topic.image}
            alt={topic.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          /* Fallback Gradient (Monochrome) */
          <div className="w-full h-full bg-linear-to-br from-zinc-200 via-zinc-300 to-zinc-400 dark:from-zinc-800 dark:via-zinc-900 dark:to-black" />
        )}

        {/* Optional: A very subtle gradient at the bottom to make the white card pop, 
            but keep the top of the image crystal clear */}
        <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent pointer-events-none" />
      </div>

      {/* 3. Header Info Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-12 relative z-10">
        <div className="glass-card rounded-xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-4 flex-1">
              <div className="flex items-center justify-between md:justify-start gap-4">
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
                  {topic.title}
                </h1>
                {/* Edit Button next to title (Mobile friendly) */}
                {isCreator && <EditTopicModal topic={topic} />}
              </div>

              <div className="flex items-center gap-x-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={topic.creator.image || ""} />
                    <AvatarFallback className="text-[10px]">
                      {topic.creator.username?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>
                    Created by{" "}
                    <span className="font-medium text-foreground">
                      {topic.creator.username}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(topic.createdAt), "MMMM d, yyyy")}
                  </span>
                </div>
              </div>
            </div>

            {/* Main Action */}
            <Button size="lg" className="gap-2 w-full md:w-auto" asChild>
              <Link href={`/article/new?topic=${topic.slug}`}>
                <PenTool className="h-4 w-4" />
                Write Article
              </Link>
            </Button>
          </div>

          <p className="text-lg text-muted-foreground mt-6 leading-relaxed border-t border-border pt-6">
            {topic.description}
          </p>
        </div>
      </div>

      {/* 4. Articles List (Existing Code) */}
      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* ... (Keep your existing Article list/empty state code exactly the same) ... */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Articles</h2>
          <span className="text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-full font-medium">
            {topic._count.articles} Total
          </span>
        </div>

        {topic.articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topic.articles.map((article) => (
              <Link key={article.id} href={`/article/${article.slug}`}>
                <Card className="glass-card hover:translate-y-[-4px] transition-all cursor-pointer h-full hover:border-primary/20 group">
                  <CardHeader>
                    <CardTitle className="text-xl leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {stripMarkdown(article.title)}
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <p className="text-muted-foreground text-sm line-clamp-3">
                      {stripMarkdown(article.content).substring(0, 150)}...
                    </p>
                  </CardContent>

                  <CardFooter className="flex items-center gap-2 text-xs text-muted-foreground mt-auto">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={article.author.image || ""} />
                      <AvatarFallback className="text-[9px]">
                        {article.author.username?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {article.author.username}
                    </span>
                    <span>•</span>
                    <span>
                      {format(new Date(article.createdAt), "MMM d, yyyy")}
                    </span>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-secondary/20 rounded-xl border-2 border-dashed border-border">
            <div className="p-4 bg-background rounded-full shadow-sm mb-4">
              <PenTool className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No articles yet</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              This topic is brand new! Be the first person to share knowledge
              about "{topic.title}".
            </p>
            <Button variant="outline" asChild>
              <Link href={`/article/new?topic=${topic.slug}`}>
                Start Writing
              </Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default TopicPage;
