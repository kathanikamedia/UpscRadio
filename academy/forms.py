from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

from .models import Branch, Course, Doubt, Enquiry, Submission


class Registration(UserCreationForm):
    email = forms.EmailField()

    class Meta(UserCreationForm.Meta):
        fields = ["username", "email"]

    def clean_email(self):
        email = self.cleaned_data["email"].lower()
        if User.objects.filter(email__iexact=email).exists():
            raise forms.ValidationError("An account already uses this email.")
        return email


class EnquiryForm(forms.ModelForm):
    consent = forms.BooleanField(label="I agree to be contacted about this request.")

    class Meta:
        model = Enquiry
        fields = ["name", "email", "phone", "purpose", "course", "mode", "branch", "consent"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["course"].queryset = Course.objects.filter(published=True)
        self.fields["branch"].queryset = Branch.objects.filter(published=True)
        if not self.fields["branch"].queryset.exists():
            self.fields["branch"].widget = forms.HiddenInput()


class AnswerForm(forms.ModelForm):
    answer = forms.CharField(widget=forms.Textarea, max_length=16000, required=False)

    class Meta:
        model = Submission
        fields = ["answer", "pdf"]

    def clean(self):
        data = super().clean()
        if not (data.get("answer") or data.get("pdf")):
            raise forms.ValidationError("Enter your answer or upload a PDF.")
        return data


class DoubtForm(forms.ModelForm):
    question = forms.CharField(widget=forms.Textarea, max_length=4000)

    class Meta:
        model = Doubt
        fields = ["title", "question"]




class AccountForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ["first_name", "last_name"]
