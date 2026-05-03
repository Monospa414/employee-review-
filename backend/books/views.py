from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from .models import Employee, Department
from .serializers import EmployeeSerializer, DepartmentSerializer
from .permitions import IsHRManagerOrReadOnly

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated, IsHRManagerOrReadOnly]

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated, IsHRManagerOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name', 'email', 'position', 'department__name']