from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_alter_user_id'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='is_librarian',
        ),
        migrations.AddField(
            model_name='user',
            name='is_hr',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='user',
            name='is_manager',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='user',
            name='is_reviewer',
            field=models.BooleanField(default=False),
        ),
    ]
