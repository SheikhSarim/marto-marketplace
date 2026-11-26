import { LucideIcon } from 'lucide-react';
import { UserRole } from '@/types';
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  LayoutGrid,
  ShoppingCart,
  Sliders,
  DollarSign,
  Settings,
  ShoppingBag,
  MapPin,
  User,
} from 'lucide-react';

export interface DashboardNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  badge?: string | number;
  badgeVariant?: 'default' | 'warning' | 'success' | 'destructive';
  roles?: UserRole[];
}

export const SUPER_ADMIN_NAV_ITEMS: DashboardNavItem[] = [
  {
    id: 'dashboard',
    label: 'Overview',
    icon: LayoutDashboard,
    href: '/admin/dashboard',
    roles: ['SUPER_ADMIN'],
  },
  {
    id: 'sellers',
    label: 'Sellers',
    icon: Users,
    href: '/admin/sellers',
    roles: ['SUPER_ADMIN'],
  },
  {
    id: 'shops',
    label: 'Shops',
    icon: Store,
    href: '/admin/shops',
    roles: ['SUPER_ADMIN'],
  },
  {
    id: 'products',
    label: 'Products',
    icon: Package,
    href: '/admin/products',
    roles: ['SUPER_ADMIN'],
  },
  {
    id: 'categories',
    label: 'Categories',
    icon: LayoutGrid,
    href: '/admin/categories',
    roles: ['SUPER_ADMIN'],
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: ShoppingCart,
    href: '/admin/orders',
    roles: ['SUPER_ADMIN'],
  },
  {
    id: 'settings',
    label: 'Platform Settings',
    icon: Sliders,
    href: '/admin/settings',
    roles: ['SUPER_ADMIN'],
  },
];

export const SELLER_NAV_ITEMS: DashboardNavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/seller/dashboard',
    roles: ['SELLER'],
  },
  {
    id: 'shop',
    label: 'My Shop',
    icon: Store,
    href: '/seller/shop',
    roles: ['SELLER'],
  },
  {
    id: 'products',
    label: 'Products',
    icon: Package,
    href: '/seller/products',
    roles: ['SELLER'],
  },
  {
    id: 'categories',
    label: 'Collections',
    icon: LayoutGrid,
    href: '/seller/categories',
    roles: ['SELLER'],
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: ShoppingCart,
    href: '/seller/orders',
    roles: ['SELLER'],
  },
  {
    id: 'revenue',
    label: 'Revenue & Payouts',
    icon: DollarSign,
    href: '/seller/revenue',
    roles: ['SELLER'],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/seller/settings',
    roles: ['SELLER'],
  },
];

export const CUSTOMER_NAV_ITEMS: DashboardNavItem[] = [
  {
    id: 'store',
    label: 'Explore Marketplace',
    icon: ShoppingBag,
    href: '/',
    roles: ['CUSTOMER', 'GUEST'],
  },
  {
    id: 'orders',
    label: 'My Orders',
    icon: ShoppingCart,
    href: '/account/orders',
    roles: ['CUSTOMER'],
  },
  {
    id: 'addresses',
    label: 'Saved Addresses',
    icon: MapPin,
    href: '/account/addresses',
    roles: ['CUSTOMER'],
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    href: '/account/profile',
    roles: ['CUSTOMER'],
  },
];

export function getNavItemsForRole(role?: UserRole): DashboardNavItem[] {
  switch (role) {
    case 'SUPER_ADMIN':
      return SUPER_ADMIN_NAV_ITEMS;
    case 'SELLER':
      return SELLER_NAV_ITEMS;
    case 'CUSTOMER':
    default:
      return CUSTOMER_NAV_ITEMS;
  }
}
