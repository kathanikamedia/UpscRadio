import os
from decimal import Decimal
from functools import wraps

from django.conf import settings
from django.contrib import messages
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db import transaction
from django.db.models import Q
from django.http import FileResponse, Http404, HttpResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.utils import timezone
from django.views.decorators.cache import never_cache

from . import forms, models as m


def site_context(request):
    return {"site": m.SiteSettings.objects.first() or m.SiteSettings(),
            "site_url": settings.SITE_URL, "canonical": settings.SITE_URL + request.path}


def home(request):
    news = m.Resource.objects.filter(published=True, category="Official News").exclude(
        slug="official-upsc-notices").order_by("-created", "-pk")[:3]
    return render(request, "home.html", {"news": news})


def library(request, kind):
    courses = kind in {"courses", "tests"}
    model = m.Course if courses else m.Resource
    queryset = model.objects.filter(published=True)
    categories = model.CATEGORIES
    if kind == "tests":
        categories = ["Test Series"]
        queryset = queryset.filter(category="Test Series")
    if kind == "books":
        categories = ["Books"]
        queryset = queryset.filter(category="Books")
    query = request.GET.get("q", "").strip()[:100]
    category = request.GET.get("category", "")
    sort = request.GET.get("sort", "")
    if query:
        queryset = queryset.filter(Q(title__icontains=query) | Q(summary__icontains=query))
    if category in categories:
        queryset = queryset.filter(category=category)
    if sort == "title":
        queryset = queryset.order_by("title", "pk")
    elif sort == "new":
        queryset = queryset.order_by("-pk")
    page = Paginator(queryset, 9).get_page(request.GET.get("page"))
    title = {"courses": "Explore courses", "tests": "Mock Test", "resources": "Study Materials",
             "books": "Books and study materials"}[kind]
    return render(request, "library.html", {"page": page, "title": title, "kind": kind, "categories": categories,
                                             "query": query, "category": category, "sort": sort, "courses": courses})


def detail(request, slug, kind):
    model = {"course": m.Course, "resource": m.Resource, "profile": m.Profile}[kind]
    item = get_object_or_404(model, slug=slug, published=True)
    context = {"item": item, "title": item.title, "kind": kind, "description": item.summary}
    if kind == "course":
        context.update(faculty=item.faculty.filter(published=True),
                       batches=item.batches.filter(starts__gte=timezone.localdate(), accepting=True).order_by("starts"),
                       checkout=bool(item.price_paise and all(os.getenv(k) for k in (
                           "RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "RAZORPAY_WEBHOOK_SECRET"))))
    return render(request, "detail.html", context)


def section(request, section):
    titles = {"about": "About UPSC RADIO", "faculty": "Faculty", "results": "Results and achievements",
              "media": "Media and recognition", "privacy": "Privacy", "videos": "Watch UPSC RADIO"}
    if section not in titles:
        raise Http404
    kind = {"faculty": "Faculty", "results": "Result", "media": "Recognition"}.get(section)
    items = m.Profile.objects.filter(published=True, kind=kind)
    query = request.GET.get("q", "").strip()[:100]
    year = request.GET.get("year", "")
    years = sorted(set(items.exclude(year=None).values_list("year", flat=True)), reverse=True)
    if query:
        items = items.filter(title__icontains=query)
    if year.isdecimal() and len(year) == 4:
        items = items.filter(year=int(year))
    return render(request, "section.html", {"section": section, "items": items, "title": titles[section],
                                             "query": query, "year": year, "years": years,
                                             "videos": m.Resource.objects.filter(published=True, category="Videos")})


def limit(scope, maximum=8):
    def decorate(view):
        @wraps(view)
        def inner(request, *args, **kwargs):
            if request.method == "POST":
                now = int(timezone.now().timestamp())
                recent = [stamp for stamp in request.session.get(scope, []) if now - stamp < 900]
                if len(recent) >= maximum:
                    return HttpResponse("Too many requests. Please try again in 15 minutes.", status=429)
                request.session[scope] = recent + [now]
            return view(request, *args, **kwargs)
        return inner
    return decorate


@limit("enquiry", 5)
def admissions(request):
    initial = {"purpose": request.GET.get("purpose", "Counselling")}
    initial["course"] = m.Course.objects.filter(slug=request.GET.get("course"), published=True).first()
    form = forms.EnquiryForm(request.POST if request.method == "POST" else None, initial=initial)
    if request.method == "POST" and form.is_valid():
        form.save()
        messages.success(request, "Your request has been received.")
        return redirect("admissions")
    return render(request, "admissions.html", {"title": "Admissions and counselling", "form": form,
                                                  "branches": m.Branch.objects.filter(published=True)})


@limit("register", 5)
def register(request):
    if request.user.is_authenticated:
        return redirect("student")
    form = forms.Registration(request.POST if request.method == "POST" else None)
    if request.method == "POST" and form.is_valid():
        login(request, form.save())
        return redirect("student")
    return render(request, "form.html", {"title": "Create a student account", "form": form, "action": "Create account"})


def private(view):
    return never_cache(login_required(view))


def enrolments(user):
    today = timezone.localdate()
    return m.Enrolment.objects.filter(student=user, active=True).filter(
        Q(valid_until__isnull=True) | Q(valid_until__gte=today))


def require_course(request, course_id):
    return get_object_or_404(enrolments(request.user), course_id=course_id)


@private
def student(request):
    enrolled = enrolments(request.user).select_related("course", "batch", "mentor")
    courses = enrolled.values("course_id")
    batches = enrolled.exclude(batch=None).values("batch_id")
    attendance = m.Attendance.objects.filter(student=request.user, meeting__batch_id__in=batches)
    total = attendance.count()
    now = timezone.now()
    return render(request, "student.html", {
        "title": "Student dashboard", "enrolled": enrolled,
        "meetings": m.ClassMeeting.objects.filter(batch_id__in=batches, starts__gte=now)[:12],
        "tests": m.Test.objects.filter(course_id__in=courses, published=True, closes__gte=now).order_by("opens"),
        "attempts": m.Attempt.objects.filter(student=request.user, test__course_id__in=courses).select_related("test"),
        "assignments": m.Assignment.objects.filter(course_id__in=courses, published=True).order_by("due"),
        "payments": m.Payment.objects.filter(student=request.user).select_related("course").order_by("-created"),
        "attendance": round(100 * attendance.filter(present=True).count() / total) if total else None,
        "notices": m.Notice.objects.filter(published=True, starts__lte=now).filter(
            Q(ends__isnull=True) | Q(ends__gte=now)).order_by("-starts")[:5]
    })


@private
def learning(request, pk):
    enrolment = require_course(request, pk)
    lessons = m.Lesson.objects.filter(module__course_id=pk, available=True).select_related("module")
    completed = set(m.Completion.objects.filter(student=request.user, lesson__in=lessons).values_list("lesson_id", flat=True))
    form = forms.DoubtForm(request.POST if request.method == "POST" else None)
    if request.method == "POST" and form.is_valid():
        doubt = form.save(commit=False)
        doubt.enrolment = enrolment
        doubt.save()
        messages.success(request, "Your academic support request was saved.")
        return redirect("learning", pk=pk)
    return render(request, "learning.html", {"title": enrolment.course.title, "enrolment": enrolment,
                                               "lessons": lessons, "completed": completed, "form": form,
                                               "doubts": m.Doubt.objects.filter(enrolment=enrolment).order_by("-created")})


@private
def lesson(request, pk):
    item = get_object_or_404(m.Lesson.objects.select_related("module"), pk=pk, available=True)
    require_course(request, item.module.course_id)
    if request.method == "POST":
        m.Completion.objects.get_or_create(student=request.user, lesson=item)
        return redirect("learning", pk=item.module.course_id)
    return render(request, "lesson.html", {"title": item.title, "item": item})


def attachment(pdf):
    if not pdf:
        raise Http404
    try:
        return FileResponse(pdf.open("rb"), as_attachment=True, filename="study-document.pdf",
                            content_type="application/pdf")
    except FileNotFoundError as exc:
        raise Http404 from exc


@private
def private_file(request, kind, pk):
    if kind == "lesson":
        item = get_object_or_404(m.Lesson.objects.select_related("module"), pk=pk, available=True)
        require_course(request, item.module.course_id)
        return attachment(item.document)
    if kind == "answer":
        item = get_object_or_404(m.Submission.objects.select_related("assignment"), pk=pk)
        allowed = item.student_id == request.user.pk or (
            request.user.has_perm("academy.view_submission") and
            (request.user.is_superuser or request.user.groups.filter(name="Admin").exists() or
             item.assignment.evaluator_id == request.user.pk))
        if allowed:
            return attachment(item.pdf)
    raise Http404


def resource_file(request, pk):
    return attachment(get_object_or_404(m.Resource, pk=pk, published=True).document)


@private
def assignment(request, pk):
    item = get_object_or_404(m.Assignment, pk=pk, published=True)
    require_course(request, item.course_id)
    submitted = m.Submission.objects.filter(assignment=item, student=request.user).first()
    closed = timezone.now() >= item.due
    form = forms.AnswerForm(request.POST if request.method == "POST" else None, request.FILES)
    if request.method == "POST" and not closed and not submitted and form.is_valid():
        with transaction.atomic():
            m.Assignment.objects.select_for_update().get(pk=pk)
            if timezone.now() < item.due and not m.Submission.objects.filter(assignment=item, student=request.user).exists():
                answer = form.save(commit=False)
                answer.assignment, answer.student = item, request.user
                answer.save()
                messages.success(request, "Your answer was submitted.")
        return redirect("assignment", pk=pk)
    return render(request, "assignment.html", {"title": item.title, "item": item, "submitted": submitted,
                                                 "closed": closed, "form": form})


@private
def test(request, pk):
    item = get_object_or_404(m.Test, pk=pk, published=True)
    require_course(request, item.course_id)
    now = timezone.now()
    with transaction.atomic():
        attempt = m.Attempt.objects.select_for_update().filter(test=item, student=request.user).first()
        if not attempt and request.method == "POST" and request.POST.get("action") == "start" and item.opens <= now < item.closes:
            questions = [{"id": str(q.pk), "section": q.section, "prompt": q.prompt,
                          "options": [(letter, getattr(q, f"option_{letter.lower()}")) for letter in "ABCD"],
                          "correct": q.correct, "marks": str(q.marks), "penalty": str(q.penalty),
                          "explanation": q.explanation} for q in item.questions.order_by("pk")]
            if questions:
                m.Attempt.objects.get_or_create(test=item, student=request.user, defaults={
                    "snapshot": questions, "deadline": min(item.closes, now + timezone.timedelta(minutes=item.minutes))})
                return redirect("test", pk=pk)
        if attempt and not attempt.submitted:
            now = timezone.now()
            action = request.POST.get("action") if request.method == "POST" else ""
            if now < attempt.deadline and action in {"save", "submit"}:
                attempt.answers = {
                    q["id"]: request.POST[f"q{q['id']}"] for q in attempt.snapshot
                    if request.POST.get(f"q{q['id']}") in {"A", "B", "C", "D"}
                }
                attempt.review = [q["id"] for q in attempt.snapshot if f"r{q['id']}" in request.POST]
                attempt.save(update_fields=["answers", "review"])
            if action == "submit" or now >= attempt.deadline:
                attempt.score = sum((Decimal(q["marks"]) if attempt.answers[q["id"]] == q["correct"]
                                     else -Decimal(q["penalty"])) for q in attempt.snapshot if q["id"] in attempt.answers)
                attempt.submitted = now
                attempt.save(update_fields=["score", "submitted"])
            if request.method == "POST":
                return redirect("test", pk=pk)
    questions = []
    if attempt:
        for q in attempt.snapshot:
            question = {key: q[key] for key in ("id", "section", "prompt", "options")}
            question.update(selected=attempt.answers.get(q["id"]), review=q["id"] in attempt.review)
            if attempt.submitted:
                question.update(correct=q["correct"], explanation=q["explanation"])
            questions.append(question)
    return render(request, "test.html", {"title": item.title, "item": item, "attempt": attempt,
                                           "questions": questions, "open": item.opens <= now < item.closes})


@private
def receipt(request, pk):
    payment = get_object_or_404(m.Payment, receipt=pk, student=request.user, status="Paid")
    return render(request, "receipt.html", {"title": "Payment receipt", "payment": payment})


def robots(request):
    lines = ["User-agent: *", "Disallow: /staff/", "Disallow: /student/", "Disallow: /account/"]
    if settings.SITE_URL:
        lines.append(f"Sitemap: {settings.SITE_URL}/sitemap.xml")
    return HttpResponse("\n".join(lines), content_type="text/plain")


def sitemap(request):
    from xml.etree.ElementTree import Element, SubElement, tostring

    root = Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")
    paths = [reverse(name) for name in ("home", "courses", "resources", "tests", "books", "admissions")]
    paths += [reverse("section", args=[name]) for name in ("about", "faculty", "results", "media", "videos")]
    for model, name in [(m.Course, "course"), (m.Resource, "resource"), (m.Profile, "profile")]:
        paths += [reverse(name, args=[slug]) for slug in model.objects.filter(published=True).values_list("slug", flat=True)]
    for path in paths:
        SubElement(SubElement(root, "url"), "loc").text = (settings.SITE_URL or request.build_absolute_uri("/").rstrip("/")) + path
    return HttpResponse(tostring(root, encoding="utf-8", xml_declaration=True), content_type="application/xml")

@private
def account(request):
    form = forms.AccountForm(request.POST or None, instance=request.user)
    if request.method == "POST" and form.is_valid():
        form.save()
        messages.success(request, "Your account details were updated.")
        return redirect("account")
    return render(request, "form.html", {"title": "Account settings", "form": form, "action": "Save changes"})
