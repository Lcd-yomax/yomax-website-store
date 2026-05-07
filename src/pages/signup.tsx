import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    redirect: { destination: "/", permanent: false },
    props: {
      ...(await serverSideTranslations(locale!, ["common", "menu", "footer"])),
    },
  };
};

export default function SignUpPage() {
  return null;
}
