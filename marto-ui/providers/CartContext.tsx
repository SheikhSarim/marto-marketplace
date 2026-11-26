'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem, Product } from '@/types';
import { CLIENT_STORAGE_KEYS, safeGetStorage, safeSetStorage } from '@/lib/storage';

export interface CartShopInfo {
  id: string;
  name: string;
  city?: string;
  deliveryInfo?: string;
  deliveryFee?: number | null;
}

export interface CartConflictInfo {
  pendingProduct: Product;
  pendingShop: CartShopInfo;
  pendingSellerId: string;
  pendingQuantity: number;
  currentShopName: string;
  newShopName: string;
}

interface StoredCartPayload {
  items: CartItem[];
  activeShop: CartShopInfo | null;
  activeSellerId: string | null;
}

interface CartContextType {
  items: CartItem[];
  activeSellerId: string | null;
  activeShopId: string | null;
  activeShop: CartShopInfo | null;
  conflictModal: CartConflictInfo | null;
  itemsCount: number;
  subtotal: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addToCart: (
    product: Product,
    shop?: CartShopInfo,
    quantity?: number
  ) => boolean;
  resolveConflict: (decision: 'replace' | 'cancel') => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [activeShop, setActiveShop] = useState<CartShopInfo | null>(null);
  const [activeSellerId, setActiveSellerId] = useState<string | null>(null);
  const [conflictModal, setConflictModal] = useState<CartConflictInfo | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const saved = safeGetStorage<StoredCartPayload | null>(CLIENT_STORAGE_KEYS.GUEST_CART, null);
    if (saved && Array.isArray(saved.items)) {
      setItems(saved.items);
      setActiveShop(saved.activeShop || null);
      setActiveSellerId(saved.activeSellerId || null);
    }
  }, []);

  const persistCart = useCallback(
    (newItems: CartItem[], newShop: CartShopInfo | null, newSellerId: string | null) => {
      setItems(newItems);
      setActiveShop(newShop);
      setActiveSellerId(newSellerId);
      safeSetStorage<StoredCartPayload>(CLIENT_STORAGE_KEYS.GUEST_CART, {
        items: newItems,
        activeShop: newShop,
        activeSellerId: newSellerId,
      });
    },
    []
  );

  const activeShopId = activeShop?.id || null;

  const addToCart = useCallback(
    (product: Product, shopArg?: CartShopInfo, quantity = 1): boolean => {
      const resolvedShop: CartShopInfo = shopArg || {
        id: product.shopId || 'unknown_shop',
        name: product.shopName || 'Verified Merchant',
        city: product.shopCity,
      };
      const sellerKey = product.sellerId || resolvedShop.id;

      // Enforce BR-08 Single-Seller Per Order rule
      if (
        items.length > 0 &&
        ((activeShopId && resolvedShop.id !== activeShopId) ||
          (activeSellerId && sellerKey !== activeSellerId))
      ) {
        setConflictModal({
          pendingProduct: product,
          pendingShop: resolvedShop,
          pendingSellerId: sellerKey,
          pendingQuantity: quantity,
          currentShopName: activeShop?.name || 'Current Shop',
          newShopName: resolvedShop.name,
        });
        return false;
      }

      const existingIdx = items.findIndex((i) => i.product.id === product.id);
      const maxStock = Math.max(1, product.stock || 99);
      let nextItems: CartItem[];

      if (existingIdx > -1) {
        nextItems = items.map((item, idx) =>
          idx === existingIdx
            ? { ...item, quantity: Math.min(maxStock, item.quantity + quantity) }
            : item
        );
      } else {
        nextItems = [
          ...items,
          {
            product,
            shop: resolvedShop,
            sellerId: sellerKey,
            quantity: Math.min(maxStock, Math.max(1, quantity)),
          },
        ];
      }

      persistCart(nextItems, resolvedShop, sellerKey);
      setIsDrawerOpen(true);
      return true;
    },
    [items, activeShopId, activeSellerId, activeShop?.name, persistCart]
  );

  const resolveConflict = useCallback(
    (decision: 'replace' | 'cancel') => {
      if (!conflictModal) return;
      if (decision === 'replace') {
        const replacement: CartItem = {
          product: conflictModal.pendingProduct,
          shop: conflictModal.pendingShop,
          sellerId: conflictModal.pendingSellerId,
          quantity: conflictModal.pendingQuantity,
        };
        persistCart(
          [replacement],
          conflictModal.pendingShop,
          conflictModal.pendingSellerId
        );
        setIsDrawerOpen(true);
      }
      setConflictModal(null);
    },
    [conflictModal, persistCart]
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        const filtered = items.filter((i) => i.product.id !== productId);
        if (filtered.length === 0) {
          persistCart([], null, null);
        } else {
          persistCart(filtered, activeShop, activeSellerId);
        }
        return;
      }

      const nextItems = items.map((item) => {
        if (item.product.id === productId) {
          const maxStock = Math.max(1, item.product.stock || 99);
          return { ...item, quantity: Math.min(maxStock, quantity) };
        }
        return item;
      });
      persistCart(nextItems, activeShop, activeSellerId);
    },
    [items, activeShop, activeSellerId, persistCart]
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      const filtered = items.filter((i) => i.product.id !== productId);
      if (filtered.length === 0) {
        persistCart([], null, null);
      } else {
        persistCart(filtered, activeShop, activeSellerId);
      }
    },
    [items, activeShop, activeSellerId, persistCart]
  );

  const clearCart = useCallback(() => {
    persistCart([], null, null);
  }, [persistCart]);

  const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.finalPrice * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        activeSellerId,
        activeShopId,
        activeShop,
        conflictModal,
        itemsCount,
        subtotal,
        isDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
        addToCart,
        resolveConflict,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
