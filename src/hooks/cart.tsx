import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsStorage = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );
      if (productsStorage) setProducts([...JSON.parse(productsStorage)]);
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const findedProduct = products.find(p => p.id === product.id);
      if (findedProduct) {
        setProducts(
          products.map(p =>
            p.id === findedProduct.id
              ? {
                  ...findedProduct,
                  quantity: findedProduct.quantity + 1,
                }
              : p,
          ),
        );
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const findedProduct = products.find(p => p.id === id);
      if (findedProduct) {
        setProducts(
          products.map(p =>
            p.id === findedProduct.id
              ? {
                  ...findedProduct,
                  quantity: findedProduct.quantity + 1,
                }
              : p,
          ),
        );
        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(products),
        );
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const findedProductIndex = products.findIndex(p => p.id === id);
      const findedProduct = products[findedProductIndex];
      if (findedProduct) {
        if (findedProduct.quantity > 1) {
          setProducts(
            products.map(p =>
              p.id === findedProduct.id
                ? {
                    ...findedProduct,
                    quantity: findedProduct.quantity - 1,
                  }
                : p,
            ),
          );
        } else {
          products.splice(findedProductIndex, 1);
          setProducts([...products]);
        }
        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify(products),
        );
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
