"use client";
import Nav from "../../components/Nav";
import RequireAdmin from "../../components/RequireAdmin";
import { useAuth } from "../../components/AuthProvider";

export default function AdminPage() {
  const { user } = useAuth();

  return (
    <>
      <Nav />
      <RequireAdmin>
        <main className="mx-auto max-w-4xl px-4 pt-28 pb-16">
          <h1 className="font-poppins text-2xl text-[#0c3b44]">Admin dashboard</h1>
          <p className="mt-2 text-sm text-black/60">
            Signed in as {user?.name} ({user?.email}).
          </p>
          <p className="mt-6 text-sm text-black/50">
            Submission review, monastery management, and analytics land here in later phases.
          </p>
        </main>
      </RequireAdmin>
    </>
  );
}
