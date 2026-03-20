import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartProvider from "@/components/CartProvider";
import { getCart } from "@/lib/actions/cart";

export default async function RootGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cartItems = await getCart();

  return (
    <>
      <CartProvider items={cartItems} />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
