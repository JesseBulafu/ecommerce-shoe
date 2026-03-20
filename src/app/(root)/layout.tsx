import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartProvider from "@/components/CartProvider";
import ScrollReveal from "@/components/animations/ScrollReveal";
import { getCart } from "@/lib/actions/cart";
import { getSession } from "@/lib/auth/actions";
import { isAdmin } from "@/lib/actions/admin";

export default async function RootGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [cartItems, session] = await Promise.all([getCart(), getSession()]);
  const isLoggedIn = !!session?.user;
  const adminUser = isLoggedIn ? await isAdmin() : false;

  return (
    <>
      <CartProvider items={cartItems} />
      <Navbar
        isLoggedIn={isLoggedIn}
        isAdmin={adminUser}
        userName={session?.user?.name}
        userEmail={session?.user?.email}
        userImage={session?.user?.image}
      />
      <main className="flex-1">{children}</main>
      <ScrollReveal distance={40} duration={1}>
        <Footer />
      </ScrollReveal>
    </>
  );
}
