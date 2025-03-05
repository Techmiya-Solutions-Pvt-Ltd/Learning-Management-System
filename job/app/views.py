def user_list(request):
    users = list(auth_user_collection.find({}))  # Fetch users
    print(f"Fetched Users: {users}")  # Debugging line to check fetched users
    user_id = "19"  # Check for user with ID 19
    user_data = auth_user_collection.find_one({"_id": user_id})
    print(f"User Data for ID {user_id}: {user_data}")  # Debugging line to check specific user data
    social_auths = list(social_auth_collection.find({}))  # Fetch social auth users
    
    return render(request, 'user_list.html', {'users': users, 'social_auths': social_auths})
from django.shortcuts import render
from pymongo import MongoClient
from django.shortcuts import render, redirect

from django.http import HttpResponse
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
import datetime


# Other views (e.g., job_list_view, signup, login_view, etc.) remain unchanged
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

def api_jobs(request):
    return render(request, 'Api_job.html')

def job_list_view(request):  
    jobs = list(job_collection.find({}))  # Fetch jobs
    user_id = request.user.id if request.user.is_authenticated else None
    user_data = auth_user_collection .find_one({"id": request.user.id})
    father_name = user_data.get("father_name", "N/A")
    progress = user_data.get("progress", "N/A")
    branch = user_data.get("branch", "N/A")
    Passout_Year = user_data.get("Passout_Year", "N/A")
    Graduation_Percentage = user_data.get("Graduation_Percentage", "N/A")
    Percentage_10 = user_data.get("10th_Percentage", "N/A")
    Percentage_12 = user_data.get("12th_Percentage", "N/A")
    
    data=[{"father_name":father_name,"progress":progress,"branch":branch,"Passout_Year":Passout_Year,"Graduation_Percentage":Graduation_Percentage,"Percentage_10":Percentage_10,"Percentage_12":Percentage_12}]

    # Convert job['Skills'] from string to list
    for job in jobs:
        if 'Skills' in job and isinstance(job['Skills'], str):
            job['Skills'] = [skill.strip() for skill in job['Skills'].split(',')]  # Convert to list

    # Check if the user has applied for each job
    applied_jobs = set(application['job_id'] for application in job_applied_collection.find({"user_id": str(user_id)})) if user_id else set()
    # print({request.user.email})
    # print({request.user.id})
    # print({request.user.username})
    # print({request.user.date_joined})
    # print(father_name)
    return render(request, 'job_list.html', {'jobs': jobs, 'applied_jobs': applied_jobs,"user": request.user,"data":data})

# geg





def hr_list(request):
 return render(request, 'hr.html')

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
    print("hiii")
    # return render(request, 'job_list.html',{"user": request.user})

def logout_view(request):
    request.session.flush()
    return redirect('job_list')

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
@login_required
def toggle_apply_job(request):
    print(f"Received request data: {request.POST}")  # Debugging line to log incoming request data

    if request.method == "POST":
        job_id = request.POST.get("job_id")
        user_id = request.user.id
        
        if not job_id:
            return JsonResponse({"error": "Missing job_id"}, status=400)

        job_applied_collection = db1["JobApplied"]
        print(f"Job ID: {job_id}, User ID: {user_id}")  # Debugging line to log job and user IDs

        
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
        
        
        # profile side bar logic
        from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

def get_user_profile(request):
    user = request.user
    user_data = auth_user_collection .find_one({"id": request.user.id})
    user_name = user_data.get("username", "N/A")
    ug_college = user_data.get("ug_college", "N/A")
    email = user_data.get("email", "N/A")
    father_name = user_data.get("father_name", "N/A")
    progress = user_data.get("progress", "N/A")
    branch = user_data.get("branch", "N/A")
    Passout_Year = user_data.get("Passout_Year", "N/A")
    Graduation_Percentage = user_data.get("Graduation_Percentage", "N/A")
    Percentage_10 = user_data.get("10th_Percentage", "N/A")
    Percentage_12 = user_data.get("12th_Percentage", "N/A")
    profile_picture = user_data.get("profile_picture", None)
    print(profile_picture)

    print(father_name)
    print(user_name)
    data = [{
    # "father_name": father_name,
    "profile_picture": profile_picture,
    "email": email,
    "father_name": father_name,
    "progress": progress,
    "branch": branch,
    "ug_college": ug_college,
    "user_name": user_name,
    "Passout_Year": Passout_Year,
    "Graduation_Percentage": Graduation_Percentage,
    "Percentage_10": Percentage_10,
    "Percentage_12": Percentage_12  }]
    return JsonResponse({"success": True, "data": data})
import json
import base64
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from pymongo import MongoClient


@csrf_exempt
@require_POST
def update_profile(request):
    try:
        user = request.user  
        if not user.is_authenticated:  
            return JsonResponse({"status": "error", "message": "User not authenticated"}, status=401)

        # Check if request is multipart/form-data (for file upload)
        if request.content_type.startswith('multipart/form-data'):
            data = request.POST.dict()  # Convert form data to dict
            profile_picture = request.FILES.get("profile_picture")  # Get uploaded file
        else:
            try:
                data = json.loads(request.body.decode("utf-8"))
                profile_picture = None
            except json.JSONDecodeError:
                return JsonResponse({"status": "error", "message": "Invalid JSON data"}, status=400)

        print(f"Received data: {data}")  # Debugging

        # Fetch user data from MongoDB
        user_data = auth_user_collection.find_one({"username": user.username})

        if not user_data:
            return JsonResponse({"status": "error", "message": "User profile not found"}, status=404)

        # Field mappings
        field_mappings = {
            "name": "username",
            "email": "email",
            "father_name": "father_name",
            "ug_college": "ug_college",
            "branch": "branch",
            "passout_year": "Passout_Year",
            "graduation_percentage": "Graduation_Percentage",
            "tenth_percentage": "10th_Percentage",
            "twelfth_percentage": "12th_Percentage",
        }

        update_data = {}
        for frontend_field, db_field in field_mappings.items():
            new_value = data.get(frontend_field, "").strip()
            old_value = str(user_data.get(db_field, "")).strip()

            if new_value and new_value != old_value:
                update_data[db_field] = new_value

        # **Handle profile picture upload**
        if profile_picture:
            image_data = profile_picture.read()  # Read the image file
            encoded_image = base64.b64encode(image_data).decode("utf-8")  # Convert to Base64
            update_data["profile_picture"] = encoded_image  # Store in MongoDB

        # print(f"Changes detected: {update_data}")  # Debugging

        if not update_data:
            return JsonResponse({"status": "success", "message": "No changes detected."})

        # Update user profile in MongoDB
        result = auth_user_collection.update_one(
            {"username": user.username},
            {"$set": update_data}
        )

        print(f"Update result: {result.modified_count} document(s) modified.")  # Debugging

        return JsonResponse({"status": "success", "message": "Profile updated successfully!"})

    except Exception as e:
        print(f"Error updating profile: {e}")  # Debugging
        return JsonResponse({"status": "error", "message": str(e)}, status=500)
