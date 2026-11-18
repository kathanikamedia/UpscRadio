from django.contrib.auth.models import Group, Permission
from django.core.management.base import BaseCommand

from academy.models import Course, Resource, SiteSettings


class Command(BaseCommand):
    help = "Create staff groups and optionally load approved public reference links or development catalogue examples."

    def add_arguments(self, parser):
        parser.add_argument("--references", action="store_true")
        parser.add_argument("--demo", action="store_true")

    def handle(self, *args, **options):
        permissions = Permission.objects.filter(content_type__app_label="academy")
        definitions = {
            "Admin": list(permissions.values_list("codename", flat=True)),
            "Admission Counsellor": ["view_enquiry", "change_enquiry", "add_enquiry", "view_course", "view_branch"],
            "Faculty": ["view_submission", "change_submission", "view_doubt", "change_doubt"],
            "Student": [],
        }
        for role, codenames in definitions.items():
            group, _ = Group.objects.get_or_create(name=role)
            group.permissions.set(permissions.filter(codename__in=codenames))
        if not SiteSettings.objects.exists():
            SiteSettings.objects.create()
        if options["references"]:
            references = [
                ("previous-year-papers", "UPSC previous year question papers", "Previous Papers",
                 "Official question papers across examinations and years.", "https://upsc.gov.in/examinations/previous-question-papers"),
                ("official-upsc-notices", "UPSC notices and updates", "Official News",
                 "Read examination announcements from the Commission.", "https://upsc.gov.in/whats-new"),
                ("ncert-books", "NCERT textbook library", "Books",
                 "Access the official NCERT textbooks by class and subject.", "https://ncert.nic.in/textbook.php"),
            ]
            for slug, title, category, summary, url in references:
                Resource.objects.get_or_create(slug=slug, defaults={
                    "title": title, "category": category, "summary": summary, "url": url, "published": True})
        if options["demo"]:
            for category in Course.CATEGORIES:
                Course.objects.get_or_create(slug="example-" + category.lower().replace(" ", "-"), defaults={
                    "title": "Demo: " + category,
                    "summary": f"Example catalogue entry for {category.lower()}. Programme details are pending approval.",
                    "category": category,
                    "body": "This example shows how a programme will appear once the institute supplies its details.",
                    "published": True,
                })
