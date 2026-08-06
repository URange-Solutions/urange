import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAdminSession } from "./lib/auth";

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const authPages = ["/admin/login"];
  const publicPages = ["/"];

  if (publicPages.includes(pathname)) {
    return NextResponse.next();
  }

  try {

    const session = await getAdminSession();

    if (!session) {
      if (authPages.includes(pathname)) {
        return NextResponse.next();
      }

      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    if (authPages.includes(pathname)) {
      return NextResponse.redirect(
        new URL("/admin", req.url)
      );
    }

    const headers = new Headers(req.headers);

    headers.set("x-user-id", session.admins.id);
    headers.set("x-user-role", session.admins.role);

    return NextResponse.next({
      request: {
        headers,
      },
    });

  } catch (error) {
    console.error("Error:", error)
    return NextResponse.redirect(
      new URL("/", req.url)
    );
  }

}

export const config = {
  matcher: [
    "/admin/:path*",
    "/login"
  ],
};