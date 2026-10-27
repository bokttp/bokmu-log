import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// 로그인이 필요한 경로
const PROTECTED_PATHS = ["/dashboard", "/goals", "/records", "/settings", "/savings", "/books", "/fitness", "/certificates", "/study", "/more", "/onboarding"];

// 요청마다 세션을 갱신하고, 로그인 여부에 따라 이동시킨다.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // .env.local이 아직 없으면 로그인 검사 없이 화면만 보여준다 (로컬 화면 확인용)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    },
  );

  // 응답을 만들기 전에 호출해야 갱신된 토큰이 쿠키에 저장된다.
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = Boolean(data?.claims);
  const { pathname } = request.nextUrl;

  const redirectTo = (path: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = "";
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  };

  if (!isLoggedIn && PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return redirectTo("/login");
  }
  if (isLoggedIn && (pathname === "/" || pathname === "/login")) {
    return redirectTo("/dashboard");
  }

  return response;
}
