import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { useUser } from '@framework/auth';
import { getLayout } from '@components/layout/layout';
import Divider from '@components/ui/divider';
import Container from '@components/ui/container';
import Subscription from '@components/common/subscription';
import OrderNote from '@components/checkout/order-note';

export { getStaticProps } from '@framework/common.ssr';

const CustomerInfoGrid = dynamic(
  () => import('@components/checkout/customer-info-grid')
);
const ContactGrid = dynamic(
  () => import('@components/checkout/contact/contact-grid')
);
const RightSideView = dynamic(
  () => import('@components/checkout/right-side-view')
);

export default function CheckoutPage() {
  const { me, loading } = useUser();
  const { t } = useTranslation();
  return (
    <>
      {!loading ? (
        <>
          <Divider className="mb-0" />
          <Container>
            <div className="py-8 lg:py-10 xl:py-14 max-w-[1280px] mx-auto">
              <div className="flex flex-col items-center w-full m-auto lg:flex-row lg:items-start lg:space-x-7 xl:space-x-12 rtl:space-x-reverse">
                <div className="w-full space-y-6">
                  <ContactGrid
                    className="p-5 bg-white border border-gray-100 rounded-md shadow-checkoutCard md:p-7"
                    //@ts-ignore
                    userId={me?.id!}
                    profileId={me?.profile?.id!}
                    contact={me?.profile?.contact!}
                    label={t('text-contact-number')}
                    count={1}
                  />

                  <CustomerInfoGrid
                    className="p-5 bg-white border border-gray-100 rounded-md shadow-checkoutCard md:p-7"
                    label={t('text-contact-info') || 'Informations de contact'}
                    count={2}
                  />

                  <OrderNote count={3} label={t('Order Note')} className="p-5 bg-white border border-gray-100 rounded-md shadow-checkoutCard md:p-7" />
                </div>
                <div className="w-full lg:w-[320px] xl:w-[440px] flex-shrink-0 mt-10 sm:mt-12 lg:mt-0">
                  <RightSideView />
                </div>
              </div>
            </div>
            <Subscription />
          </Container>
        </>
      ) : (
        ''
      )}
    </>
  );
}

CheckoutPage.getLayout = getLayout;
