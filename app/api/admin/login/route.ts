import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "rvyk";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "phi=314159";
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "rvyk_super_secret_admin_token_2026_phi";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Set secure HTTP-only cookie
      const cookieStore = await cookies();
      cookieStore.set("admin_session", SESSION_SECRET, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return NextResponse.json({ success: true, message: "Login successful" });
    }

    return NextResponse.json(
      { success: false, message: "Invalid username or password" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "An error occurred during authentication" },
      { status: 500 }
    );
  }
}
