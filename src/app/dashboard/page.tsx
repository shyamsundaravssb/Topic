import { auth } from "@/auth"; // Server-side session fetch
import { LogoutButton } from "@/modules/auth/components/logout-button";
import { Button } from "@/components/ui/button";

const DashboardPage = async () => {
  const session = await auth();

  return (
    <div className="flex flex-col items-center justify-center h-full p-10 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="p-4 border rounded-md bg-slate-100 dark:bg-slate-900 shadow-sm">
        <p className="text-muted-foreground">
          Current User:{" "}
          <span className="font-semibold text-foreground">
            {session?.user?.username || session?.user?.email}
          </span>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Status: {session?.user?.isProfileComplete ? "Active" : "Incomplete"}
        </p>
      </div>

      {/* ✅ The Logout Button */}
      <LogoutButton>
        <Button variant="destructive" size="lg">
          Sign Out
        </Button>
      </LogoutButton>
    </div>
  );
};

export default DashboardPage;
