from django.contrib import admin
from .models import Evaluation


@admin.register(Evaluation)
class EvaluationAdmin(admin.ModelAdmin):
    list_display = ('title', 'employee', 'reviewer', 'assigned_by', 'manager', 'status', 'created_at')
    list_filter = ('status', 'created_at', 'employee__department')
    search_fields = (
        'title',
        'employee__first_name',
        'employee__last_name',
        'reviewer__username',
        'assigned_by__username',
        'manager__username',
    )