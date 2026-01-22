import { notFound } from "next/navigation";
import { format } from "date-fns";
import { PenTool, Calendar, ArrowLeft } from "lucide-react"; // 1. Import ArrowLeft
import { Button } from "@/components/ui/button";
import { getTopicBySlug } from "@/modules/topics/actions/get-topic";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

interface TopicPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const TopicPage = async ({ params }: TopicPageProps) => {
  const { slug } = await params;
  const topic = await getTopicBySlug(slug);

  if (!topic) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 2. Navigation / Back Button Area */}
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="pl-0 gap-2 text-muted-foreground hover:text-primary"
        >
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      {/* Header Section */}
      <header className="bg-card border-b border-border py-8 mt-4">
        <div className="max-w-5xl mx-auto px-4 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                {topic.title}
              </h1>

              <div className="flex items-center gap-x-4 text-sm text-muted-foreground mt-4">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={topic.creator.image || ""} />
                    <AvatarFallback className="text-[10px]">
                      {topic.creator.username?.slice(0, 2).toUpperCase() ||
                        "US"}
                    </AvatarFallback>
                  </Avatar>
                  <span>
                    Created by{" "}
                    <span className="font-medium text-foreground">
                      {topic.creator.username || topic.creator.name}
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

            {/* Header Action Button */}
            <Button size="lg" className="gap-2" asChild>
              <Link href={`/article/new?topic=${topic.slug}`}>
                <PenTool className="h-4 w-4" />
                Write Article
              </Link>
            </Button>
          </div>

          <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed mt-6">
            {topic.description}
          </p>
        </div>
      </header>

      {/* Content Section */}
      <main className="max-w-5xl mx-auto px-4 py-12">
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
                <Card className="hover:shadow-lg transition-all cursor-pointer h-full border-border hover:border-primary/50 group">
                  <CardHeader>
                    <CardTitle className="text-xl leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <p className="text-muted-foreground text-sm line-clamp-3">
                      {article.content.substring(0, 150)}...
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
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center bg-secondary/20 rounded-xl border-2 border-dashed border-border">
            <div className="p-4 bg-background rounded-full shadow-sm mb-4">
              <PenTool className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No articles yet</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              This topic is brand new! Be the first person to share knowledge
              about "{topic.title}".
            </p>

            {/* 3. Fixed "Start Writing" Button */}
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
