from rest_framework import serializers
from .models import Employee, Department

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

class EmployeeSerializer(serializers.ModelSerializer):
    department_name = serializers.ReadOnlyField(source='department.name')

    class Meta:
        model = Employee
        fields = [
            'id',
            'first_name',
            'last_name',
            'email',
            'position',
            'department',
            'department_name',
            'is_active',
        ]