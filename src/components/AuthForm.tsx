"use client";

import Link from "next/link";
import SocialProviders from "./SocialProviders";

interface AuthFormProps {
  mode: "sign-in" | "sign-up";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const isSignUp = mode === "sign-up";

  return (
    <div className="font-jost">
      {/* Top link */}
      <p className="mb-8 text-right text-caption text-dark-700">
        {isSignUp ? "Already have an account? " : "Don\u2019t have an account? "}
        <Link
          href={isSignUp ? "/sign-in" : "/sign-up"}
          className="font-semibold text-dark-900 underline underline-offset-2 hover:text-dark-700"
        >
          {isSignUp ? "Sign In" : "Sign Up"}
        </Link>
      </p>

      {/* Heading */}
      <h1 className="text-heading-3 text-dark-900 mb-1">
        {isSignUp ? "Join Arstra Today!" : "Welcome Back!"}
      </h1>
      <p className="text-body text-dark-700 mb-8">
        {isSignUp
          ? "Create your account to start your fitness journey"
          : "Sign in to your account to continue shopping"}
      </p>

      {/* Social providers */}
      <SocialProviders />

      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-light-300" />
        <span className="text-caption text-dark-500">Or sign {isSignUp ? "up" : "in"} with</span>
        <div className="h-px flex-1 bg-light-300" />
      </div>

      {/* Form */}
      <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
        {/* Full Name — sign-up only */}
        {isSignUp && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-caption text-dark-900">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Enter your full name"
              required
              className="rounded-lg border border-light-300 bg-light-100 px-4 py-3 text-body text-dark-900 placeholder:text-dark-500 transition-colors focus:border-dark-900 focus:outline-none"
            />
          </div>
        )}

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-caption text-dark-900">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="johndoe@gmail.com"
            required
            className="rounded-lg border border-light-300 bg-light-100 px-4 py-3 text-body text-dark-900 placeholder:text-dark-500 transition-colors focus:border-dark-900 focus:outline-none"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-caption text-dark-900">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            placeholder="minimum 8 characters"
            minLength={8}
            required
            className="rounded-lg border border-light-300 bg-light-100 px-4 py-3 text-body text-dark-900 placeholder:text-dark-500 transition-colors focus:border-dark-900 focus:outline-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="mt-2 w-full rounded-lg bg-dark-900 px-4 py-3.5 text-body-medium text-light-100 transition-colors hover:bg-dark-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark-900 cursor-pointer"
        >
          {isSignUp ? "Sign Up" : "Sign In"}
        </button>
      </form>

      {/* Footer */}
      <p className="mt-6 text-center text-footnote text-dark-500">
        By signing {isSignUp ? "up" : "in"}, you agree to our{" "}
        <Link href="#" className="underline hover:text-dark-900">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="#" className="underline hover:text-dark-900">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}
