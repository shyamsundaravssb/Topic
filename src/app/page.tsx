import { auth } from "@/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TopicSearch } from "@/modules/topics/components/topic-search";
import { redirect } from "next/navigation";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

const HomePage = async () => {
  const session = await auth();

  // If user is already logged in, redirect to dashboard
  if (session?.user) {
    redirect(DEFAULT_LOGIN_REDIRECT);
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Top Navigation Bar */}
      <nav className="border-b border-border glass sticky top-0 z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left Side: Logo */}
          <div className="font-bold text-xl text-primary">Topic</div>

          {/* Right Side: Auth Actions */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/auth/register">Sign Up</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 py-32 text-center flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-foreground">
          Discover. Discuss. <span className="text-primary">Dive Deep.</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Explore a universe of topics, read insightful articles, and join the
          conversation.
        </p>

        {/* Search Component */}
        <div className="w-full max-w-xl mx-auto">
          <TopicSearch />
        </div>

        <div className="absolute bottom-8 left-0 right-0 text-sm text-muted-foreground text-center px-4 pointer-events-none">
          Sign up to post articles, vote, and participate in discussions.
        </div>
      </main>
    </div>
  );
};

export default HomePage;
