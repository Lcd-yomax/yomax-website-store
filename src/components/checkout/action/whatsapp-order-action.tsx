import Button from '@components/ui/button';
import { useCart } from '@store/quick-cart/cart.context';
import { useAtom } from 'jotai';
import {
  checkoutAtom,
  discountAtom,
  couponAtom,
} from '@store/checkout';
import {
  calculatePaidTotal,
  calculateTotal,
} from '@store/quick-cart/cart.utils';
import isEmpty from 'lodash/isEmpty';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

export const WhatsAppOrderAction: React.FC = () => {
  const { items } = useCart();

  const [discount] = useAtom(discountAtom);
  const [coupon] = useAtom(couponAtom);
  const [
    {
      shipping_address,
      delivery_time,
      customer_contact,
      customer_name,
      customer_email,
      verified_response,
      note,
    },
  ] = useAtom(checkoutAtom);

  const available_items = items?.filter(
    (item) => !verified_response?.unavailable_products?.includes(item.id)
  );

  const subtotal = calculateTotal(available_items);
  const tax = verified_response?.total_tax ?? 0;
  const shippingCharge = verified_response?.shipping_charge ?? 0;
  const total = calculatePaidTotal(
    {
      totalAmount: subtotal,
      tax,
      shipping_charge: shippingCharge,
    },
    Number(discount)
  );

  const buildMessage = () => {
    const lines: string[] = [];

    lines.push('🛒 *Nouvelle commande — Yomax*');
    lines.push('');

    // Customer info
    if (customer_name) lines.push(`👤 *Nom :* ${customer_name}`);
    if (customer_email) lines.push(`📧 *Email :* ${customer_email}`);
    if (customer_contact) lines.push(`📞 *Tél :* ${customer_contact}`);
    lines.push('');

    // Shipping address
    const addr = shipping_address?.address;
    if (addr) {
      const parts = [addr.street_address, addr.city, addr.state, addr.zip, addr.country].filter(Boolean);
      if (parts.length) {
        lines.push(`📍 *Adresse :* ${parts.join(', ')}`);
      }
    }

    // Delivery time
    if (delivery_time?.title) {
      lines.push(`🕐 *Livraison :* ${delivery_time.title}`);
    }
    lines.push('');

    // Items
    lines.push('📦 *Articles :*');
    available_items?.forEach((item, index) => {
      const qty = item.quantity ?? 1;
      const itemTotal = (item.price * qty).toFixed(2);
      lines.push(`  ${index + 1}. ${item.name} × ${qty} — ${itemTotal} MAD`);
    });
    lines.push('');

    // Totals
    lines.push(`💰 *Sous-total :* ${subtotal.toFixed(2)} MAD`);
    if (tax > 0) lines.push(`🧾 *Taxe :* ${tax.toFixed(2)} MAD`);
    if (shippingCharge > 0)
      lines.push(`🚚 *Livraison :* ${shippingCharge.toFixed(2)} MAD`);
    if (discount && coupon) {
      lines.push(`🏷️ *Réduction (${coupon.code}) :* -${Number(discount).toFixed(2)} MAD`);
    }
    lines.push(`✅ *Total :* ${total.toFixed(2)} MAD`);

    // Note
    if (note) {
      lines.push('');
      lines.push(`📝 *Note :* ${note}`);
    }

    return lines.join('\n');
  };

  const handleWhatsAppOrder = () => {
    const message = buildMessage();
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${WHATSAPP_NUMBER?.replace(/[^0-9+]/g, '')}?text=${encoded}`;
    window.open(url, '_blank');
  };

  const isReady = [customer_contact, available_items].every(
    (item) => !isEmpty(item)
  );

  return (
    <div className="px-6">
      <Button
        className="w-full my-2"
        onClick={handleWhatsAppOrder}
        disabled={!isReady || !WHATSAPP_NUMBER}
        style={{ backgroundColor: '#25D366', borderColor: '#25D366' }}
      >
        <svg
          className="w-5 h-5 ltr:mr-2 rtl:ml-2"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        Commander via WhatsApp
      </Button>
    </div>
  );
};
