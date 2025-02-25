from django.shortcuts import render, redirect
from .models import Person, LoginUser
from django.http import HttpResponse
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from pymongo import MongoClient

url = 'mongodb+srv://kmnaveen777:naveen@atlas.eokhe.mongodb.net/'

client = MongoClient(url)

db = client["test_mongo"]  
teacher_collection = db["auth_teachers"] 





def index(request):
    return render(request, 'authunticate.html')


def teacher(request):
    return render(request, 'authteacher.html')

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

from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.shortcuts import render, redirect

def signup(request):
    if request.method == "POST":
        first_name = request.POST.get('firstname', '').strip()
        last_name = request.POST.get('lastname', '').strip()
        email = request.POST['email']
        username = request.POST['username']
        password = request.POST['password']
        

        hashed_password = make_password(password)
        
        
        if User.objects.filter(email=email).exists():
                return render(request, "authunticate.html", {
                    "error_message": "Email already exists"
                })
        if User.objects.filter(username=username).exists():
                return render(request, "authunticate.html", {
                    "error_message": "User already exists"
                })
            # Save regular user in Django's auth_user model
        user = User(
                username=username,
                email=email,
                password=hashed_password,
                first_name=first_name,
                last_name=last_name
            )
        user.save()

        return redirect('index') 

    return redirect('/')

def teacher_signup(request):
    if request.method == "POST":
        first_name = request.POST.get('firstname', '').strip()
        last_name = request.POST.get('lastname', '').strip()
        email = request.POST['email']
        username = request.POST['username']
        password = request.POST['password']
        
        if teacher_collection.find_one({"email": email}):
                return render(request, "authteacher.html", {
                    "error_message": "Email already exists"
                })
        if teacher_collection.find_one({"username": username}):
                return render(request, "authteacher.html", {
                    "error_message": "User already exists"
                })
        hashed_password = make_password(password)
        teacher_data = {
                "username": username,
                "email": email,
                "password": hashed_password,
                "first_name": first_name,
                "last_name": last_name,
                "role": "teacher",
                "is_active": True,
                "is_staff": False,
                "is_superuser": False,
            }
        teacher_collection.insert_one(teacher_data) 
        return redirect('loginteacher')
    return redirect('/')
        
  


def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']

        user = authenticate(request, username=username, password=password)  
        if user is not None:
            login(request, user)  
            return redirect('dashbord')  # Redirect to dashboard

        return render(request, "authunticate.html", {"error_message": "Invalid credentials"})
    return render(request, "dashbord.html")


def teacher_login(request):
    if request.method == "POST":
        username = request.POST['username']
        password = request.POST['password']

        teacher = teacher_collection.find_one({"username": username})  
        if teacher and check_password(password, teacher["password"]):  
            request.session["teacher_username"] = username 
            return redirect("dashbord")  
        
        return render(request, "authteacher.html", {"error_message": "Invalid credentials"})
    
    return render(request, "dashbord.html")
    

def dashbord(request):
    return render(request, 'dashbord.html')

def logout_view(request):
    request.session.flush()
    logout(request)  
    return redirect('dashbord') 



