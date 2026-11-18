import hashlib
import hmac
import json
import os
from unittest.mock import patch

from django.contrib.auth.models import Group, User
from django.core import mail
from django.core.management import call_command
from django.test import Client, TestCase, override_settings
from django.urls import reverse
from django.utils import timezone

from . import models as m


class PlatformTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.course = m.Course.objects.create(title="Demo Polity", slug="polity", summary="Revision",
                                             category="Prelims", published=True, price_paise=250000)
        cls.student = User.objects.create_user("student", email="student@example.test", password="Local-Study-348!")
        cls.outsider = User.objects.create_user("outsider")
        cls.module = m.Module.objects.create(course=cls.course, subject="Polity")
        cls.lesson = m.Lesson.objects.create(module=cls.module, title="Parliament", available=True)
        cls.enrolment = m.Enrolment.objects.create(course=cls.course, student=cls.student)
        now = timezone.now()
        cls.test = m.Test.objects.create(course=cls.course, title="Mock", opens=now - timezone.timedelta(hours=1),
                                        closes=now + timezone.timedelta(hours=1), minutes=20, published=True)
        cls.question = m.Question.objects.create(test=cls.test, prompt="Which option?", option_a="Answer One",
                                                 option_b="Answer Two", option_c="Answer Three", option_d="Answer Four",
                                                 correct="A", marks=2, penalty="0.66", explanation="Model explanation")
        cls.assignment = m.Assignment.objects.create(course=cls.course, title="Write", prompt="Analyse the issue",
                                                     due=now + timezone.timedelta(days=1), published=True)

    def test_public_routes(self):
        call_command("setup_radio", references=True)
        for path in ["/", "/courses/", "/courses/polity/", "/test-series/", "/resources/",
                     "/resources/ncert-books/", "/books/", "/explore/about/", "/explore/faculty/",
                     "/explore/results/", "/explore/media/", "/explore/videos/", "/explore/privacy/",
                     "/admissions/", "/account/login/", "/account/register/", "/account/reset/",
                     "/sitemap.xml", "/robots.txt"]:
            with self.subTest(path=path):
                self.assertEqual(self.client.get(path).status_code, 200)
        self.assertContains(self.client.get("/courses/?q=Polity"), "Demo Polity")
        self.assertNotContains(self.client.get("/courses/?category=Ethics"), "Demo Polity")

    def test_enquiry_validation_and_csrf(self):
        values = {"name": "Applicant", "email": "a@example.test", "phone": "9990000000",
                  "purpose": "Counselling", "course": self.course.pk}
        self.assertEqual(self.client.post("/admissions/", values).status_code, 200)
        self.assertFalse(m.Enquiry.objects.exists())
        values["consent"] = "on"
        self.assertEqual(Client(enforce_csrf_checks=True).post("/admissions/", values).status_code, 403)
        response = self.client.post("/admissions/", values, follow=True)
        self.assertContains(response, "Your request has been received.")
        self.assertEqual(m.Enquiry.objects.get().course, self.course)

    def test_registration_login_and_reset(self):
        response = self.client.post("/account/register/", {
            "username": "learner", "email": "learner@example.test",
            "password1": "Private-Desk-263!", "password2": "Private-Desk-263!"
        })
        self.assertRedirects(response, "/student/")
        self.assertEqual(self.client.post("/account/logout/").status_code, 302)
        self.assertRedirects(self.client.post("/account/login/", {
            "username": "student", "password": "Local-Study-348!"
        }), "/student/")
        self.client.post("/account/reset/", {"email": self.student.email})
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("/account/reset/", mail.outbox[0].body)

    def test_course_access_and_completion(self):
        url = reverse("lesson", args=[self.lesson.pk])
        self.assertEqual(self.client.get(url).status_code, 302)
        self.client.force_login(self.outsider)
        self.assertEqual(self.client.get(url).status_code, 404)
        self.assertEqual(self.client.get(reverse("private_file", args=["lesson", self.lesson.pk])).status_code, 404)
        self.client.force_login(self.student)
        self.assertEqual(self.client.get(url).status_code, 200)
        self.client.post(url)
        self.client.post(url)
        self.assertEqual(m.Completion.objects.count(), 1)
        self.assertContains(self.client.get(reverse("learning", args=[self.course.pk])), "1 of 1 lessons completed")

    def test_exam_snapshot_and_negative_scoring(self):
        self.client.force_login(self.student)
        url = reverse("test", args=[self.test.pk])
        self.client.post(url, {"action": "start"})
        self.assertNotContains(self.client.get(url), "Model explanation")
        self.question.correct = "B"
        self.question.save()
        self.client.post(url, {"action": "submit", f"q{self.question.pk}": "B"})
        self.assertEqual(str(m.Attempt.objects.get().score), "-0.66")
        self.assertContains(self.client.get(url), "Model explanation")

    def test_expired_exam_grades_last_saved_answers(self):
        self.client.force_login(self.student)
        url = reverse("test", args=[self.test.pk])
        self.client.post(url, {"action": "start"})
        self.client.post(url, {"action": "save", f"q{self.question.pk}": "A"})
        m.Attempt.objects.update(deadline=timezone.now() - timezone.timedelta(seconds=1))
        self.client.post(url, {"action": "submit", f"q{self.question.pk}": "D"})
        self.assertEqual(str(m.Attempt.objects.get().score), "2.00")

    def test_faculty_sees_only_assigned_submissions(self):
        call_command("setup_radio")
        faculty = User.objects.create_user("faculty", is_staff=True)
        faculty.groups.add(Group.objects.get(name="Faculty"))
        self.client.force_login(self.student)
        url = reverse("assignment", args=[self.assignment.pk])
        self.assertEqual(self.client.post(url, {"answer": "An answer"}).status_code, 302)
        self.client.post(url, {"answer": "Duplicate"})
        submission = m.Submission.objects.get()
        self.assertEqual(submission.answer, "An answer")
        self.client.force_login(faculty)
        staff_url = reverse("admin:academy_submission_change", args=[submission.pk])
        self.assertEqual(self.client.get(staff_url).status_code, 302)
        self.assignment.evaluator = faculty
        self.assignment.save()
        self.assertEqual(self.client.get(staff_url).status_code, 200)
        self.assertEqual(self.client.get(reverse("admin:academy_enquiry_changelist")).status_code, 403)
        self.assertEqual(self.client.get("/staff/").status_code, 200)

    @patch.dict(os.environ, {"RAZORPAY_KEY_ID": "rzp_test_example", "RAZORPAY_KEY_SECRET": "key",
                             "RAZORPAY_WEBHOOK_SECRET": "webhook"})
    @patch("academy.payments.gateway")
    def test_checkout_verification_and_replayed_webhook(self, gateway):
        self.client.force_login(self.outsider)
        create_url = reverse("checkout", args=[self.course.slug])
        gateway.return_value = {"id": "order_example"}
        self.assertContains(self.client.post(create_url), "Razorpay test mode")
        self.assertContains(self.client.post(create_url), "Razorpay test mode")
        self.assertEqual(gateway.call_count, 1)
        payment = m.Payment.objects.get()
        verify_url = reverse("verify", args=[payment.receipt])
        values = {"razorpay_payment_id": "pay_example", "razorpay_signature": "incorrect"}
        self.assertEqual(self.client.post(verify_url, values).status_code, 400)
        values["razorpay_signature"] = hmac.new(b"key", b"order_example|pay_example", hashlib.sha256).hexdigest()
        event = {"id": "pay_example", "order_id": "order_example", "status": "captured",
                 "currency": "INR", "amount": payment.amount}
        gateway.return_value = {**event, "amount": 1}
        self.assertEqual(self.client.post(verify_url, values).status_code, 409)
        gateway.return_value = event
        self.assertRedirects(self.client.post(verify_url, values), reverse("receipt", args=[payment.receipt]))
        body = json.dumps({"event": "payment.captured", "payload": {"payment": {"entity": event}}}).encode()
        signature = hmac.new(b"webhook", body, hashlib.sha256).hexdigest()
        for _ in range(2):
            self.assertEqual(self.client.post("/payments/webhook/", body, content_type="application/json",
                                              HTTP_X_RAZORPAY_SIGNATURE=signature).status_code, 204)
        self.assertEqual(m.Payment.objects.filter(status="Paid").count(), 1)
        self.assertEqual(m.Enrolment.objects.filter(student=self.outsider, course=self.course).count(), 1)
