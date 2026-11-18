const form = document.querySelector("#checkout");
const status = document.querySelector("#checkout-status");
const pay = document.querySelector("#pay");
pay.addEventListener("click", () => {
  if (!window.Razorpay) {
    status.textContent = "The payment provider did not load. Refresh this page and try again.";
    return;
  }
  pay.disabled = true;
  const widget = new Razorpay({
    key: form.dataset.key,
    order_id: form.dataset.order,
    amount: Number(form.dataset.amount),
    currency: "INR",
    name: "UPSC RADIO",
    modal: {ondismiss: () => { pay.disabled = false; }},
    handler: response => {
      form.elements.razorpay_payment_id.value = response.razorpay_payment_id;
      form.elements.razorpay_signature.value = response.razorpay_signature;
      status.textContent = "Verifying payment…";
      form.submit();
    }
  });
  widget.on("payment.failed", () => { status.textContent = "Payment was unsuccessful. You can try again."; });
  widget.open();
});
