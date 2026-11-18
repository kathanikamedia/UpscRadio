from django.contrib import admin
from django.contrib.auth import views as auth
from django.urls import path

from academy import payments, views

urlpatterns = [
    path("", views.home, name="home"),
    path("courses/", views.library, {"kind": "courses"}, name="courses"),
    path("courses/<slug:slug>/", views.detail, {"kind": "course"}, name="course"),
    path("resources/", views.library, {"kind": "resources"}, name="resources"),
    path("resources/<slug:slug>/", views.detail, {"kind": "resource"}, name="resource"),
    path("downloads/<int:pk>/", views.resource_file, name="resource_file"),
    path("test-series/", views.library, {"kind": "tests"}, name="tests"),
    path("books/", views.library, {"kind": "books"}, name="books"),
    path("people/<slug:slug>/", views.detail, {"kind": "profile"}, name="profile"),
    path("explore/<slug:section>/", views.section, name="section"),
    path("admissions/", views.admissions, name="admissions"),
    path("student/", views.student, name="student"),
    path("student/course/<int:pk>/", views.learning, name="learning"),
    path("student/lesson/<int:pk>/", views.lesson, name="lesson"),
    path("student/test/<int:pk>/", views.test, name="test"),
    path("student/assignment/<int:pk>/", views.assignment, name="assignment"),
    path("student/file/<str:kind>/<int:pk>/", views.private_file, name="private_file"),
    path("student/receipt/<uuid:pk>/", views.receipt, name="receipt"),
    path("payments/checkout/<slug:slug>/", payments.checkout, name="checkout"),
    path("payments/verify/<uuid:pk>/", payments.verify, name="verify"),
    path("payments/webhook/", payments.webhook),
    path("account/settings/", views.account, name="account"),
    path("account/login/", views.limit("login")(auth.LoginView.as_view()), name="login"),
    path("account/logout/", auth.LogoutView.as_view(), name="logout"),
    path("account/register/", views.register, name="register"),
    path("account/reset/", views.limit("reset", 5)(auth.PasswordResetView.as_view()), name="password_reset"),
    path("account/reset/sent/", auth.PasswordResetDoneView.as_view(), name="password_reset_done"),
    path("account/reset/<uidb64>/<token>/", auth.PasswordResetConfirmView.as_view(), name="password_reset_confirm"),
    path("account/reset/complete/", auth.PasswordResetCompleteView.as_view(), name="password_reset_complete"),
    path("staff/", admin.site.urls),
    path("robots.txt", views.robots),
    path("sitemap.xml", views.sitemap),
]
