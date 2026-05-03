import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Department",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=100, verbose_name="Название подразделения")),
                ("description", models.TextField(blank=True, verbose_name="Описание")),
            ],
            options={
                "verbose_name": "Подразделение",
                "verbose_name_plural": "Подразделения",
            },
        ),
        migrations.CreateModel(
            name="Employee",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("first_name", models.CharField(max_length=100, verbose_name="Имя")),
                ("last_name", models.CharField(max_length=100, verbose_name="Фамилия")),
                ("email", models.EmailField(max_length=254, unique=True, verbose_name="Рабочая почта")),
                ("position", models.CharField(max_length=150, verbose_name="Должность")),
                ("is_active", models.BooleanField(default=True, verbose_name="Активен")),
                (
                    "department",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="employees",
                        to="books.department",
                        verbose_name="Подразделение",
                    ),
                ),
            ],
            options={
                "verbose_name": "Сотрудник",
                "verbose_name_plural": "Сотрудники",
            },
        ),
    ]
