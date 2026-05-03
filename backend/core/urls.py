from django.contrib import admin
from django.urls import path, include

admin.site.site_header = "Employee Review Admin"
admin.site.site_title = "Employee Review"
admin.site.index_title = "Employee Review Control Panel"

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/employees/', include('books.urls')),
    path('api/evaluations/', include('loans.urls')),
    path('api/auth/', include('djoser.urls')),
    path('api/auth/', include('djoser.urls.jwt')),
]