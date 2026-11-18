import { requireUser } from "@/lib/auth";
import { moodleIdentity } from "@/lib/identity";
import { moodle, moodleLink } from "@/lib/moodle";

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return new Response("Invalid origin", { status: 403 });
  }
  const userId = await requireUser();
  const form = await request.formData();
  const courseId = Number(form.get("course"));
  if (!Number.isSafeInteger(courseId) || courseId < 1) {
    return new Response("Invalid course", { status: 400 });
  }

  try {
    const moodleId = await moodleIdentity(userId);
    if (!moodleId) return new Response("No learning account linked", { status: 403 });
    const courses = await moodle<{ id: number }[]>("core_enrol_get_users_courses", { userid: moodleId });
    if (!courses.some(course => course.id === courseId)) {
      return new Response("Course access denied", { status: 403 });
    }
    const result = await moodle<{ loginurl: string }>("auth_userkey_request_login_url", { "user[id]": moodleId });
    const login = new URL(result.loginurl);
    const expected = new URL("/auth/userkey/login.php", process.env.MOODLE_URL);
    if (login.origin !== expected.origin || login.pathname !== expected.pathname) {
      throw new Error("Unexpected learning login destination.");
    }
    login.searchParams.set("wantsurl", moodleLink("/course/view.php?id=" + courseId));
    return new Response(null, {
      status: 303,
      headers: { Location: login.href, "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" },
    });
  } catch {
    return new Response("Learning sign-in is temporarily unavailable. Please contact admissions.", { status: 503 });
  }
}
