import Image from "next/image";

const providers = [
  { name: "Google", icon: "/google.svg" },
  { name: "Apple", icon: "/apple.svg" },
] as const;

export default function SocialProviders() {
  return (
    <div className="flex flex-col gap-3">
      {providers.map(({ name, icon }) => (
        <button
          key={name}
          type="button"
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-light-300 bg-light-100 px-4 py-3 text-body-medium text-dark-900 transition-colors hover:bg-light-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark-900 cursor-pointer"
        >
          <Image src={icon} alt="" width={20} height={20} aria-hidden="true" />
          Continue with {name}
        </button>
      ))}
    </div>
  );
}
