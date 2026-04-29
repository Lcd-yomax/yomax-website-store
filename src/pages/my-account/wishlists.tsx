import { GetStaticProps } from "next";
export const getStaticProps: GetStaticProps = async () => ({
  redirect: { destination: "/", permanent: false },
  props: {},
});
export default function WishlistsPage() { return null; }
