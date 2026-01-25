import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getArticleBySlug } from "@/modules/articles/actions/get-article";
import { EditArticleForm } from "@/modules/articles/components/edit-article-form";

interface EditArticlePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>; // Add searchParams
}
const EditArticlePage = async ({
  params,
  searchParams,
}: EditArticlePageProps) => {
  const { slug } = await params;
  const { fromUser } = await searchParams;

  const session = await auth();
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  // Security Check: Is the user the author?
  if (session?.user?.id !== article.authorId) {
    redirect(`/article/${slug}`); // Send them back to read view
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <EditArticleForm
        article={article}
        fromUser={typeof fromUser === "string" ? fromUser : undefined}
      />
    </div>
  );
};

export default EditArticlePage;
