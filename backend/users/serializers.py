from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class UserCreateSerializer(BaseUserCreateSerializer):
    class Meta(BaseUserCreateSerializer.Meta):
        model = User
        fields = ('id', 'username', 'password', 'email', 'is_hr', 'is_reviewer', 'is_manager')

class UserSerializer(BaseUserCreateSerializer):
    class Meta(BaseUserCreateSerializer.Meta):
        model = User
        fields = ('id', 'username', 'email', 'is_hr', 'is_reviewer', 'is_manager')