// src/pages/auth/signin.jsx
import { useRouter } from "next/router";
import AuthModal from "../../components/modals/AuthModal";

export default function SignInPage() {
  const router = useRouter();

  // if you ever want to redirect after login:
  // const callbackUrl = Array.isArray(router.query.callbackUrl)
  //   ? router.query.callbackUrl[0]
  //   : router.query.callbackUrl || "/";

  return (
    <AuthModal
      onClose={() => {
        // go back, or to a specific callbackUrl:
        router.back();
      }}
    />
  );
}
