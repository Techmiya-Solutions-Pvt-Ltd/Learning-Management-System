from django.db import models

class Person(models.Model):
    name = models.CharField(max_length=255)
    age = models.IntegerField()

class LoginUser(models.Model):
    username = models.CharField(max_length=255, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)

class Job(models.Model):
    title = models.CharField(max_length=255)
    organization = models.CharField(max_length=255)
    salary = models.IntegerField()
    location = models.CharField(max_length=255)
    experience = models.CharField(max_length=255)
    job_type = models.CharField(max_length=50)
    skills = models.ManyToManyField('Skill', related_name='jobs')  # Assuming a Skill model exists

class Skill(models.Model):
    name = models.CharField(max_length=100)
