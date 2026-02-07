"use client";

import * as z from "zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { ArticleSchema } from "@/schemas";
import { updateArticle } from "@/modules/articles/actions/update-article";
import { Input } from "@/components/ui/input";
import { Editor } from "@/components/editor";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface EditArticleFormProps {
  article: {
    id: string;
    title: string;
    content: string;
    slug: string;
  };
  fromUser?: string;
}

export const EditArticleForm = ({
  article,
  fromUser,
}: EditArticleFormProps) => {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  // New state to track if we are currently redirecting
  const [isRedirecting, setIsRedirecting] = useState(false);

  const form = useForm<z.infer<typeof ArticleSchema>>({
    resolver: zodResolver(ArticleSchema),
    defaultValues: {
      title: article.title,
      content: article.content,
    },
  });

  const onSubmit = (values: z.infer<typeof ArticleSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      updateArticle(values, article.id).then((data) => {
        if (data?.error) {
          setError(data.error);
        }
        if (data?.success) {
          setSuccess("Article updated successfully!");
          setIsRedirecting(true); // Lock the UI immediately

          // Construct the new URL
          const redirectUrl = data.slug
            ? `/article/${data.slug}${fromUser ? `?fromUser=${fromUser}` : ""}`
            : `/article/${article.slug}`;

          // Logic: Did the slug change?
          const slugChanged = data.slug !== article.slug;

          if (slugChanged) {
            // If slug changed, ONLY push (navigating away).
            // Do NOT refresh, or you'll get a 404 on the current page.
            router.push(redirectUrl);
          } else {
            // If slug is same, we can refresh to show updates, then push to view
            router.refresh();
            router.push(redirectUrl);
          }
        }
      });
    });
  };

  return (
    <Card className="w-full max-w-4xl glass-card shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Edit Article</CardTitle>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Headline</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending || isRedirecting}
                      className="text-lg font-medium bg-secondary/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Editor
                      value={field.value}
                      onChange={field.onChange}
                      editable={!isPending && !isRedirecting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormError message={error} />
            <FormSuccess message={success} />
          </CardContent>

          <CardFooter className="flex justify-end gap-4 border-t border-border pt-6 bg-secondary/10">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              disabled={isPending || isRedirecting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || isRedirecting}>
              {(isPending || isRedirecting) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isRedirecting ? "Redirecting..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
