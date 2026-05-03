import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("books", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Evaluation",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=255, verbose_name="Название оценки")),
                ("notes", models.TextField(blank=True, verbose_name="Комментарий")),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("draft", "Черновик"),
                            ("submitted", "Отправлена на согласование"),
                            ("approved", "Согласована"),
                            ("rejected", "Отклонена"),
                        ],
                        default="draft",
                        max_length=20,
                        verbose_name="Статус",
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True, verbose_name="Создана")),
                ("updated_at", models.DateTimeField(auto_now=True, verbose_name="Обновлена")),
                (
                    "assigned_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="created_evaluations",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="Назначил",
                    ),
                ),
                (
                    "employee",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="evaluations",
                        to="books.employee",
                        verbose_name="Сотрудник",
                    ),
                ),
                (
                    "manager",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="manager_approvals",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="Согласующий менеджер",
                    ),
                ),
                (
                    "reviewer",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="assigned_evaluations",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="Оценивающий",
                    ),
                ),
            ],
            options={
                "verbose_name": "Оценка",
                "verbose_name_plural": "Оценки",
            },
        ),
    ]
