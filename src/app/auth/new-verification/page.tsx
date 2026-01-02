import { Suspense } from "react";
import { NewVerificationForm } from "@/modules/auth/components/new-verification-form";

const NewVerificationPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewVerificationForm />
    </Suspense>
  );
};

export default NewVerificationPage;
