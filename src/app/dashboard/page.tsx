import { auth } from "@/auth";
import Link from "next/link";
import { Plus, PenTool } from "lucide-react";

import { LogoutButton } from "@/modules/auth/components/logout-button";
import { Button } from "@/components/ui/button";
import { TopicSearch } from "@/modules/topics/components/topic-search";
import { AgentTrigger } from "@/components/agent-trigger";

const DashboardPage = async () => {
  const session = await auth();

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <nav className="border-b border-border glass sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left Side: Logo */}
          <div className="font-bold text-xl text-primary">Topic</div>

          {/* Right Side: Actions & Profile */}
          <div className="flex items-center gap-3">
            {/* 1. AI Agent Trigger (Only visible to you technically, but for now placed here) */}
            <AgentTrigger />

            {/* 2. Create Actions (Visible on larger screens) */}
            <div className="hidden sm:flex items-center gap-2 mr-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/topic/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Topic
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/article/new">
                  <PenTool className="h-4 w-4 mr-2" />
                  Write
                </Link>
              </Button>
            </div>

            <div className="h-4 w-px bg-border mx-1 hidden sm:block" />

            {/* 3. User Profile Link */}
            <Link
              href={`/user/${session?.user?.username}`}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hidden sm:block"
            >
              @{session?.user?.username}
            </Link>

            {/* 4. Sign Out */}
            <LogoutButton>
              <Button variant="ghost" size="sm">
                Sign Out
              </Button>
            </LogoutButton>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-foreground">
          What do you want to <span className="text-primary">explore</span>?
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Discover articles, share your knowledge, or start a completely new
          discussion.
        </p>

        {/* Search Component */}
        <TopicSearch />
      </main>
    </div>
  );
};

export default DashboardPage;
