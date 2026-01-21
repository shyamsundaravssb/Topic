"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchTopics } from "@/modules/topics/actions/search-topics";
import { useDebounce } from "@/hooks/use-debounce"; // ✅ Now we use this!

export const TopicSearch = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, startTransition] = useTransition();

  // 1. Debounce the query (wait 300ms)
  const debouncedQuery = useDebounce(query, 300);

  // 2. Effect runs ONLY when debouncedQuery changes
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      startTransition(() => {
        searchTopics(debouncedQuery).then((data) => {
          setResults(data);
          setIsOpen(true);
        });
      });
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [debouncedQuery]);

  const handleCreateClick = () => {
    // Navigate to the new create page structure
    router.push(`/topic/create?title=${encodeURIComponent(query)}`);
  };

  const handleSelectTopic = (slug: string) => {
    router.push(`/topic/${slug}`);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search for a topic (e.g. 'Artificial Intelligence')"
          className="pl-10 h-12 text-lg bg-card shadow-sm border-border focus-visible:ring-primary"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {isSearching && (
          <div className="absolute right-3 top-3">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && query.length >= 2 && (
        <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50">
          {results.length > 0 ? (
            <div className="py-2">
              <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Existing Topics
              </p>
              {results.map((topic) => (
                <div
                  key={topic.id}
                  onClick={() => handleSelectTopic(topic.slug)}
                  className="px-4 py-3 hover:bg-accent hover:text-accent-foreground cursor-pointer flex justify-between items-center transition-colors"
                >
                  <span className="font-medium">{topic.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {topic._count.articles} articles
                  </span>
                </div>
              ))}
            </div>
          ) : (
            !isSearching && (
              <div className="p-4 text-center">
                <p className="text-muted-foreground mb-3">
                  Topic not found. Be the first to start it!
                </p>
                <div
                  onClick={handleCreateClick}
                  className="flex items-center justify-center gap-2 p-3 bg-primary/10 text-primary rounded-md cursor-pointer hover:bg-primary/20 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span className="font-semibold">Create "{query}"</span>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};
