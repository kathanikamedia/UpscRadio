from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent
DEBUG = os.getenv("RADIO_PRODUCTION") != "1"
SECRET_KEY = "django-insecure-local-preview-only" if DEBUG else os.environ["RADIO_SECRET_KEY"]
ALLOWED_HOSTS = ["localhost", "127.0.0.1", "[::1]"] if DEBUG else os.environ["RADIO_HOSTS"].split(",")
SITE_URL = os.getenv("RADIO_URL", "").rstrip("/")
ROOT_URLCONF = "radio.urls"
INSTALLED_APPS = ["django.contrib.admin", "django.contrib.auth", "django.contrib.contenttypes",
                  "django.contrib.sessions", "django.contrib.messages", "django.contrib.staticfiles", "academy"]
MIDDLEWARE = ["django.middleware.security.SecurityMiddleware", "django.contrib.sessions.middleware.SessionMiddleware",
              "django.middleware.common.CommonMiddleware", "django.middleware.csrf.CsrfViewMiddleware",
              "django.contrib.auth.middleware.AuthenticationMiddleware", "django.contrib.messages.middleware.MessageMiddleware",
              "django.middleware.clickjacking.XFrameOptionsMiddleware"]
TEMPLATES = [{"BACKEND": "django.template.backends.django.DjangoTemplates", "DIRS": [BASE_DIR / "academy" / "templates"], "APP_DIRS": True,
              "OPTIONS": {"context_processors": ["django.template.context_processors.request",
                          "django.contrib.auth.context_processors.auth", "django.contrib.messages.context_processors.messages",
                          "academy.views.site_context"]}}]
DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": BASE_DIR / "db.sqlite3"}}
if not DEBUG or os.getenv("PGDATABASE"):
    DATABASES["default"] = {"ENGINE": "django.db.backends.postgresql", "NAME": os.environ["PGDATABASE"],
                            "HOST": os.getenv("PGHOST", "localhost"), "PORT": os.getenv("PGPORT", "5432"),
                            "USER": os.environ["PGUSER"], "PASSWORD": os.environ["PGPASSWORD"],
                            "OPTIONS": {"sslmode": os.getenv("PGSSLMODE", "require")}}
AUTH_PASSWORD_VALIDATORS = [{"NAME": f"django.contrib.auth.password_validation.{name}"} for name in
                            ("UserAttributeSimilarityValidator", "MinimumLengthValidator",
                             "CommonPasswordValidator", "NumericPasswordValidator")]
LOGIN_URL = "/account/login/"
LOGIN_REDIRECT_URL = "/student/"
LOGOUT_REDIRECT_URL = "/"
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "collected"
MEDIA_ROOT = BASE_DIR / "private"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
TIME_ZONE = "Asia/Kolkata"
USE_TZ = True
EMAIL_BACKEND = ("django.core.mail.backends.console.EmailBackend" if DEBUG else
                 "django.core.mail.backends.smtp.EmailBackend")
EMAIL_HOST = os.getenv("EMAIL_HOST", "localhost")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")
DEFAULT_FROM_EMAIL = os.getenv("EMAIL_FROM", "webmaster@localhost")
SECURE_SSL_REDIRECT = SESSION_COOKIE_SECURE = CSRF_COOKIE_SECURE = not DEBUG
if not DEBUG:
    SECURE_HSTS_SECONDS = 31536000
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
DATA_UPLOAD_MAX_MEMORY_SIZE = 1024 * 1024
