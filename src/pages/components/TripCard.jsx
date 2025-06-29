import Link from "next/link";
import styled from "styled-components";

const Card = styled.a`
  display: flex;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: transform 0.1s;
  &:hover {
    transform: translateY(-2px);
  }
`;
const Img = styled.img`
  width: 120px;
  height: 80px;
  object-fit: cover;
  flex-shrink: 0;
`;
const Info = styled.div`
  padding: 0.75rem;
  display: flex;
  align-items: center;
  font-weight: 500;
`;

export default function TripCard({ id, name, image }) {
  return (
    <Link href={`/trip/${id}`} passHref>
      <Card>
        <Img src={image} alt={name} />
        <Info>{name}</Info>
      </Card>
      r
    </Link>
  );
}
