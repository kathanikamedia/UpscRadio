from uuid import uuid4

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator, MinValueValidator, RegexValidator
from django.db import models
from django.db.models import Q

User = settings.AUTH_USER_MODEL


def private_name(instance, filename):
    return f"documents/{uuid4().hex}.pdf"


def validate_pdf(value):
    if value.size > 8 * 1024 * 1024 or value.read(5) != b"%PDF-":
        raise ValidationError("Upload a PDF no larger than 8 MB.")
    value.seek(0)


def pdf_field(blank=False):
    return models.FileField(upload_to=private_name, blank=blank,
                            validators=[FileExtensionValidator(["pdf"]), validate_pdf])


class Published(models.Model):
    title = models.CharField(max_length=180)
    slug = models.SlugField(unique=True)
    summary = models.CharField(max_length=250)
    body = models.TextField(blank=True)
    published = models.BooleanField(default=False, db_index=True)

    class Meta:
        abstract = True
        ordering = ["title"]

    def __str__(self):
        return self.title


class Course(Published):
    CATEGORIES = ["UPSC Foundation", "GS Foundation", "Prelims", "Mains", "CSAT", "Optional Subjects",
                  "Essay", "Ethics", "Interview Guidance", "Integrated Prelims and Mains", "Test Series",
                  "Current Affairs", "Crash Courses", "Study Materials", "Private Coaching"]
    category = models.CharField(max_length=50, choices=[(c, c) for c in CATEGORIES])
    mode = models.CharField(max_length=20, blank=True, choices=[(m, m) for m in ["Online", "Classroom", "Hybrid"]])
    language = models.CharField(max_length=80, blank=True)
    duration = models.CharField(max_length=80, blank=True)
    syllabus = models.TextField(blank=True)
    inclusions = models.TextField(blank=True)
    price_paise = models.PositiveIntegerField(null=True, blank=True, validators=[MinValueValidator(100)])
    cover = models.URLField(blank=True)
    faculty = models.ManyToManyField("Profile", blank=True, limit_choices_to={"kind": "Faculty"})

    @property
    def fee(self):
        return f"{self.price_paise / 100:,.2f}" if self.price_paise else ""


class Resource(Published):
    CATEGORIES = ["Current Affairs", "Editorials", "Quizzes", "Prelims MCQs", "Mains Practice", "Previous Papers",
                  "Syllabus", "NCERT", "Study Plans", "Articles", "Books", "Videos", "Official News"]
    category = models.CharField(max_length=40, choices=[(c, c) for c in CATEGORIES])
    url = models.URLField(blank=True)
    document = pdf_field(blank=True)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created"]


class Profile(Published):
    kind = models.CharField(max_length=16, choices=[(k, k) for k in ["Faculty", "Result", "Testimonial", "Recognition"]])
    image = models.URLField(blank=True)
    year = models.PositiveSmallIntegerField(null=True, blank=True)


class Notice(Published):
    starts = models.DateTimeField()
    ends = models.DateTimeField(null=True, blank=True)


class Branch(Published):
    address = models.TextField()
    map_url = models.URLField(blank=True)


class SiteSettings(models.Model):
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=30, blank=True)
    whatsapp_number = models.CharField(max_length=20, blank=True, validators=[RegexValidator(r"^[0-9]{8,15}$")])
    hero_title = models.CharField(max_length=140, default="Your preparation. With purpose.")
    hero_summary = models.CharField(max_length=250, default="Explore courses, study resources and conversations for every stage of the UPSC Civil Services Examination.")
    about = models.TextField(blank=True)
    privacy = models.TextField(blank=True)
    trending_playlist = models.CharField(max_length=100, blank=True, validators=[RegexValidator(r"^[A-Za-z0-9_-]+$")])

    class Meta:
        verbose_name_plural = "Site settings"


class Batch(models.Model):
    course = models.ForeignKey(Course, on_delete=models.PROTECT, related_name="batches")
    name = models.CharField(max_length=100)
    starts = models.DateField()
    ends = models.DateField()
    schedule = models.CharField(max_length=180, blank=True)
    accepting = models.BooleanField(default=False)
    faculty = models.ManyToManyField(User, blank=True, related_name="teaching_batches")
    branch = models.ForeignKey(Branch, null=True, blank=True, on_delete=models.PROTECT)

    def __str__(self):
        return f"{self.course} | {self.name}"


class Enquiry(models.Model):
    STATUSES = ["New", "Contacted", "Interested", "Counselling Scheduled", "Converted", "Not Interested"]
    PURPOSES = ["Counselling", "Demo class", "Admission"]
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=18, validators=[RegexValidator(r"^\+?[0-9][0-9 ()-]{7,16}$")])
    course = models.ForeignKey(Course, null=True, blank=True, on_delete=models.SET_NULL)
    branch = models.ForeignKey(Branch, null=True, blank=True, on_delete=models.SET_NULL)
    purpose = models.CharField(max_length=24, choices=[(p, p) for p in PURPOSES])
    mode = models.CharField(max_length=20, choices=Course._meta.get_field("mode").choices, blank=True)
    source = models.CharField(max_length=80, default="Website")
    status = models.CharField(max_length=24, choices=[(s, s) for s in STATUSES], default="New", db_index=True)
    counsellor = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    follow_up = models.DateField(null=True, blank=True, db_index=True)
    notes = models.TextField(blank=True)
    created = models.DateTimeField(auto_now_add=True)
    consent = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class Enrolment(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.PROTECT)
    batch = models.ForeignKey(Batch, null=True, blank=True, on_delete=models.PROTECT)
    active = models.BooleanField(default=True)
    valid_until = models.DateField(null=True, blank=True)
    created = models.DateTimeField(auto_now_add=True)
    mentor = models.ForeignKey(User, null=True, blank=True, related_name="mentees", on_delete=models.SET_NULL)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["student", "course"], name="unique_enrolment")]

    def clean(self):
        if self.batch_id and self.batch.course_id != self.course_id:
            raise ValidationError({"batch": "Choose a batch belonging to this course."})

    def __str__(self):
        return f"{self.student} | {self.course}"


class Module(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    subject = models.CharField(max_length=100)
    position = models.PositiveSmallIntegerField(default=1)

    class Meta:
        ordering = ["position", "pk"]

    def __str__(self):
        return f"{self.course} | {self.subject}"


class Lesson(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE)
    title = models.CharField(max_length=160)
    notes = models.TextField(blank=True)
    document = pdf_field(blank=True)
    video_url = models.URLField(blank=True, help_text="Use a provider URL that enforces access for enrolled students.")
    position = models.PositiveSmallIntegerField(default=1)
    available = models.BooleanField(default=False)
    completed = models.ManyToManyField(User, through="Completion", blank=True)

    class Meta:
        ordering = ["module__position", "position", "pk"]

    def __str__(self):
        return self.title


class Completion(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["lesson", "student"], name="one_completion")]


class ClassMeeting(models.Model):
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE)
    title = models.CharField(max_length=160)
    starts = models.DateTimeField(db_index=True)
    join_url = models.URLField(blank=True)

    class Meta:
        ordering = ["starts"]

    def __str__(self):
        return self.title


class Attendance(models.Model):
    meeting = models.ForeignKey(ClassMeeting, on_delete=models.CASCADE)
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    present = models.BooleanField(default=False)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["meeting", "student"], name="one_attendance")]


class Test(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    title = models.CharField(max_length=160)
    opens = models.DateTimeField()
    closes = models.DateTimeField()
    minutes = models.PositiveSmallIntegerField(validators=[MinValueValidator(1)])
    published = models.BooleanField(default=False)

    class Meta:
        constraints = [models.CheckConstraint(condition=Q(closes__gt=models.F("opens")), name="test_dates_order")]

    def __str__(self):
        return self.title


class Question(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name="questions")
    section = models.CharField(max_length=80, blank=True)
    prompt = models.TextField()
    option_a = models.CharField(max_length=300)
    option_b = models.CharField(max_length=300)
    option_c = models.CharField(max_length=300)
    option_d = models.CharField(max_length=300)
    correct = models.CharField(max_length=1, choices=[(s, s) for s in "ABCD"])
    marks = models.DecimalField(max_digits=6, decimal_places=2, default=2, validators=[MinValueValidator(0)])
    penalty = models.DecimalField(max_digits=6, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    explanation = models.TextField(blank=True)


class Attempt(models.Model):
    test = models.ForeignKey(Test, on_delete=models.PROTECT)
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    started = models.DateTimeField(auto_now_add=True)
    deadline = models.DateTimeField()
    submitted = models.DateTimeField(null=True)
    snapshot = models.JSONField()
    answers = models.JSONField(default=dict)
    review = models.JSONField(default=list)
    score = models.DecimalField(null=True, max_digits=9, decimal_places=2)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["test", "student"], name="one_attempt")]


class Assignment(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    title = models.CharField(max_length=160)
    prompt = models.TextField()
    due = models.DateTimeField()
    evaluator = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    published = models.BooleanField(default=False)

    def __str__(self):
        return self.title


class Submission(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.PROTECT)
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    answer = models.TextField(blank=True)
    pdf = pdf_field(blank=True)
    submitted = models.DateTimeField(auto_now_add=True)
    marks = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)])
    feedback = models.TextField(blank=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["assignment", "student"], name="one_submission")]


class Doubt(models.Model):
    enrolment = models.ForeignKey(Enrolment, on_delete=models.CASCADE)
    title = models.CharField(max_length=160)
    question = models.TextField()
    reply = models.TextField(blank=True)
    closed = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Payment(models.Model):
    student = models.ForeignKey(User, on_delete=models.PROTECT)
    course = models.ForeignKey(Course, on_delete=models.PROTECT)
    amount = models.PositiveIntegerField()
    receipt = models.UUIDField(default=uuid4, unique=True)
    order_id = models.CharField(max_length=80, null=True, unique=True)
    payment_id = models.CharField(max_length=80, null=True, unique=True)
    status = models.CharField(max_length=12, default="Creating", db_index=True)
    created = models.DateTimeField(auto_now_add=True)
    captured = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["student", "course"],
                                               condition=Q(status__in=["Creating", "Pending", "Paid"]),
                                               name="one_checkout")]

    @property
    def rupees(self):
        return f"{self.amount / 100:,.2f}"
