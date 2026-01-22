import { auth } from "@/auth";
import { LogoutButton } from "@/modules/auth/components/logout-button";
import { Button } from "@/components/ui/button";
import { TopicSearch } from "@/modules/topics/components/topic-search";

const DashboardPage = async () => {
  const session = await auth();

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-xl text-primary">Topic</div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {session?.user?.username}
            </span>
            <LogoutButton>
              <Button variant="ghost" size="sm">
                Sign Out
              </Button>
            </LogoutButton>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-foreground">
          What do you want to <span className="text-primary">explore</span>?
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Discover articles, share your knowledge, or start a completely new
          discussion.
        </p>

        {/* The Search Component */}
        <TopicSearch />
      </main>
    </div>
  );
};

export default DashboardPage;
