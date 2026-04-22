import { useUI } from '@contexts/ui.context';
import Modal from './modal';
import dynamic from 'next/dynamic';
import Newsletter from '@components/common/newsletter';

const ProductPopup = dynamic(() => import('@components/product/product-popup'));
const ProductVariation = dynamic(
  () => import('@components/product/variation-modal'),
);
const AddOrUpdateCheckoutContact = dynamic(
  () => import('@components/checkout/contact/add-or-update'),
);
const CreateOrUpdateGuestAddressForm = dynamic(
  () => import('@components/checkout/create-or-update-guest'),
);
const GalleryModal = dynamic(() => import('@components/ui/gallery'));
const NewsLetterModal = dynamic(
  () => import('@components/maintenance/news-letter'),
  { ssr: false },
);
const PromoPopup = dynamic(() => import('@components/promo-popup'), {
  ssr: false,
});

const ManagedModal: React.FC = () => {
  const { displayModal, closeModal, modalView, modalData } = useUI();
  const modalVariant =
    modalView === 'ADD_OR_UPDATE_CHECKOUT_CONTACT' ? 'default' : 'center';

  if (modalView === 'GALLERY_VIEW') {
    return (
      <Modal open={displayModal} onClose={closeModal} variant="fullWidth">
        <GalleryModal data={modalData} />
      </Modal>
    );
  }
  if (modalView === 'PROMO_POPUP_MODAL') {
    return <PromoPopup />;
  }
  return (
    <Modal open={displayModal} onClose={closeModal} variant={modalVariant}>
      {modalView === 'PRODUCT_VIEW' && <ProductPopup productSlug={modalData} />}
      {modalView === 'SELECT_PRODUCT_VARIATION' && (
        <ProductVariation productSlug={modalData} />
      )}
      {modalView === 'NEWSLETTER_VIEW' && <Newsletter />}
      {modalView === 'ADD_OR_UPDATE_CHECKOUT_CONTACT' && (
        <AddOrUpdateCheckoutContact data={modalData} />
      )}
      {modalView === 'ADD_OR_UPDATE_GUEST_ADDRESS' && (
        <CreateOrUpdateGuestAddressForm />
      )}
      {modalView === 'NEWSLETTER_MODAL' && <NewsLetterModal />}
    </Modal>
  );
};

export default ManagedModal;
