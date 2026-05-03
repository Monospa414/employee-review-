from django.db import models
from django.conf import settings
from books.models import Employee

class Evaluation(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Черновик'),
        ('submitted', 'Отправлена на согласование'),
        ('approved', 'Согласована'),
        ('rejected', 'Отклонена'),
    ]

    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='evaluations',
        verbose_name="Сотрудник",
    )
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='assigned_evaluations',
        verbose_name="Оценивающий",
    )
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='created_evaluations',
        null=True,
        blank=True,
        verbose_name="Назначил",
    )
    manager = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='manager_approvals',
        null=True,
        blank=True,
        verbose_name="Согласующий менеджер",
    )
    title = models.CharField(max_length=255, verbose_name="Название оценки")
    notes = models.TextField(blank=True, verbose_name="Комментарий")
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        verbose_name="Статус",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Создана")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Обновлена")

    def __str__(self):
        return f"{self.employee} — {self.title} ({self.get_status_display()})"

    class Meta:
        verbose_name = 'Оценка'
        verbose_name_plural = 'Оценки'