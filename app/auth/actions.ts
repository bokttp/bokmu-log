"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isDemoMode } from "@/lib/demo";
import type { ActionState } from "@/lib/actions";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

const PASSWORD_MIN = 8;
const text = (v: FormDataEntryValue | null) => (typeof v === "string" ? v.trim() : "");
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// 이메일 + 비밀번호 로그인. 메일을 보내지 않으므로 메일 발송 한도와 무관하다.
export async function signInWithPassword(_: ActionState, form: FormData): Promise<ActionState> {
  const email = text(form.get("email")).toLowerCase();
  const password = typeof form.get("password") === "string" ? (form.get("password") as string) : "";
  if (!isEmail(email) || !password) return { ok: false, message: "이메일과 비밀번호를 입력해 주세요." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.code === "invalid_credentials") return { ok: false, message: "이메일 또는 비밀번호가 맞지 않아요." };
    if (error.status === 429) return { ok: false, message: "시도가 너무 많아요. 잠시 후 다시 시도해 주세요." };
    return { ok: false, message: "로그인하지 못했어요. 잠시 후 다시 시도해 주세요." };
  }
  redirect("/dashboard");
}

// 회원가입. Supabase에서 "이메일 확인"을 꺼 두었으므로 가입 즉시 로그인된다.
export async function signUpWithPassword(_: ActionState, form: FormData): Promise<ActionState> {
  const email = text(form.get("email")).toLowerCase();
  const password = typeof form.get("password") === "string" ? (form.get("password") as string) : "";
  const confirm = form.get("password_confirm");
  if (!isEmail(email)) return { ok: false, message: "이메일 주소를 확인해 주세요." };
  if (password.length < PASSWORD_MIN) return { ok: false, message: `비밀번호는 ${PASSWORD_MIN}자 이상으로 정해 주세요.` };
  if (password !== confirm) return { ok: false, message: "비밀번호 확인이 일치하지 않아요." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    if (error.code === "user_already_exists") return { ok: false, message: "이미 가입된 이메일이에요. 로그인해 주세요." };
    if (error.code === "weak_password") return { ok: false, message: "더 어려운 비밀번호로 정해 주세요." };
    if (error.status === 429) return { ok: false, message: "시도가 너무 많아요. 잠시 후 다시 시도해 주세요." };
    return { ok: false, message: "가입하지 못했어요. 잠시 후 다시 시도해 주세요." };
  }
  // 이미 가입된 이메일이면 오류 대신 identities가 빈 사용자가 돌아온다 (계정 존재 여부를 숨기는 Supabase 동작)
  if (data.user && data.user.identities?.length === 0) {
    return { ok: false, message: "이미 가입된 이메일이에요. 로그인해 주세요." };
  }
  if (!data.session) return { ok: true, message: "가입했어요. 메일함에서 확인 링크를 눌러 주세요." };
  redirect("/onboarding");
}

// 비밀번호 설정·변경 (로그인한 상태에서). 링크로 가입한 기존 계정도 여기서 비밀번호를 만든다.
export async function updatePassword(_: ActionState, form: FormData): Promise<ActionState> {
  const password = typeof form.get("password") === "string" ? (form.get("password") as string) : "";
  if (password.length < PASSWORD_MIN) return { ok: false, message: `비밀번호는 ${PASSWORD_MIN}자 이상으로 정해 주세요.` };
  if (password !== form.get("password_confirm")) return { ok: false, message: "비밀번호 확인이 일치하지 않아요." };
  if (isDemoMode()) return { ok: true, message: "데모 모드라서 실제로 바뀌지는 않아요." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    if (error.code === "same_password") return { ok: false, message: "지금 쓰는 비밀번호와 같아요." };
    if (error.code === "weak_password") return { ok: false, message: "더 어려운 비밀번호로 정해 주세요." };
    return { ok: false, message: "바꾸지 못했어요. 다시 로그인한 뒤 시도해 주세요." };
  }
  return { ok: true, message: "비밀번호를 저장했어요. 다음부터 이메일과 비밀번호로 로그인할 수 있어요." };
}

// 회원 탈퇴: auth.users를 지우면 profiles → goals·records가 cascade로 함께 지워진다.
// 확인 문구로 "탈퇴"를 직접 입력해야 진행한다.
export async function deleteAccount(_: ActionState, form: FormData): Promise<ActionState> {
  if (form.get("confirm") !== "탈퇴") return { ok: false, message: "확인 칸에 \"탈퇴\"를 입력해 주세요." };
  if (isDemoMode()) return { ok: true, message: "데모 모드라서 실제로 탈퇴되지는 않아요." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  if (!admin) return { ok: false, message: "지금은 탈퇴할 수 없어요. 잠시 후 다시 시도해 주세요." };
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return { ok: false, message: "탈퇴하지 못했어요. 잠시 후 다시 시도해 주세요." };

  // 계정이 이미 지워졌으니 서버 호출 없이 이 브라우저의 로그인 쿠키만 지운다
  await supabase.auth.signOut({ scope: "local" }).catch(() => {});
  redirect("/?bye=1");
}
