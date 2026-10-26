"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const redirectTo = () => `${window.location.origin}/auth/callback`;
  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  async function signInWithGoogle() {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTo() },
    });
    if (error) setStatus("error");
  }

  async function signInWithEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo() },
    });
    setStatus(error ? "error" : "sent");
  }

  if (status === "sent") {
    return (
      <div className="mt-8 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        <p className="font-semibold">메일함을 확인하세요</p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {email}로 로그인 링크를 보냈어요. 링크를 누르면 바로 로그인돼요.
        </p>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <p className="mt-8 rounded-xl bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
        Supabase가 아직 연결되지 않았어요. <code>.env.local</code>에 URL과 키를 넣고 개발 서버를 다시
        시작하면 로그인할 수 있어요.
      </p>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-4">
      <button
        type="button"
        onClick={signInWithGoogle}
        className="flex h-12 items-center justify-center rounded-xl border border-zinc-300 font-semibold hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
      >
        Google로 계속하기
      </button>

      <div className="flex items-center gap-3 text-sm text-zinc-500">
        <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        또는
        <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <form onSubmit={signInWithEmail} className="flex flex-col gap-3">
        <label htmlFor="email" className="text-sm font-medium">
          이메일
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="h-12 rounded-xl border border-zinc-300 bg-transparent px-4 dark:border-zinc-700"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="flex h-12 items-center justify-center rounded-xl bg-emerald-700 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {status === "sending" ? "보내는 중..." : "로그인 링크 받기"}
        </button>
      </form>

      {status === "error" && (
        <p className="text-sm text-red-600 dark:text-red-400">
          요청에 실패했어요. 잠시 후 다시 시도해 주세요.
        </p>
      )}
    </div>
  );
}
