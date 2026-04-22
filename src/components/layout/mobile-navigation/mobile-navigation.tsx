import HomeIcon from '@components/icons/home-icon';
import MenuIcon from '@components/icons/menu-icon';
import SearchIcon from '@components/icons/search-icon';
import Link from '@components/ui/link';
import { useUI } from '@contexts/ui.context';
import dynamic from 'next/dynamic';
import { useCallback } from 'react';
const CartButton = dynamic(() => import('@components/cart/cart-button'), {
  ssr: false,
});

const BottomNavigation: React.FC = () => {
  const { openSearch, openSidebar } = useUI();

  const handleMobileMenu = useCallback(() => {
    return openSidebar({
      view: 'DISPLAY_MOBILE_MENU',
    });
  }, []);

  return (
    <>
      <div className="md:hidden fixed z-10 bottom-0 flex items-center justify-between shadow-bottomNavigation text-gray-700 body-font bg-white w-full h-14 sm:h-16 px-4">
        <button
          aria-label="Menu"
          className="menuBtn flex flex-col items-center justify-center flex-shrink-0 outline-none focus:outline-none"
          onClick={handleMobileMenu}
        >
          <MenuIcon />
        </button>
        <button
          className="flex items-center justify-center flex-shrink-0 h-auto relative focus:outline-none"
          onClick={openSearch}
          aria-label="search-button"
        >
          <SearchIcon />
        </button>
        <Link href="/" className="flex-shrink-0">
          <HomeIcon />
        </Link>
        <CartButton />
      </div>
    </>
  );
};

export default BottomNavigation;
