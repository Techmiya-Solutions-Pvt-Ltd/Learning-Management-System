from django.shortcuts import render, redirect
from .models import Person, LoginUser
from django.http import HttpResponse
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from pymongo import MongoClient
from django.http import HttpResponseForbidden
from django.contrib.auth.models import User
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model
from bson import ObjectId
import json
from datetime import datetime
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages




url = 'mongodb+srv://kmnaveen777:naveen@atlas.eokhe.mongodb.net/'

client = MongoClient(url)

db = client["test_mongo"]  
teacher_collection = db["auth_teachers"] 
users_collection = db["auth_user"]
questions_collection = db["questions"] 
courses_collection = db["Courses"]







def index(request):
    return render(request, 'authunticate.html')




@csrf_exempt 
def add_course(request):
    if request.method == "POST":
        teacher_id = request.POST.get("teacher_id")
        course_name = request.POST.get("course_name")
        course_type = request.POST.get("course_type")
        course_description = request.POST.get("course_description")
        course_category = request.POST.get("course_category")
        course_duration = request.POST.get("course_duration")

        
        new_course = {
            "teacher_id": teacher_id,
            "course_name": course_name,
            "course_type": course_type,
            "course_description": course_description,
            "course_category": course_category,
            "course_duration": course_duration,
            "assignment_id": None
        }
        courses_collection.insert_one(new_course)
        messages.success(request, "Course added successfully!")
        return redirect("courses")  

    return redirect("courses")


def courses(request):
    doc = questions_collection.find_one({"_id": ObjectId("67c82c0c2d306782adde4ccd")})

    questions_dict = json.loads(doc['questions']['questions'])
    timestramp=doc['timestamp']
    formatted_datetime = datetime.fromisoformat(timestramp)

    date = formatted_datetime.date().isoformat() 
    time = formatted_datetime.time().strftime("%H:%M:%S")[:-3]
    date_time=time+" on "+date
    questions_details = doc['questions']
    teacher_id = questions_details['teacher_id']
    teacher_name_doc = teacher_collection.find_one({"_id": ObjectId(teacher_id)},{"first_name": 1, "second_name": 1, "_id": 0})
    if teacher:
        first_name = teacher_name_doc.get("first_name", "")
        second_name = teacher_name_doc.get("second_name", "")
        teacher_name = f"{first_name} {second_name}".strip()
        
    else:
        teacher_name=None
    
    time_allotment= questions_details['time_allotment']
    assessment_name = questions_details['assessment_name']
    assessment_id="67c7e9c7348b64bc643990b4"
    
    questions={"teacher_name":teacher_name,"time_allotment":time_allotment,"assessment_name":assessment_name,"questions_dict":questions_dict,"assessment_id":assessment_id,"date_time":date_time}
    
    if request.user.is_authenticated:
        # try:
            
            user = teacher_collection.find_one({"username": request.user.username}) 
            # f=user["first_name"]+" "+user["last_name"]
            # print(f)
            # print(user)
            
            if user and "role" in user and user["role"] == "teacher":
                user_data={
                "full_name":user["first_name"]+" "+user["last_name"],
                "email":user["email"],
                "id":user["_id"],
                }
                assigned_courses = list(courses_collection.find({"teacher_id": str(user["_id"])}))
                for course in assigned_courses:
                    course["_id"] = str(course["_id"])
                # print(assigned_courses)
                return render(request, 'courses.html', {"questions": questions,"user_data":user_data,
                "assigned_courses": assigned_courses})
                
            else:
                print(request.user,"hi")
                return HttpResponseForbidden("You are not authorized to access this page.")
        
    
    return redirect('loginteacher')


def assessment(request):
    doc = questions_collection.find_one({"_id": ObjectId("67c82c0c2d306782adde4ccd")})

    questions_dict = json.loads(doc['questions']['questions'])
    timestramp=doc['timestamp']
    formatted_datetime = datetime.fromisoformat(timestramp)

    date = formatted_datetime.date().isoformat() 
    time = formatted_datetime.time().strftime("%H:%M:%S")[:-3]
    date_time=time+" on "+date
    questions_details = doc['questions']
    teacher_id = questions_details['teacher_id']
    teacher_name_doc = teacher_collection.find_one({"_id": ObjectId(teacher_id)},{"first_name": 1, "second_name": 1, "_id": 0})
    if teacher:
        first_name = teacher_name_doc.get("first_name", "")
        second_name = teacher_name_doc.get("second_name", "")
        teacher_name = f"{first_name} {second_name}".strip()
        
    else:
        teacher_name=None
    
    time_allotment= questions_details['time_allotment']
    assessment_name = questions_details['assessment_name']
    assessment_id="67c7e9c7348b64bc643990b4"
    
    questions={"teacher_name":teacher_name,"time_allotment":time_allotment,"assessment_name":assessment_name,"questions_dict":questions_dict,"assessment_id":assessment_id,"date_time":date_time}
    
    print(questions_dict)
   
        
        
    if request.user.is_authenticated:
        try:
            
            user = users_collection.find_one({"id": request.user.id}) 
            f=user["first_name"]+" "+user["last_name"]
            print(f)
            
            if user and "role" in user and user["role"] == "student":
                user_data={"full_name":user["first_name"]+" "+user["last_name"],"email":user["email"],"id":user["_id"]}
                return render(request, 'assessment.html', {"questions": questions,"user_data":user_data})
            else:
                return HttpResponseForbidden("You are not authorized to access this page.")
        except Exception as e:
            print("User ID from request:", request.user.id, type(request.user.id))

            print("Error fetching user:", str(e))

    return HttpResponseForbidden("You are not authorized to access this page.")

@login_required(login_url="/loginteacher/")
def teacherpage(request):
    return render(request, 'teacher.html')

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


def signup(request):
    if request.method == "POST":
        print("1")
        first_name = request.POST.get('firstname', '').strip()
        last_name = request.POST.get('lastname', '').strip()
        email = request.POST.get('email', '').strip()
        username = request.POST.get('username', '').strip()
        password = request.POST.get('password', '')

        hashed_password = make_password(password)
        
        
        if User.objects.filter(email=email).count() > 0:
            return render(request, "authunticate.html", {
                "error_message": "Email already exists"
            })

        if User.objects.filter(username=username).count() > 0:
            
            return render(request, "authunticate.html", {
                "error_message": "User already exists"
            })
        if teacher_collection.find_one({"email": email}):
                return render(request, "authteacher.html", {
                    "error_message": "Email already exists"
                })
        if teacher_collection.find_one({"username": username}):
                return render(request, "authteacher.html", {
                    "error_message": "User already exists"
                })

        
       
        user = User(
            username=username,
            email=email,
            password=hashed_password,
            first_name=first_name,
            last_name=last_name
        )
        user.save()
        users_collection.update_one(
            {"email": email}, 
            {"$set": {"role": "student"}}
        )

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
        if User.objects.filter(email=email).count() > 0:
            return render(request, "authunticate.html", {
                "error_message": "Email already exists"
            })

        if User.objects.filter(username=username).count() > 0:
            
            return render(request, "authunticate.html", {
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
            return redirect('dashbord')  

        return render(request, "authunticate.html", {"error_message": "Invalid credentials"})
    return render(request, "dashbord.html")




User = get_user_model()  

def teacher_login(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]

        
        teacher = teacher_collection.find_one({"username": username})  

        if teacher and check_password(password, teacher["password"]):  
            role = teacher.get("role", "student")
            request.session["user_type"] = role  
            request.session["teacher_username"] = username
            request.session["teacher_id"] = str(teacher["_id"])  

            
            user, created = User.objects.get_or_create(username=username)
            login(request, user, backend='django.contrib.auth.backends.ModelBackend') 

            return redirect("dashbord")  

        return render(request, "authteacher.html", {"error_message": "Invalid credentials"})

    return render(request, "dashbord.html")






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
        user_type = request.session.get("user_type", "student")
        is_teacher = user_type == "teacher"

    return render(request, "teacher.html" if is_teacher else "dashbord.html", {"is_teacher": is_teacher})


