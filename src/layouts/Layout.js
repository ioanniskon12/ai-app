// components/Layout.js
import Navbar from "./Navbar";
import Footer from "./Footer";

import styled from "styled-components";

const Main = styled.main`
  min-height: 100vh;
  background: #f9fafb;
`;

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <Main>{children}</Main>
      <Footer />
    </>
  );
}
