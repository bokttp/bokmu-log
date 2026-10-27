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
