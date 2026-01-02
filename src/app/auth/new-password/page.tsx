import { Suspense } from "react";
import { NewPasswordForm } from "@/modules/auth/components/new-password-form";

const NewPasswordPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewPasswordForm />
    </Suspense>
  );
};

export default NewPasswordPage;
