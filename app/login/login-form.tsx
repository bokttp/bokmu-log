"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { signInWithPassword, signUpWithPassword } from "@/app/auth/actions";
import type { ActionState } from "@/lib/actions";
import ActionMessage from "@/components/action-message";

const INPUT = "h-12 w-full rounded-xl border border-zinc-300 bg-transparent px-4 dark:border-zinc-700";
const PRIMARY =
  "flex h-12 items-center justify-center rounded-xl bg-emerald-700 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60";

// 이메일 + 비밀번호 로그인·회원가입. 메일을 보내지 않아 메일 발송 한도와 무관하다.
// 비밀번호가 없는 예전(링크 로그인) 계정을 위해 "로그인 링크 받기"를 보조로 남겨 둔다.
export default function LoginForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [signInState, signIn, signingIn] = useActionState<ActionState, FormData>(signInWithPassword, null);
  const [signUpState, signUp, signingUp] = useActionState<ActionState, FormData>(signUpWithPassword, null);
  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  async function signInWithGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  if (!isConfigured) {
    return (
      <div className="mt-8 flex flex-col gap-4">
        <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          Supabase가 아직 연결되지 않았어요. <code>.env.local</code>에 URL과 키를 넣고 개발 서버를 다시
          시작하면 로그인할 수 있어요.
        </p>
        {process.env.NODE_ENV !== "production" && (
          <Link href="/dashboard" className={PRIMARY}>
            예시 데이터로 둘러보기 (데모)
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      {/* 로그인 / 회원가입 전환 */}
      <div role="tablist" className="grid grid-cols-2 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
        {(["signin", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={`h-10 rounded-lg text-sm font-semibold ${
              mode === m ? "bg-white shadow-sm dark:bg-zinc-900" : "text-zinc-500"
            }`}
          >
            {m === "signin" ? "로그인" : "회원가입"}
          </button>
        ))}
      </div>

      {mode === "signin" ? (
        <form action={signIn} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium">
            이메일
            <input name="email" type="email" required autoComplete="email" placeholder="you@example.com" className={INPUT} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            비밀번호
            <input name="password" type="password" required autoComplete="current-password" className={INPUT} />
          </label>
          <ActionMessage state={signInState} />
          <button type="submit" disabled={signingIn} className={PRIMARY}>
            {signingIn ? "로그인 중..." : "로그인"}
          </button>
        </form>
      ) : (
        <form action={signUp} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium">
            이메일
            <input name="email" type="email" required autoComplete="email" placeholder="you@example.com" className={INPUT} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            비밀번호 (8자 이상)
            <input name="password" type="password" required minLength={8} autoComplete="new-password" className={INPUT} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            비밀번호 확인
            <input name="password_confirm" type="password" required minLength={8} autoComplete="new-password" className={INPUT} />
          </label>
          <ActionMessage state={signUpState} />
          <button type="submit" disabled={signingUp} className={PRIMARY}>
            {signingUp ? "가입 중..." : "가입하기"}
          </button>
        </form>
      )}

      {/* Google 로그인은 Supabase에서 Google 공급자를 설정한 뒤 NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN=true로 켠다 */}
      {process.env.NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN === "true" && (
        <button
          type="button"
          onClick={signInWithGoogle}
          className="flex h-12 items-center justify-center rounded-xl border border-zinc-300 font-semibold hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Google로 계속하기
        </button>
      )}

      <MagicLinkFallback />
    </div>
  );
}

// 비밀번호가 없는 예전 계정용 로그인 링크. 메일 발송 한도(1시간 2통)가 있다.
function MagicLinkFallback() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error" | "rate_limited">("idle");

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback`, shouldCreateUser: false },
    });
    if (error?.status === 429 || error?.code === "over_email_send_rate_limit") setStatus("rate_limited");
    else setStatus(error ? "error" : "sent");
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-sm text-zinc-500 underline">
        비밀번호를 아직 안 만들었나요? 로그인 링크 받기
      </button>
    );
  }

  return (
    <form onSubmit={send} className="flex flex-col gap-2 rounded-xl bg-zinc-50 p-4 text-sm dark:bg-zinc-800">
      <p className="text-zinc-600 dark:text-zinc-400">
        예전에 링크로 가입한 계정이에요? 링크로 로그인한 뒤 설정에서 비밀번호를 만들면 다음부터 비밀번호로 로그인할 수 있어요.
      </p>
      {status === "sent" ? (
        <p className="font-semibold">{email}로 로그인 링크를 보냈어요. 메일함을 확인하세요.</p>
      ) : (
        <>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-label="이메일"
            className={INPUT}
          />
          <button type="submit" disabled={status === "sending"} className="h-10 rounded-lg border border-zinc-300 font-semibold dark:border-zinc-600">
            {status === "sending" ? "보내는 중..." : "로그인 링크 받기"}
          </button>
        </>
      )}
      {status === "error" && <p className="text-red-600 dark:text-red-400">요청에 실패했어요. 잠시 후 다시 시도해 주세요.</p>}
      {status === "rate_limited" && (
        <p className="text-amber-700 dark:text-amber-300">지금은 메일을 보낼 수 없어요. 최대 1시간 뒤에 다시 시도해 주세요.</p>
      )}
    </form>
  );
}
