"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BeatLoader } from "react-spinners";

import { newVerification } from "@/modules/auth/actions/new-verification";
import { CardWrapper } from "@/modules/auth/components/card-wrapper";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";

export const NewVerificationForm = () => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const onSubmit = useCallback(() => {
    if (success || error) return;

    if (!token) {
      setError("Missing token!");
      return;
    }

    newVerification(token)
      .then((data) => {
        setSuccess(data.success);
        setError(data.error);

        if (data.success) {
          setTimeout(() => {
            router.push("/auth/login");
          }, 2000);
        }
      })
      .catch(() => {
        setError("Something went wrong!");
      });
  }, [token, success, error, router]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <CardWrapper
      headerLabel="Confirming your verification"
      backButtonLabel="Back to login"
      backButtonHref="/auth/login"
    >
      <div className="flex items-center w-full justify-center flex-col gap-4 py-4">
        {!success && !error && <BeatLoader color="var(--primary)" />}
        <FormSuccess message={success} />
        {!success && <FormError message={error} />}

        {success && (
          <p className="text-sm text-muted-foreground animate-pulse">
            Redirecting to login...
          </p>
        )}
      </div>
    </CardWrapper>
  );
};
