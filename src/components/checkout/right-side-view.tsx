import dynamic from "next/dynamic";

const VerifiedItemList = dynamic(
  () => import("@components/checkout/item/verified-item-list")
);

export const RightSideView = () => {
  return <VerifiedItemList className="border border-gray-300 rounded-md bg-white" />;
};

export default RightSideView;
