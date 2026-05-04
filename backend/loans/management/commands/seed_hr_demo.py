from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from books.models import Department, Employee
from loans.models import Evaluation


class Command(BaseCommand):
    help = "Creates demo HR seed data for employee evaluations."

    def handle(self, *args, **options):
        user_model = get_user_model()

        hr_user, _ = user_model.objects.get_or_create(
            username="hr_lead",
            defaults={
                "email": "hr.lead@example.com",
                "first_name": "Анна",
                "last_name": "HR",
                "is_hr": True,
            },
        )
        hr_user.is_hr = True
        hr_user.set_password("DemoPass123!")
        hr_user.save()

        reviewer_user, _ = user_model.objects.get_or_create(
            username="reviewer_ivan",
            defaults={
                "email": "ivan.reviewer@example.com",
                "first_name": "Иван",
                "last_name": "Ревьюер",
                "is_reviewer": True,
            },
        )
        reviewer_user.is_reviewer = True
        reviewer_user.set_password("DemoPass123!")
        reviewer_user.save()

        manager_user, _ = user_model.objects.get_or_create(
            username="manager_olga",
            defaults={
                "email": "olga.manager@example.com",
                "first_name": "Ольга",
                "last_name": "Менеджер",
                "is_manager": True,
            },
        )
        manager_user.is_manager = True
        manager_user.set_password("DemoPass123!")
        manager_user.save()

        engineering, _ = Department.objects.get_or_create(
            name="Engineering",
            defaults={"description": "Разработка и архитектура продукта."},
        )
        sales, _ = Department.objects.get_or_create(
            name="Sales",
            defaults={"description": "Продажи и развитие клиентской базы."},
        )
        hr, _ = Department.objects.get_or_create(
            name="HR",
            defaults={"description": "Подбор и развитие сотрудников."},
        )

        employee_1, _ = Employee.objects.get_or_create(
            email="pavel.dev@example.com",
            defaults={
                "first_name": "Павел",
                "last_name": "Разработчик",
                "position": "Backend Engineer",
                "department": engineering,
            },
        )
        employee_2, _ = Employee.objects.get_or_create(
            email="elena.sales@example.com",
            defaults={
                "first_name": "Елена",
                "last_name": "Аккаунт",
                "position": "Account Executive",
                "department": sales,
            },
        )
        employee_3, _ = Employee.objects.get_or_create(
            email="max.hr@example.com",
            defaults={
                "first_name": "Максим",
                "last_name": "Рекрутер",
                "position": "Talent Acquisition Specialist",
                "department": hr,
            },
        )
        employee_4, _ = Employee.objects.get_or_create(
            email="nina.product@example.com",
            defaults={
                "first_name": "Нина",
                "last_name": "Продакт",
                "position": "Product Manager",
                "department": engineering,
            },
        )

        demos = [
            {
                "employee": employee_1,
                "title": "Q2 performance review - backend",
                "notes": "Черновик оценки, ожидает финализации.",
                "status": "draft",
            },
            {
                "employee": employee_2,
                "title": "Q2 performance review - sales",
                "notes": "Оценка отправлена менеджеру для согласования.",
                "status": "submitted",
            },
            {
                "employee": employee_3,
                "title": "Q2 performance review - recruiting",
                "notes": "Оценка согласована и закрыта.",
                "status": "approved",
            },
            {
                "employee": employee_4,
                "title": "Q2 performance review - product",
                "notes": "Оценка отклонена с запросом доработки.",
                "status": "rejected",
            },
        ]

        created_count = 0
        for payload in demos:
            _, created = Evaluation.objects.update_or_create(
                employee=payload["employee"],
                title=payload["title"],
                defaults={
                    "notes": payload["notes"],
                    "status": payload["status"],
                    "reviewer": reviewer_user,
                    "assigned_by": hr_user,
                    "manager": manager_user,
                },
            )
            if created:
                created_count += 1

        self.stdout.write(self.style.SUCCESS("HR demo seed completed."))
        self.stdout.write(
            f"Users: hr_lead/reviewer_ivan/manager_olga (password: DemoPass123!), "
            f"departments: {Department.objects.count()}, employees: {Employee.objects.count()}, "
            f"new evaluations created: {created_count}."
        )
