from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Evaluation
from .serializers import EvaluationSerializer, EvaluationAssignSerializer, EvaluationStatusActionSerializer


class EvaluationViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_hr or user.is_manager:
            return Evaluation.objects.all()
        if user.is_reviewer:
            return Evaluation.objects.filter(reviewer=user)
        return Evaluation.objects.none()

    def get_serializer_class(self):
        if self.action == 'create':
            return EvaluationAssignSerializer
        if self.action in ['submit', 'approve', 'reject']:
            return EvaluationStatusActionSerializer
        return EvaluationSerializer

    def create(self, request, *args, **kwargs):
        if not request.user.is_hr:
            return Response({"error": "Только HR может назначать оценки"}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(assigned_by=request.user, status='draft')

        output = EvaluationSerializer(serializer.instance, context=self.get_serializer_context())
        return Response(output.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        if not request.user.is_hr:
            return Response({"error": "Только HR может редактировать назначения"}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if not request.user.is_hr:
            return Response({"error": "Только HR может редактировать назначения"}, status=status.HTTP_403_FORBIDDEN)
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_hr:
            return Response({"error": "Только HR может удалять назначения"}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        evaluation = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if request.user != evaluation.reviewer:
            return Response({"error": "Только reviewer может отправить оценку"}, status=status.HTTP_403_FORBIDDEN)
        if evaluation.status != 'draft':
            return Response({"error": "Отправка доступна только для черновика"}, status=status.HTTP_400_BAD_REQUEST)

        if serializer.validated_data.get('notes'):
            evaluation.notes = serializer.validated_data['notes']
        evaluation.status = 'submitted'
        evaluation.save(update_fields=['status', 'notes', 'updated_at'])
        return Response({"status": "Оценка отправлена на согласование"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        evaluation = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if not request.user.is_manager:
            return Response({"error": "Только manager может согласовать оценку"}, status=status.HTTP_403_FORBIDDEN)
        if evaluation.status != 'submitted':
            return Response({"error": "Согласование доступно только после отправки"}, status=status.HTTP_400_BAD_REQUEST)

        if serializer.validated_data.get('notes'):
            evaluation.notes = serializer.validated_data['notes']
        evaluation.status = 'approved'
        evaluation.manager = request.user
        evaluation.save(update_fields=['status', 'manager', 'notes', 'updated_at'])
        return Response({"status": "Оценка согласована"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        evaluation = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if not request.user.is_manager:
            return Response({"error": "Только manager может отклонить оценку"}, status=status.HTTP_403_FORBIDDEN)
        if evaluation.status != 'submitted':
            return Response({"error": "Отклонение доступно только после отправки"}, status=status.HTTP_400_BAD_REQUEST)

        if serializer.validated_data.get('notes'):
            evaluation.notes = serializer.validated_data['notes']
        evaluation.status = 'rejected'
        evaluation.manager = request.user
        evaluation.save(update_fields=['status', 'manager', 'notes', 'updated_at'])
        return Response({"status": "Оценка отклонена"}, status=status.HTTP_200_OK)