import base64
import hashlib
import hmac
import json
import os
from urllib.request import Request, urlopen

from django.contrib.auth import get_user_model
from django.db import transaction
from django.http import Http404, HttpResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from .models import Course, Enrolment, Payment
from .views import limit, private


def signed(secret, payload, signature):
    expected = hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected.encode(), signature.encode())


def gateway(path, data=None):
    credentials = f"{os.environ['RAZORPAY_KEY_ID']}:{os.environ['RAZORPAY_KEY_SECRET']}"
    auth = base64.b64encode(credentials.encode()).decode()
    request = Request(f"https://api.razorpay.com/v1/{path}",
                      data=json.dumps(data).encode() if data is not None else None,
                      headers={"Authorization": f"Basic {auth}", "Content-Type": "application/json"})
    with urlopen(request, timeout=10) as response:
        return json.load(response)


@transaction.atomic
def capture(order, event):
    payment = Payment.objects.select_for_update().filter(order_id=order).first()
    if not payment or not order or not event.get("id"):
        return False
    if (event.get("order_id") != order or event.get("status") != "captured"
            or event.get("currency") != "INR" or event.get("amount") != payment.amount):
        return False
    if payment.status == "Paid":
        return payment.payment_id == event["id"]
    payment.payment_id, payment.status, payment.captured = event["id"], "Paid", timezone.now()
    payment.save(update_fields=["payment_id", "status", "captured"])
    Enrolment.objects.get_or_create(student=payment.student, course=payment.course)
    return True


@private
@require_POST
@limit("checkout", 6)
def checkout(request, slug):
    course = get_object_or_404(Course, slug=slug, published=True)
    if not course.price_paise or not all(os.getenv(k) for k in (
            "RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "RAZORPAY_WEBHOOK_SECRET")):
        raise Http404
    with transaction.atomic():
        get_user_model().objects.select_for_update().get(pk=request.user.pk)
        if Enrolment.objects.filter(student=request.user, course=course).exists():
            return redirect("student")
        payment, created = Payment.objects.filter(status__in=["Creating", "Pending", "Paid"]).get_or_create(
            student=request.user, course=course, defaults={"amount": course.price_paise})
    if created:
        try:
            order = gateway("orders", {"amount": payment.amount, "currency": "INR", "receipt": payment.receipt.hex})
        except (OSError, ValueError):
            return HttpResponse("The payment provider could not confirm the order. Contact admissions before retrying.", status=503)
        payment.order_id, payment.status = order["id"], "Pending"
        payment.save(update_fields=["order_id", "status"])
    if payment.status != "Pending":
        return HttpResponse("An existing checkout is awaiting confirmation. Contact admissions for help.", status=409)
    return render(request, "checkout.html", {"title": "Secure checkout", "payment": payment,
                                              "key_id": os.environ["RAZORPAY_KEY_ID"]})


@private
@require_POST
def verify(request, pk):
    payment = get_object_or_404(Payment, receipt=pk, student=request.user, order_id__isnull=False)
    secret = os.getenv("RAZORPAY_KEY_SECRET")
    payment_id = request.POST.get("razorpay_payment_id", "")
    signature = request.POST.get("razorpay_signature", "")
    if not secret or not payment_id.isascii() or not payment_id.replace("_", "").isalnum() or len(payment_id) > 80:
        return HttpResponse("Invalid payment reference.", status=400)
    if not signed(secret, f"{payment.order_id}|{payment_id}".encode(), signature):
        return HttpResponse("Invalid payment signature.", status=400)
    try:
        event = gateway(f"payments/{payment_id}")
    except (OSError, ValueError):
        return HttpResponse("Payment confirmation is pending. Check your student account shortly.", status=503)
    if event.get("id") != payment_id or not capture(payment.order_id, event):
        return HttpResponse("Payment confirmation is pending. Check your student account shortly.", status=409)
    return redirect("receipt", pk=pk)


@csrf_exempt
@require_POST
def webhook(request):
    secret = os.getenv("RAZORPAY_WEBHOOK_SECRET")
    if not secret or not signed(secret, request.body, request.headers.get("X-Razorpay-Signature", "")):
        return HttpResponse(status=403)
    try:
        event = json.loads(request.body)
        if event["event"] == "payment.captured":
            entity = event["payload"]["payment"]["entity"]
            if not capture(entity["order_id"], entity):
                return HttpResponse(status=409)
    except (ValueError, KeyError, TypeError):
        return HttpResponse(status=400)
    return HttpResponse(status=204)
