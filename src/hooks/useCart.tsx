import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      let product = cart.filter((p) => p.id === productId);

      if (product[0] !== undefined) {
        updateProductAmount({ productId, amount: product[0].amount });
        return;
      } else {
        let { data } = await api.get("/products");

        let newCart = data.filter((p: Product) => p.id === productId);
        newCart = { ...newCart[0], amount: 1 };

        setCart([...cart, newCart]);
        localStorage.setItem(
          "@RocketShoes:cart",
          JSON.stringify([...cart, newCart])
        );
      }
    } catch (erro) {
      // TODO
      console.log(erro);
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      const filteredCart = cart.filter((p) => p.id !== productId);
      setCart(filteredCart);
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      const { data } = await api.get("/stock");
      const Stock: Stock[] = data;
      if (Stock[productId - 1].amount === amount) {
        throw new Error();
      }

      const updatedCards = cart.map((product) => {
        if (product.id === productId) {
          return { ...product, amount: amount + 1 };
        }

        return {
          ...product,
        };
      });

      setCart(updatedCards);
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCards));
    } catch {
      // TODO
      toast.error("Quantidade solicitada fora de estoque");
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
