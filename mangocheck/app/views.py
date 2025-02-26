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
        print("User created")
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
        print("User created")
        if user is not None:
            login(request, user)  
            return redirect('dashbord')  # Redirect to dashboard

        return render(request, "authunticate.html", {"error_message": "Invalid credentials"})
    return render(request, "dashbord.html")


from django.contrib.auth import login
from django.contrib.auth.hashers import check_password
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model

User = get_user_model()  # Get the user model

def teacher_login(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]

        teacher = teacher_collection.find_one({"username": username})  # Fetch from MongoDB
        
        if teacher and check_password(password, teacher["password"]):  
            # Retrieve or create user in Django authentication system
            user, created = User.objects.get_or_create(username=username, defaults={"is_teacher": True})

            # Specify backend manually
            user.backend = 'django.contrib.auth.backends.ModelBackend'  

            login(request, user, backend=user.backend) 
            
            request.session["user_type"] = "teacher"
            request.session["teacher_username"] = username

            return redirect("dashbord")  

        return render(request, "authteacher.html", {"error_message": "Invalid credentials"})

    return render(request, "dashbord.html")




from django.shortcuts import redirect

def teacher_google_login(request):
    request.session.flush()
    request.session["user_type"] = "teacher"
    return redirect("social:begin", "google-oauth2")

def teacher_github_login(request):
    request.session.flush()
    request.session["user_type"] = "teacher"
    return redirect("social:begin", "github")



def logout_view(request):
    request.session.flush()
    logout(request)  
    return redirect('dashbord') 


def dashbord(request):
    is_teacher = False

    if request.user.is_authenticated:
        google_social = request.user.social_auth.filter(provider="google-oauth2").first()
        github_social = request.user.social_auth.filter(provider="github").first()

        print("🔹 Session Data:", dict(request.session))  
        print(f"🔹 Google Social: {google_social if google_social else 'None'}")
        print(f"🔹 GitHub Social: {github_social if github_social else 'None'}")

        user_type = request.session.get("user_type")
        print(f"🔹 Session User Type: {user_type}")

        # Check if logged in via OAuth or manual login
        if user_type == "teacher" :
            is_teacher = True

        print(f"🔹 request.is_teacher: {is_teacher}")
    
    else:
        print("🔹 Not authenticated")

    return render(request, "dashbord.html", {"is_teacher": is_teacher})

