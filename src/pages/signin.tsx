import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    redirect: { destination: "/", permanent: false },
    props: {
      ...(await serverSideTranslations(locale!, ["common", "menu", "footer"])),
    },
  };
};

export default function SignInPage() {
  return null;
}
