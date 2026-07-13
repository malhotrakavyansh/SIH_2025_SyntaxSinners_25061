"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Nav from "../../components/Nav";
import { useAuth } from "../../components/AuthProvider";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    const ok = await login(email, password);
    setSubmitting(false);
    if (ok) {
      router.push("/");
    } else {
      setFormError("Invalid email or password.");
    }
  };

  return (
    <>
      <Nav />
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 pt-24 pb-16">
        <h1 className="font-poppins text-2xl text-[#0c3b44]">Log in</h1>
        <p className="mt-2 text-sm text-black/60">
          Welcome back to Sangha.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-md border border-black/15 px-3 py-2 outline-none focus:border-[#0c3b44]"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-md border border-black/15 px-3 py-2 outline-none focus:border-[#0c3b44]"
            />
          </label>

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-md bg-[#0c3b44] px-4 py-2 text-white hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-sm text-black/60">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[#0c3b44] underline">
            Register
          </Link>
        </p>
      </main>
    </>
  );
}
