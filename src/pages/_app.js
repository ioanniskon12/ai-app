// pages/_app.js
import { SessionProvider } from "next-auth/react";
import Layout from "../layouts/Layout";
import GlobalStyle from "../styles/GlobalStyle"; // ← import your global styles

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  // Pages that should not have the navbar
  const noNavbarPages = ["/auth/login", "/auth/signup"];
  const shouldShowNavbar = !noNavbarPages.includes(Component.name);

  return (
    <SessionProvider session={session}>
      <GlobalStyle /> {/* ← render your global styles here */}
      {shouldShowNavbar ? (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      ) : (
        <Component {...pageProps} />
      )}
    </SessionProvider>
  );
}
