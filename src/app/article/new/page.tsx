import { notFound, redirect } from "next/navigation";
import { getTopicBySlug } from "@/modules/topics/actions/get-topic";
import { CreateArticleForm } from "@/modules/articles/components/create-article-form";

interface NewArticlePageProps {
  // We no longer use params for the slug
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const NewArticlePage = async ({ searchParams }: NewArticlePageProps) => {
  const { topic } = await searchParams;

  // 1. If no topic is provided in URL, maybe redirect to a generic write page
  // (For now, we enforce having a topic)
  if (!topic || typeof topic !== "string") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Error: No topic selected.</p>
      </div>
    );
  }

  // 2. Fetch topic details to ensure it exists
  const topicData = await getTopicBySlug(topic);

  if (!topicData) {
    notFound();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <CreateArticleForm
        topicSlug={topicData.slug}
        topicTitle={topicData.title}
      />
    </div>
  );
};

export default NewArticlePage;
