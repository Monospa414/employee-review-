from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Roles', {'fields': ('is_hr', 'is_reviewer', 'is_manager')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Roles', {'fields': ('is_hr', 'is_reviewer', 'is_manager')}),
    )
    list_display = UserAdmin.list_display + ('is_hr', 'is_reviewer', 'is_manager')