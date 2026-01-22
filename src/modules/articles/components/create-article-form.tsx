"use client";

import * as z from "zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { ArticleSchema } from "@/schemas";
import { createArticle } from "@/modules/articles/actions/create-article";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

interface CreateArticleFormProps {
  topicSlug: string;
  topicTitle: string;
}

export const CreateArticleForm = ({
  topicSlug,
  topicTitle,
}: CreateArticleFormProps) => {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof ArticleSchema>>({
    resolver: zodResolver(ArticleSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const onSubmit = (values: z.infer<typeof ArticleSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      // Pass the form values AND the topic slug
      createArticle(values, topicSlug).then((data) => {
        if (data?.error) {
          setError(data.error);
        }
        if (data?.success) {
          setSuccess("Article published successfully!");
          setTimeout(() => {
            // Redirect to the new article view (we will build this next)
            // For now, redirect back to the topic page to see it in the list
            router.push(`/topic/${topicSlug}`);
            router.refresh();
          }, 1500);
        }
      });
    });
  };

  return (
    <Card className="w-full max-w-4xl shadow-lg border-border bg-card">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Write an Article for{" "}
          <span className="text-primary">{topicTitle}</span>
        </CardTitle>
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
                      disabled={isPending}
                      placeholder="e.g. The Untold History of..."
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
                    <Textarea
                      {...field}
                      disabled={isPending}
                      placeholder="Share your knowledge..."
                      className="min-h-[400px] text-base leading-relaxed p-4 bg-secondary/50 resize-y"
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
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" size="lg" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Publish Article
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
