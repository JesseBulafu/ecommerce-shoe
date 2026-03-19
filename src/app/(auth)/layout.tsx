import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen font-jost">
      {/* Left branding panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] flex-col justify-between bg-dark-900 text-light-100 p-10">
        <Link href="/" aria-label="Home">
          <Image
            src="/logo.svg"
            alt="Arstra logo"
            width={48}
            height={48}
            className="rounded-lg"
          />
        </Link>

        <div>
          <h2 className="text-heading-2 text-light-100 mb-4">Just Do It</h2>
          <p className="text-body text-dark-500 max-w-xs">
            Join millions of athletes and fitness enthusiasts who trust Arstra
            for their performance needs.
          </p>

          {/* Carousel dots */}
          <div className="flex gap-2 mt-8" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-light-100" />
            <span className="h-2.5 w-2.5 rounded-full bg-dark-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-dark-700" />
          </div>
        </div>

        <p className="text-footnote text-dark-700">
          &copy; {new Date().getFullYear()} Arstra. All rights reserved.
        </p>
      </div>

      {/* Right form area */}
      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
