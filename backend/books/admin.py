from django.contrib import admin
from .models import Employee, Department


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('last_name', 'first_name', 'position', 'department', 'is_active')
    list_filter = ('is_active', 'department')
    search_fields = ('last_name', 'first_name', 'email', 'position')