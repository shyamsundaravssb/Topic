"use client";

import * as z from "zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { CompleteProfileSchema } from "@/schemas";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CardWrapper } from "@/modules/auth/components/card-wrapper";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { completeProfile } from "@/modules/auth/actions/complete-profile";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

export const CompleteProfileForm = () => {
  const { update } = useSession();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<z.infer<typeof CompleteProfileSchema>>({
    resolver: zodResolver(CompleteProfileSchema),
    defaultValues: {
      username: "",
      dob: "",
    },
  });

  const onSubmit = (values: z.infer<typeof CompleteProfileSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      completeProfile(values)
        .then(async (data) => {
          if (data.error) {
            setError(data.error);
          }
          if (data.success) {
            await update();
            setSuccess(data.success);
            router.refresh();
            router.push(DEFAULT_LOGIN_REDIRECT);
          }
        })
        .catch(() => setError("Something went wrong!"));
    });
  };

  return (
    <CardWrapper
      headerLabel="Finalize your account"
      backButtonLabel="Sign out"
      backButtonHref="/api/auth/signout"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Choose a Username</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="cool_user123"
                      className="bg-secondary/50 border-input focus-visible:ring-ring"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      type="date"
                      className="bg-secondary/50 border-input focus-visible:ring-ring"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button
            disabled={isPending}
            type="submit"
            className="w-full"
            size="lg"
          >
            Complete Profile
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
