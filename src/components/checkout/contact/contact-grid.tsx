import { useEffect } from "react";
import { useAtom } from "jotai";
import { customerContactAtom } from "@store/checkout";
import PhoneInput from '@components/ui/forms/phone-input';

interface ContactProps {
  contact: string | undefined | null;
  label: string;
  count?: number;
  userId?: string;
  profileId?: string;
  className?: string;
}

const ContactGrid = ({ contact, label, count, className }: ContactProps) => {
  const [contactNumber, setContactNumber] = useAtom(customerContactAtom);

  useEffect(() => {
    if (contact) {
      setContactNumber(contact);
    }
  }, [contact, setContactNumber]);

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

      <div className="w-full">
        <PhoneInput
          country="ma"
          value={contactNumber}
          onChange={(value: string) => setContactNumber(value)}
          inputClass="!p-0 ltr:!pr-4 rtl:!pl-4 ltr:!pl-14 rtl:!pr-14 !flex !items-center !w-full !appearance-none !transition !duration-300 !ease-in-out !text-heading !text-sm focus:!outline-none focus:!ring-0 !border !border-gray-400 !rounded focus:!border-heading !h-12"
          dropdownClass="focus:!ring-0 !border !border-gray-400 !shadow-350"
        />
      </div>
    </div>
  );
};

export default ContactGrid;
