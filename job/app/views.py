from django.shortcuts import render
from pymongo import MongoClient
from django.shortcuts import render, redirect
from .models import Person, LoginUser
from django.http import HttpResponse
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
import datetime

@login_required
def update_profile(request):
    if request.method == "POST":
        user = request.user
        user.username = request.POST['username']
        user.email = request.POST['email']
        user.save()
        return JsonResponse({"success": True})
    return JsonResponse({"success": False, "error": "Invalid request"})

@login_required
def update_password(request):
    if request.method == "POST":
        user = request.user
        current_password = request.POST['current_password']
        new_password = request.POST['new_password']

        if user.check_password(current_password):
            user.set_password(new_password)
            user.save()
            return JsonResponse({"success": True})
        else:
            return JsonResponse({"success": False, "error": "Current password is incorrect"})
    return JsonResponse({"success": False, "error": "Invalid request"})


# Connect to MongoDB Atlas (First Database)
MONGO_URI = "mongodb+srv://pavan:database@atlas.eokhe.mongodb.net/"
client = MongoClient(MONGO_URI)
db = client["test_mongo"]

# Connect to MongoDB Atlas (Second Database)
MONGO_URI1 = "mongodb+srv://pavankumar9686323614:job@job-portal.m1m85.mongodb.net/"
client1 = MongoClient(MONGO_URI1)
db1 = client1["test_mongo"]

# Collections
auth_user_collection = db["auth_user"]
social_auth_collection = db["social_auth_usersocialauth"]
job_collection = db1["Joblist"]  # Renamed to avoid conflict
job_applied_collection = db1["JobApplied"]  # Renamed to avoid conflict

def user_list(request):
    users = list(auth_user_collection.find({}))  # Fetch users
    social_auths = list(social_auth_collection.find({}))  # Fetch social auth users
    
    return render(request, 'user_list.html', {'users': users, 'social_auths': social_auths})

def job_list_view(request):  
    jobs = list(job_collection.find({}))  # Fetch jobs
    user_id = request.user.id if request.user.is_authenticated else None

    # Check if the user has applied for each job
    applied_jobs = set(application['job_id'] for application in job_applied_collection.find({"user_id": str(user_id)})) if user_id else set()

    return render(request, 'job_list.html', {'jobs': jobs, 'applied_jobs': applied_jobs})


def index(request):
    return render(request, 'authunticate.html')

def add_person(request):
    person = Person(name="Doe", age=30)
    person.save()
    return HttpResponse("<h1>Person added successfully</h1>")

def get_person(request):
    person = Person.objects.first() # Get first person
    return HttpResponse(f"<h1>Name: {person.name}, Age: {person.age}</h1>")

def check_auth(request):
    if request.user.is_authunticated:
        return HttpResponse(f"<h1>User is authenticated</h1>")
    return HttpResponse(f"<h1>User is not authenticated</h1>")

from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password

def signup(request):
    if request.method == "POST":
        email = request.POST['email']
        username = request.POST['username']
        password = request.POST['password']

        # Check if email or username already exists
        if User.objects.filter(email=email).count() > 0:
            return render(request, "authunticate.html", {
                "error_message": "Email already exists"
            })
        if User.objects.filter(username=username).count() > 0:
            return render(request, "authunticate.html", {
                "error_message": "User already exists"
            })

        # Create user with hashed password
        user = User(username=username, email=email, password=make_password(password))
        user.save()
        
        return redirect('/')  # Redirect to login or home page

    return redirect('/')

def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']

        user = authenticate(request, username=username, password=password)  # Authenticate user
        if user is not None:
            login(request, user)  # Log in the user
            return redirect('job_list')  # Redirect to dashboard

        return render(request, "authunticate.html", {"error_message": "Invalid credentials"})

    return redirect('/')

@login_required(login_url='/')
def dashbord(request):
    return render(request, 'job_list.html')

def logout_view(request):
    request.session.flush()
    return redirect('job_list')

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
@login_required
def toggle_apply_job(request):
    if request.method == "POST":
        job_id = request.POST.get("job_id")
        user_id = request.user.id
        
        if not job_id:
            return JsonResponse({"error": "Missing job_id"}, status=400)

        job_applied_collection = db1["JobApplied"]
        
        # Check if job is already applied by this user
        existing_application = job_applied_collection.find_one({
            "user_id": str(user_id),
            "job_id": job_id
        })

        if existing_application:
            # If already applied, remove the application (Unapply)
            job_applied_collection.delete_one({"_id": existing_application["_id"]})
            return JsonResponse({"status": "unapplied"})
        else:
            # If not applied, add a new application
            job_applied_collection.insert_one({
                "user_id": str(user_id),
                "job_id": job_id,
                "applied_at": datetime.datetime.now()
            })
            return JsonResponse({"status": "applied"})
