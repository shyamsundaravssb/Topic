"use client";

import * as z from "zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { TopicSchema } from "@/schemas";
import { createTopic } from "@/modules/topics/actions/create-topic";
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
  FormDescription,
} from "@/components/ui/form";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter, // ✅ Import CardFooter
} from "@/components/ui/card";

export const CreateTopicForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTitle = searchParams.get("title") || "";

  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof TopicSchema>>({
    resolver: zodResolver(TopicSchema),
    defaultValues: {
      title: initialTitle,
      description: "",
    },
  });

  const onSubmit = (values: z.infer<typeof TopicSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      createTopic(values).then((data) => {
        if (data?.error) {
          setError(data.error);
        }
        if (data?.success) {
          setSuccess("Topic created successfully! Redirecting...");
          // Redirect to the new topic page
          setTimeout(() => {
            router.push(`/topic/${data.slug}`);
          }, 1500);
        }
      });
    });
  };

  return (
    <Card className="w-full max-w-[600px] glass-card shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary">
          Create a Topic
        </CardTitle>
        <CardDescription>
          Start a new discussion. This topic will be available for everyone to
          contribute to.
        </CardDescription>
      </CardHeader>

      {/* ✅ Form wraps Content and Footer ensuring layout integrity */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {/* Title Field */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="e.g. The Taj Mahal"
                        className="bg-secondary/50"
                      />
                    </FormControl>
                    <FormDescription>
                      This will be the unique name of the topic.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description Field */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={isPending}
                        placeholder="Briefly describe what this topic is about..."
                        className="bg-secondary/50 min-h-[120px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormError message={error} />
            <FormSuccess message={success} />
          </CardContent>

          {/* ✅ Buttons moved to CardFooter for proper alignment */}
          <CardFooter className="flex justify-end gap-4 border-t border-border pt-6 bg-secondary/10">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Topic
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
