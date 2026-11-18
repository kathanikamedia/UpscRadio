import { db, execute } from "../lib/db";
const courses = [
  { slug: "demo-gs-foundation", title: "GS Foundation", category: "GS Foundation", summary: "Build your base across polity, history, geography and economy.", duration: "Programme duration to be confirmed" },
  { slug: "demo-prelims-practice", title: "Prelims Practice Programme", category: "Prelims", summary: "Revise core topics and develop a consistent question-practice routine.", duration: "Schedule to be confirmed" },
];
for (const course of courses) {
  await execute({
    sql: "INSERT OR IGNORE INTO content(kind,slug,title,summary,body,category,published,extra) VALUES ('course',?,?,?,?,?,1,?)",
    args: [course.slug, course.title, course.summary, "This is a demo course for preview. Faculty, schedule, fees and enrolment details will be supplied before admissions open.", course.category, JSON.stringify({ demo: true, duration: course.duration })],
  });
}
await execute({
  sql: "INSERT OR IGNORE INTO content(kind,slug,title,summary,body,category,published,extra) VALUES ('course','free-polity-starter','Free Polity Starter Mock','Take your first step with a focused introduction to UPSC-style polity practice.','An introductory 10-question polity practice test. Access will open once the learning platform is connected.','Test Series',1,?)",
  args: [JSON.stringify({ free_mock: true, price_paise: 0, question_count: 10, minutes: 15 })],
});
console.log("Created two labelled demo courses and one free mock-test listing.");
db.close();
