// components/auth/LoginForm.tsx
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function LoginForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await authClient.signIn.email({
      email: e.currentTarget.email.value,
      password: e.currentTarget.password.value,
    });
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4 p-6 glass-panel rounded-2xl transition-all duration-300 hover:border-white/20">
      <h2 className="text-xl font-semibold text-white">Login</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="p-2 rounded-md bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="p-2 rounded-md bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          required
        />
        <button
          disabled={loading}
          className="mt-2 p-2 bg-blue-600 text-white rounded-md font-medium active:scale-95 transition-transform disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Continue"}
        </button>
      </form>
    </div>
  );
}