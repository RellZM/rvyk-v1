import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set("admin_session", "", {
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
  cookieStore.delete("admin_session");

  return NextResponse.json({ success: true, message: "Logged out successfully" });
}
