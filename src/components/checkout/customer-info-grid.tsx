import React from 'react';
import { useAtom } from 'jotai';
import { guestNameAtom, billingAddressAtom } from '@store/checkout';
import { useTranslation } from 'next-i18next';
import Input from '@components/ui/input';

interface CustomerInfoGridProps {
  count: number;
  label: string;
  className?: string;
}

const CustomerInfoGrid: React.FC<CustomerInfoGridProps> = ({
  count,
  label,
  className,
}) => {
  const { t } = useTranslation('common');
  const [name, setName] = useAtom(guestNameAtom);
  const [billingAddress, setBillingAddress] = useAtom(billingAddressAtom);

  const address = billingAddress?.address || {};

  function updateAddress(field: string, value: string) {
    setBillingAddress({
      ...(billingAddress as any),
      title: billingAddress?.title || 'Default',
      type: 'billing',
      address: {
        ...address,
        [field]: value,
      },
    });
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-5 lg:mb-6 xl:mb-7 -mt-1 xl:-mt-2">
        <div className="flex items-center gap-3 md:gap-4 text-lg lg:text-xl text-heading capitalize font-medium">
          {count && (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-heading text-base text-white lg:text-xl">
              {count}
            </span>
          )}
          {label}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          //@ts-ignore
          value={name || ''}
          name="customerFullName"
          onChange={(e) => setName(e.target.value)}
          variant="outline"
          placeholder={t('text-name') || 'Nom complet'}
          inputClassName="py-2 px-4 md:px-5 w-full appearance-none border text-input text-xs md:text-[13px] lg:text-sm font-body rounded-md placeholder-body min-h-12 transition duration-200 ease-in-out bg-white border-gray-300 focus:outline-none focus:border-heading h-11 md:h-12"
        />
        <Input
          //@ts-ignore
          value={address.city || ''}
          name="city"
          onChange={(e) => updateAddress('city', e.target.value)}
          variant="outline"
          placeholder={t('text-city') || 'Ville'}
          inputClassName="py-2 px-4 md:px-5 w-full appearance-none border text-input text-xs md:text-[13px] lg:text-sm font-body rounded-md placeholder-body min-h-12 transition duration-200 ease-in-out bg-white border-gray-300 focus:outline-none focus:border-heading h-11 md:h-12"
        />
        <div className="sm:col-span-2">
          <Input
            //@ts-ignore
            value={address.street_address || ''}
            name="streetAddress"
            onChange={(e) => updateAddress('street_address', e.target.value)}
            variant="outline"
            placeholder={t('text-street-address') || 'Adresse'}
            inputClassName="py-2 px-4 md:px-5 w-full appearance-none border text-input text-xs md:text-[13px] lg:text-sm font-body rounded-md placeholder-body min-h-12 transition duration-200 ease-in-out bg-white border-gray-300 focus:outline-none focus:border-heading h-11 md:h-12"
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerInfoGrid;
