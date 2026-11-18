import csv

from django.contrib import admin
from django.db.models import Sum
from django.http import HttpResponse

from . import models as m

admin.site.site_header = "UPSC RADIO administration"
admin.site.site_title = "UPSC RADIO staff"
admin.site.index_title = "Academic and admissions operations"
admin.site.index_template = "admin/radio_index.html"
original_index = admin.site.index


def index(request, extra_context=None):
    metrics = []
    for perm, label, query in [
        ("view_enrolment", "Active enrolments", lambda: m.Enrolment.objects.filter(active=True).count()),
        ("view_enquiry", "New enquiries", lambda: m.Enquiry.objects.filter(status="New").count()),
        ("view_submission", "Pending evaluations", lambda: m.Submission.objects.filter(marks__isnull=True).count()),
        ("view_payment", "Collected (INR)", lambda: f"{(m.Payment.objects.filter(status='Paid').aggregate(v=Sum('amount'))['v'] or 0) / 100:,.2f}"),
    ]:
        if request.user.has_perm(f"academy.{perm}"):
            if perm == "view_submission" and request.user.groups.filter(name="Faculty").exists() and not request.user.is_superuser:
                value = m.Submission.objects.filter(assignment__evaluator=request.user, marks__isnull=True).count()
            else:
                value = query()
            metrics.append((label, value))
    return original_index(request, {**(extra_context or {}), "metrics": metrics})


admin.site.index = index


@admin.register(m.Enquiry)
class EnquiryAdmin(admin.ModelAdmin):
    list_display = ("name", "course", "purpose", "status", "counsellor", "follow_up", "created")
    list_filter = ("status", "purpose", "source", "branch", "counsellor")
    search_fields = ("name", "email", "phone", "course__title")
    readonly_fields = ("created", "consent")
    date_hierarchy = "follow_up"


class PublishingAdmin(admin.ModelAdmin):
    list_display = ("title", "published")
    list_filter = ("published",)
    search_fields = ("title", "summary")
    prepopulated_fields = {"slug": ("title",)}


@admin.register(m.Course)
class CourseAdmin(PublishingAdmin):
    list_display = ("title", "category", "mode", "fee", "published")
    list_filter = ("published", "category", "mode")
    filter_horizontal = ("faculty",)


for model in (m.Resource, m.Branch, m.Profile, m.Notice):
    admin.site.register(model, PublishingAdmin)


@admin.register(m.Enrolment)
class EnrolmentAdmin(admin.ModelAdmin):
    list_display = ("student", "course", "batch", "active", "valid_until")
    list_filter = ("active", "course", "batch")
    search_fields = ("student__username", "student__email", "course__title")


class QuestionInline(admin.StackedInline):
    model = m.Question
    extra = 0


@admin.register(m.Test)
class TestAdmin(admin.ModelAdmin):
    inlines = [QuestionInline]
    list_display = ("title", "course", "opens", "closes", "published")
    list_filter = ("published", "course")


@admin.register(m.Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ("student", "assignment", "submitted", "marks")
    list_filter = ("assignment",)
    search_fields = ("student__username", "assignment__title")
    fields = ("student", "assignment", "answer", "download", "submitted", "marks", "feedback")
    readonly_fields = ("student", "assignment", "answer", "download", "submitted")

    def download(self, obj):
        from django.urls import reverse
        from django.utils.html import format_html

        if obj.pdf:
            return format_html('<a href="{}">Download answer PDF</a>', reverse("private_file", args=["answer", obj.pk]))
        return "No PDF attachment"

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser or request.user.groups.filter(name="Admin").exists():
            return qs
        return qs.filter(assignment__evaluator=request.user)

    def has_add_permission(self, request):
        return False


@admin.register(m.Doubt)
class DoubtAdmin(admin.ModelAdmin):
    list_display = ("title", "enrolment", "closed", "created")
    list_filter = ("closed",)
    readonly_fields = ("enrolment", "title", "question", "created")

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser or request.user.groups.filter(name="Admin").exists():
            return qs
        return qs.filter(enrolment__mentor=request.user)

    def has_add_permission(self, request):
        return False


@admin.register(m.Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("receipt", "student", "course", "rupees", "status", "created")
    list_filter = ("status", "course")
    search_fields = ("student__username", "order_id", "payment_id")
    readonly_fields = [field.name for field in m.Payment._meta.fields]
    actions = ["export"]

    @admin.action(description="Download selected payments", permissions=["view"])
    def export(self, request, queryset):
        response = HttpResponse(content_type="text/csv")
        response.headers["Content-Disposition"] = 'attachment; filename="payments.csv"'
        writer = csv.writer(response)
        writer.writerow(["Receipt", "Student ID", "Course ID", "INR", "Status"])
        for payment in queryset:
            writer.writerow([payment.receipt, payment.student_id, payment.course_id, payment.rupees, payment.status])
        return response

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


class LessonAdmin(admin.ModelAdmin):
    exclude = ("completed",)
    fields = ("module", "title", "notes", "document", "video_url", "position", "available")

    def formfield_for_dbfield(self, db_field, request, **kwargs):
        from django.forms import FileInput

        if db_field.name == "document":
            kwargs["widget"] = FileInput
        return super().formfield_for_dbfield(db_field, request, **kwargs)


admin.site.register(m.Lesson, LessonAdmin)

for model in (m.SiteSettings, m.Batch, m.Module, m.ClassMeeting, m.Attendance, m.Assignment):
    admin.site.register(model)
