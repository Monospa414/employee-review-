from rest_framework import serializers
from .models import Evaluation


class EvaluationSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    reviewer_username = serializers.ReadOnlyField(source='reviewer.username')
    assigned_by_username = serializers.ReadOnlyField(source='assigned_by.username')
    manager_username = serializers.ReadOnlyField(source='manager.username')

    class Meta:
        model = Evaluation
        fields = [
            'id',
            'employee',
            'employee_name',
            'reviewer',
            'reviewer_username',
            'assigned_by',
            'assigned_by_username',
            'manager',
            'manager_username',
            'title',
            'notes',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['assigned_by', 'manager', 'status', 'created_at', 'updated_at']

    def get_employee_name(self, obj):
        return f"{obj.employee.last_name} {obj.employee.first_name}"


class EvaluationAssignSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evaluation
        fields = ['id', 'employee', 'reviewer', 'title', 'notes', 'status', 'assigned_by', 'manager', 'created_at', 'updated_at']
        read_only_fields = ['id', 'status', 'assigned_by', 'manager', 'created_at', 'updated_at']


class EvaluationStatusActionSerializer(serializers.Serializer):
    notes = serializers.CharField(required=False, allow_blank=True)