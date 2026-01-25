import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, Layers, FileText, ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { getProfileByUsername } from "@/modules/users/actions/profile";
import { EditProfileModal } from "@/modules/users/components/edit-profile-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

const ProfilePage = async ({ params }: ProfilePageProps) => {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  const session = await auth();

  if (!profile) {
    notFound();
  }

  // Check if the viewer is the owner of this profile
  const isOwner = session?.user?.username === profile.username;
  const backLinkParams = `?fromUser=${profile.username}`;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Nav */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
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

      <main className="max-w-4xl mx-auto px-4 pt-10">
        {/* 1. Profile Header */}
        <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
          <Avatar className="h-32 w-32 border-4 border-card shadow-xl">
            <AvatarImage src={profile.image || ""} />
            <AvatarFallback className="text-4xl">
              {profile.username?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold">{profile.name}</h1>
                <p className="text-muted-foreground">@{profile.username}</p>
              </div>
              {isOwner && <EditProfileModal user={profile} />}
            </div>

            {profile.bio && (
              <p className="text-foreground/80 leading-relaxed max-w-xl">
                {profile.bio}
              </p>
            )}

            <div className="flex items-center gap-6 text-sm text-muted-foreground pt-2">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  Joined {format(new Date(profile.createdAt), "MMMM yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Layers className="h-4 w-4" />
                <span>{profile._count.createdTopics} Topics</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>{profile._count.articles} Articles</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Content Tabs */}
        <Tabs defaultValue="topics" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
            {/* Swapped Triggers */}
            <TabsTrigger value="topics">Topics Created</TabsTrigger>
            <TabsTrigger value="articles">Articles</TabsTrigger>
          </TabsList>

          {/* 3. Topics Content (Moved up) */}
          <TabsContent value="topics" className="mt-8 space-y-4">
            {profile.createdTopics.length > 0 ? (
              profile.createdTopics.map((topic) => (
                // ✅ ADDED query param
                <Link
                  key={topic.id}
                  href={`/topic/${topic.slug}${backLinkParams}`}
                >
                  <Card className="hover:bg-accent/50 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-lg">{topic.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {topic._count.articles} Articles posted
                      </p>
                    </CardHeader>
                  </Card>
                </Link>
              ))
            ) : (
              <p className="text-muted-foreground py-8">
                No topics created yet.
              </p>
            )}
          </TabsContent>

          {/* 4. Articles Content */}
          <TabsContent value="articles" className="mt-8 space-y-4">
            {profile.articles.length > 0 ? (
              profile.articles.map((article) => (
                // ✅ ADDED query param
                <Link
                  key={article.id}
                  href={`/article/${article.slug}${backLinkParams}`}
                >
                  <Card className="hover:bg-accent/50 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-lg">{article.title}</CardTitle>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        in{" "}
                        <span className="font-medium text-primary">
                          {article.topic.title}
                        </span>
                        • {format(new Date(article.createdAt), "MMM d, yyyy")}
                      </p>
                    </CardHeader>
                  </Card>
                </Link>
              ))
            ) : (
              <p className="text-muted-foreground py-8">
                No articles written yet.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ProfilePage;
