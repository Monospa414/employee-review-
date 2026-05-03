from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    is_hr = models.BooleanField(default=False)
    is_reviewer = models.BooleanField(default=False)
    is_manager = models.BooleanField(default=False)
    
    def __str__(self):
        return self.username