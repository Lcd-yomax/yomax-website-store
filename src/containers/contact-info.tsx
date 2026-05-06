import GoogleStaticMap from '@components/common/google-static-map';
import ContactInfoItem from '@components/ui/contact-info-block';
import HorizontalSocialLink from '@components/ui/horizontal-social-list';
import { useSettings } from '@contexts/settings.context';
import isEmpty from 'lodash/isEmpty';
import { useTranslation } from 'next-i18next';
import { FC } from 'react';
import { IoCallSharp, IoLocationSharp, IoMail } from 'react-icons/io5';

interface Props {
  image?: HTMLImageElement;
}

const STORE_LOCATIONS = [
  {
    label: 'Point de Vente Rabat GZA',
    lines: ['قيسارية واد الذهب الكزا الرباط رقم 74'],
  },
  {
    label: 'Point de Vente Casablanca',
    lines: ['Centre commercial takhfid reda', 'Magasin 208, Rabat'],
  },
  {
    label: 'Fès — Centre Ville',
    lines: ['Rue Mohamed El Oukili', 'Kisariyat Ghita n°20'],
  },
];

const ContactInfoBlock: FC<Props> = () => {
  const settings = useSettings();
  const { t } = useTranslation('common');
  return (
    <div className="mb-6 lg:border lg:rounded-md border-gray-300 lg:p-7">
      <h4 className="text-2xl md:text-lg font-bold text-heading pb-7 md:pb-10 lg:pb-6 -mt-1">
        {t('text-find-us-here')}
      </h4>

      {/* Store Locations */}
      <ContactInfoItem title={t('text-address')} data="">
        <IoLocationSharp />
      </ContactInfoItem>
      <div className="ltr:pl-9 rtl:pr-9 -mt-4 mb-7 space-y-4">
        {STORE_LOCATIONS.map((loc) => (
          <div key={loc.label}>
            <p className="text-sm font-semibold text-heading">{loc.label}</p>
            {loc.lines.map((line) => (
              <p key={line} className="text-sm text-body">{line}</p>
            ))}
          </div>
        ))}
      </div>

      {/* Email */}
      <ContactInfoItem
        title={t('text-email')}
        data={
          settings?.contactDetails?.emailAddress
            ? settings?.contactDetails?.emailAddress
            : t('text-no-email')
        }
      >
        <IoMail />
      </ContactInfoItem>

      {/* Phone */}
      <ContactInfoItem
        title={t('text-phone')}
        data={
          settings?.contactDetails?.contact ? (
            settings?.contactDetails?.contact
          ) : (
            <p className="text-red-500">{t('text-no-phone')}</p>
          )
        }
      >
        <IoCallSharp />
      </ContactInfoItem>

      {!isEmpty(settings?.contactDetails?.socials) ? (
        <HorizontalSocialLink socials={settings?.contactDetails?.socials} />
      ) : (
        ''
      )}

      {/* Google Map */}
      {!isEmpty(settings?.contactDetails?.location) && (
        <GoogleStaticMap
          lat={settings?.contactDetails?.location?.lat}
          lng={settings?.contactDetails?.location?.lng}
        />
      )}
    </div>
  );
};

export default ContactInfoBlock;
