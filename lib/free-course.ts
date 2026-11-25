export const FREE_COURSE_SLUG = "upsc-preparation-starter";
export const FREE_COURSE_TITLE = "UPSC Preparation Starter";
export const FREE_COURSE_URL = "/courses/" + FREE_COURSE_SLUG + "/";
export const FREE_LEARNING_URL = "/student/free-course/";
export const starterLessons = [
  {
    slug: "understand-the-exam", title: "Start with the examination", minutes: 5,
    introduction: "A clear plan begins with understanding what you are preparing for.",
    paragraphs: [
      "The Civil Services Examination has three successive stages: Preliminary Examination, Main Examination and the Personality Test. Each stage asks you to use your knowledge differently. Your preparation should connect understanding, revision and practice.",
      "Use the current official notification and syllabus as your starting point. Read the eligibility conditions, examination scheme and dates yourself. Coaching notes and social media summaries are useful companions, but the official notification is the authority.",
      "Before selecting a book, open the syllabus and a previous question paper. List the subjects you recognise and those you need to explore. This turns an overwhelming ambition into specific learning tasks.",
    ],
    task: "Download the current syllabus from UPSC. Write down three subjects you will begin with and one question you want your study plan to answer.",
    source: "https://upsc.gov.in/examinations/revised-syllabus-scheme",
    sourceLabel: "Official UPSC syllabus and scheme",
  },
  {
    slug: "build-a-study-routine", title: "Build a routine you can repeat", minutes: 5,
    introduction: "Consistency grows from a realistic routine, not from an impossible timetable.",
    paragraphs: [
      "Choose a study window that fits your work, college and family commitments. Start with an amount of focused work you can repeat. A smaller completed plan teaches you more about your habits than an ambitious unfinished one.",
      "Give each session a concrete outcome: explain a concept, solve a short set of questions or revise yesterday’s notes. Keep your main source limited for each topic before adding more material.",
      "At the end of a session, close the book and recall the key ideas in your own words. Record doubts for your next revision. Leave room each week to revisit difficult topics and recover missed work.",
    ],
    task: "Plan your next three study sessions. For each, write the topic, source, time available and the result you will produce.",
  },
  {
    slug: "practice-and-review", title: "Turn practice into progress", minutes: 5,
    introduction: "A wrong answer can become a useful revision instruction.",
    paragraphs: [
      "Use previous year questions to understand how topics are tested. After studying a topic, attempt a small set of relevant questions without looking at the answers first. Read the instructions for the paper you are practising.",
      "Review why each answer was right or wrong. Separate gaps in knowledge from misreading, weak elimination and guessing. Keep a short error log with the concept to revise and the source to return to.",
      "For written answers, practise responding directly to the question, using a simple structure and relevant examples. Review clarity and relevance before adding length. This starter course is an orientation; it does not replace subject preparation or a complete test series.",
    ],
    task: "Attempt five questions from an official previous paper. Record one thing you understood well and one topic to revise next.",
    source: "https://upsc.gov.in/examinations/previous-question-papers",
    sourceLabel: "Official previous question papers",
  },
];
