// New file content
import { signIn, signOut, useSession } from "next-auth/react";
import styled from "styled-components";

const Button = styled.button`
  background: #0070f3;
  color: white;
  font-size: 1rem;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin: 0.5rem;
  transition: background 0.3s ease;

  &:hover {
    background: #005ad1;
  }
`;

export default function AuthButtons() {
  const { data: session } = useSession();
  if (session) {
    return (
      <Button onClick={() => signOut()} style={{ marginBottom: "1rem" }}>
        Sign out
      </Button>
    );
  }
  return (
    <Button onClick={() => signIn("google")} style={{ marginBottom: "1rem" }}>
      Sign in with Google
    </Button>
  );
}
