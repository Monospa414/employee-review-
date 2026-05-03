from django.db import models

class Department(models.Model):
    name = models.CharField(max_length=100, verbose_name="Название подразделения")
    description = models.TextField(blank=True, verbose_name="Описание")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Подразделение'
        verbose_name_plural = 'Подразделения'

class Employee(models.Model):
    first_name = models.CharField(max_length=100, verbose_name="Имя")
    last_name = models.CharField(max_length=100, verbose_name="Фамилия")
    email = models.EmailField(unique=True, verbose_name="Рабочая почта")
    position = models.CharField(max_length=150, verbose_name="Должность")
    department = models.ForeignKey(
        Department,
        on_delete=models.PROTECT,
        related_name='employees',
        verbose_name="Подразделение",
    )
    is_active = models.BooleanField(default=True, verbose_name="Активен")

    def __str__(self):
        return f"{self.last_name} {self.first_name}"
    
    class Meta:
        verbose_name = 'Сотрудник'
        verbose_name_plural = 'Сотрудники'