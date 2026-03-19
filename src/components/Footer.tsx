import Image from "next/image";
import Link from "next/link";

const footerColumns = [
  {
    title: "Featured",
    links: ["Air Force 1", "Huarache", "Air Max 90", "Air Max 95"],
  },
  {
    title: "Shoes",
    links: ["All Shoes", "Custom Shoes", "Jordan Shoes", "Running Shoes"],
  },
  {
    title: "Clothing",
    links: ["All Clothing", "Modest Wear", "Hoodies & Pullovers", "Shirts & Tops"],
  },
  {
    title: "Kids'",
    links: [
      "Infant & Toddler Shoes",
      "Kids' Shoes",
      "Kids' Jordan Shoes",
      "Kids' Basketball Shoes",
    ],
  },
];

const bottomLinks = [
  { label: "Guides", href: "/guides" },
  { label: "Terms of Sale", href: "/terms-of-sale" },
  { label: "Terms of Use", href: "/terms-of-use" },
  { label: "Nike Privacy Policy", href: "/privacy" },
];

const socialIcons = [
  { name: "X", src: "/x.svg", href: "#" },
  { name: "Facebook", src: "/facebook.svg", href: "#" },
  { name: "Instagram", src: "/instagram.svg", href: "#" },
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-dark-900">
      {/* Top section */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          {/* Logo + columns wrapper */}
          <div className="flex flex-col gap-10 sm:flex-row sm:gap-16">
            {/* Nike logo */}
            <Link href="/" aria-label="Home">
              <Image
                src="/logo.svg"
                alt="Nike"
                width={70}
                height={24}
                className="brightness-0 invert"
              />
            </Link>

            {/* Link columns */}
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <h4 className="text-caption font-jost text-light-100 mb-4">
                    {col.title}
                  </h4>
                  <ul className="flex flex-col gap-2.5">
                    {col.links.map((link) => (
                      <li key={link}>
                        <Link
                          href="#"
                          className="text-footnote font-jost text-dark-500 transition hover:text-light-100"
                        >
                          {link}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Social icons */}
          <div className="flex items-start gap-4">
            {socialIcons.map((icon) => (
              <Link
                key={icon.name}
                href={icon.href}
                aria-label={icon.name}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-dark-700 transition hover:border-light-100"
              >
                <Image
                  src={icon.src}
                  alt={icon.name}
                  width={16}
                  height={16}
                  className="brightness-0 invert"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-dark-700">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-4 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-footnote font-jost text-dark-500">
            <span className="mr-2">📍 Croatia</span>
            &copy; {new Date().getFullYear()} Nike, Inc. All Rights Reserved
          </p>
          <ul className="flex flex-wrap items-center gap-4 sm:gap-6">
            {bottomLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-footnote font-jost text-dark-500 transition hover:text-light-100"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
