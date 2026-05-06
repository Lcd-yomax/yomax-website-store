import Coupon from '@components/checkout/coupon/coupon';
import usePrice from '@lib/use-price';
import EmptyCartIcon from '@components/icons/empty-cart';
import { CloseIcon } from '@components/icons/close-icon';
import { useTranslation } from 'next-i18next';
import { useCart } from '@store/quick-cart/cart.context';
import {
  calculateTotal,
} from "@store/quick-cart/cart.utils";
import { useAtom } from "jotai";
import {
  couponAtom,
  discountAtom,
} from '@store/checkout';
import ItemCard from '@components/checkout/item/item-card';
import { ItemInfoRow } from '@components/checkout/item/item-info-row';
import { WhatsAppOrderAction } from '@components/checkout/action/whatsapp-order-action';

interface Props {
  className?: string;
}
const VerifiedItemList: React.FC<Props> = ({ className }) => {
  const { t } = useTranslation("common");
  const { items, isEmpty: isEmptyCart } = useCart();
  const [coupon, setCoupon] = useAtom(couponAtom);
  const [discount] = useAtom(discountAtom);

  const base_amount = calculateTotal(items);
  const { price: sub_total } = usePrice({
    amount: base_amount,
  });

  const { price: discountPrice } = usePrice(
    //@ts-ignore
    discount && {
      amount: Number(discount),
    }
  );

  const totalAmount = base_amount - (Number(discount) || 0);
  const { price: total } = usePrice({
    amount: totalAmount > 0 ? totalAmount : 0,
  });

  return (
    <div className={className}>
      <div className="flex flex-col">
        <div className="flex items-center justify-between text-heading text-base font-semibold bg-gray-200 px-6 py-3.5 border-b border-gray-300">
          <span>{t('text-product')}</span>
          <span>{t('text-sub-total')}</span>
        </div>
        {!isEmptyCart ? (
          <div className="px-6 py-2.5">
            {items?.map((item) => (
              <ItemCard
                item={item}
                key={item.id}
                notAvailable={false}
              />
            ))}
          </div>
        ) : (
          <EmptyCartIcon />
        )}
      </div>

      
      <WhatsAppOrderAction />
    </div>
  );
};

export default VerifiedItemList;
