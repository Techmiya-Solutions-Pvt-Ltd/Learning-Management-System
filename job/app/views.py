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
Experience = db1["Experience"]
hr_collection = db1["authhr"]
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
    jobs = list(job_collection.find({}).sort("posted_date", -1))  # Fetch jobs sorted by most recent

    user_id = request.user.id if request.user.is_authenticated else None
    user_data = auth_user_collection.find_one({"id": request.user.id})
    
    father_name = user_data.get("father_name", "N/A")
    progress = user_data.get("progress", "N/A")
    branch = user_data.get("branch", "N/A")
    Passout_Year = user_data.get("Passout_Year", "N/A")
    Graduation_Percentage = user_data.get("Graduation_Percentage", "N/A")
    Percentage_10 = user_data.get("10th_Percentage", "N/A")
    Percentage_12 = user_data.get("12th_Percentage", "N/A")
    deadline = user_data.get("deadline", "N/A")

    data = [{
        "father_name": father_name, 
        "progress": progress, 
        "branch": branch, 
        "Passout_Year": Passout_Year, 
        "Graduation_Percentage": Graduation_Percentage, 
        "Percentage_10": Percentage_10, 
        "Percentage_12": Percentage_12,
        "deadline": deadline,
    }]

    # Convert job['Skills'] from string to list
    for job in jobs:
        if 'Skills' in job and isinstance(job['Skills'], str):
            job['Skills'] = [skill.strip() for skill in job['Skills'].split(',')]

    # Check if the user has applied for each job
    applied_jobs = set(application['job_id'] for application in job_applied_collection.find({"user_id": str(user_id)})) if user_id else set()

    return render(request, 'job_list.html', {'jobs': jobs, 'applied_jobs': applied_jobs, "user": request.user, "data": data})




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


def loginhr(request):
    return render(request, 'authhr.html')



# hr authentication
def hr_signup(request):
    if request.method == "POST":
        first_name = request.POST.get('firstname', '').strip()
        last_name = request.POST.get('lastname', '').strip()
        email = request.POST['email']
        hrname = request.POST['hrname']
        password = request.POST['password']
        confirm_password = request.POST['confirm_password']
        
        if password != confirm_password:
            return render(request, "authhr.html", {"error_message": "Passwords do not match"})
        
        if hr_collection.find_one({"email": email}) or hr_collection.find_one({"hrname": hrname}):
            return render(request, "authhr.html", {"error_message": "HR already exists"})
        
        hashed_password = make_password(password)
        hr_data = {
            "hrname": hrname,
            "email": email,
            "password": hashed_password,
            "first_name": first_name,
            "last_name": last_name,
            "is_active": True,
            "is_staff": False,
            "is_superuser": False,
        }
        hr_collection.insert_one(hr_data)
        return redirect('loginhr')
    return redirect('/')


def hr_login(request):
    if request.method == "POST":
        identifier = request.POST.get("identifier", "").strip()  # Accepts hrname or email
        password = request.POST.get("password", "").strip()

        print("Received data:", request.POST)  # Debugging

        if not identifier or not password:
            return render(request, "authhr.html", {"error_message": "Both fields are required"})

        hr = hr_collection.find_one({"$or": [{"hrname": identifier}, {"email": identifier}]})

        if hr:
            print("Found HR:", hr)  # Debugging

            if check_password(password, hr["password"]):
                # Store HR information in the session
                request.session["hr_username"] = hr["hrname"]
                request.session["hr_id"] = str(hr["_id"])

                # Redirect to HR dashboard without using Django's auth system
                return redirect("hr_panel")
            else:
                print("Password mismatch")  # Debugging
        else:
            print("HR not found")  # Debugging

        return redirect('loginhr')

    return redirect('loginhr')  # Show login page if GET request
# hr creating a job 
# from django.views.decorators.csrf import csrf_exempt
# @csrf_exempt
# @login_required
# def create_job(request):
#     if request.method == "POST":
#         try:
#             data = json.loads(request.body)

#             # Get HR ID from the logged-in user
#             hr_id = request.user.id

#             # Prepare job data
#             job_data = {
#                 "hr_id": hr_id,
#                 "job_title": data.get("jobTitle"),
#                 "company": data.get("company"),
#                 "location": data.get("location").split(","),
#                 "job_type": data.get("jobType"),
#                 "salary_range": data.get("salary"),
#                 "experience_range": data.get("experience"),
#                 "skills": data.get("skills").split(","),
#                 "description": data.get("description"),
#                 "responsibilities": data.get("responsibilities", ""),
#                 "qualifications": data.get("qualifications", ""),
#                 "application_deadline": data.get("deadline"),
#                 "status": data.get("status", "active"),
#             }

#             # Insert into MongoDB
#             job_collection.insert_one(job_data)

#             return JsonResponse({"message": "Job created successfully"}, status=201)
        
#         except Exception as e:
#             return JsonResponse({"error": str(e)}, status=400)
    
#     return JsonResponse({"error": "Invalid request method"}, status=405)



@login_required(login_url='/')
def dashbord(request):
    print("hiii")
    # return render(request, 'job_list.html',{"user": request.user})

def logout_view(request):
    request.session.flush()
    return redirect('job_list')

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
import datetime


@csrf_exempt
@login_required
def toggle_apply_job(request):
    print(f"Received request data: {request.POST}")  # Debugging log

    if request.method == "POST":
        job_id = request.POST.get("job_id")
        hr_id = request.POST.get("hr_id")
        user_id = request.user.id

        if not job_id:
            print("❌ Missing job_id")  # Debugging log
            return JsonResponse({"error": "Missing job_id"}, status=400)
        
        if not hr_id:
            print("❌ Missing hr_id")  # Debugging log
            return JsonResponse({"error": "Missing hr_id"}, status=400)

        job_applied_collection = db1["JobApplied"]
        print(f"✅ Job ID: {job_id}, User ID: {user_id}, HR ID: {hr_id}")  # Debugging log

        # Check if job is already applied by this user
        existing_application = job_applied_collection.find_one({
            "user_id": str(user_id),
            "job_id": job_id
        })

        if existing_application:
            print("🔹 Unapplying job...")
            job_applied_collection.delete_one({"_id": existing_application["_id"]})
            return JsonResponse({"status": "unapplied"})
        else:
            print("✅ Applying for job...")
            job_applied_collection.insert_one({
                "user_id": str(user_id),
                "job_id": job_id,
                "hr_id": hr_id,  # Storing HR ID
                "applied_at": datetime.datetime.now()
            })
            return JsonResponse({"status": "applied"})

    return JsonResponse({"error": "Invalid request"}, status=400)

        
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
    profile_picture = user_data.get("profile_picture", None)
    mobile = user_data.get("mobile", "N/A")
    location = user_data.get("location", "N/A")
    tenth_school = user_data.get("10th_school", "N/A")
    tenth_board = user_data.get("10th_board", "N/A")
    tenth_passout_year = user_data.get("10th_passout_year", "N/A")
    twelfth_school = user_data.get("12th_school", "N/A")
    twelfth_board = user_data.get("12th_board", "N/A")
    twelfth_passout_year = user_data.get("12th_passout_year", "N/A")
    twelfth_percentage = user_data.get("12th_Percentage", "N/A")
    skills = user_data.get("skills", [])  # Fetch skills from user document
  
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
    "mobile": mobile,
    "location": location,
    "tenth_school": tenth_school,
    "tenth_board": tenth_board,
    "tenth_year": tenth_passout_year,
    "twelfth_school": twelfth_school,
    "twelfth_board": twelfth_board,
    "twelfth_year": twelfth_passout_year,
    "twelfth_percentage": twelfth_percentage,
    "skills": skills,  # Include skills in the response 
       
    }]
    return JsonResponse({"success": True, "data": data})
import json
import base64
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from pymongo import MongoClient


# @csrf_exempt
# @require_POST
# def update_profile(request):
#     try:
#         user = request.user  
#         if not user.is_authenticated:  
#             return JsonResponse({"status": "error", "message": "User not authenticated"}, status=401)

#         # Check if request is multipart/form-data (for file upload)
#         if request.content_type.startswith('multipart/form-data'):
#             data = request.POST.dict()  # Convert form data to dict
#             profile_picture = request.FILES.get("profile_picture")  # Get uploaded file
#         else:
#             try:
#                 data = json.loads(request.body.decode("utf-8"))
#                 profile_picture = None
#             except json.JSONDecodeError:
#                 return JsonResponse({"status": "error", "message": "Invalid JSON data"}, status=400)

#         print(f"Received data: {data}")  # Debugging

#         # Fetch user data from MongoDB
#         user_data = auth_user_collection.find_one({"username": user.username})

#         if not user_data:
#             return JsonResponse({"status": "error", "message": "User profile not found"}, status=404)

#         # Field mappings
#         field_mappings = {
#             "name": "username",
#             "email": "email",
#             "father_name": "father_name",
#             "ug_college": "ug_college",
#             "branch": "branch",
#             "passout_year": "Passout_Year",
#             "graduation_percentage": "Graduation_Percentage",
#             "tenth_percentage": "10th_Percentage",
#             "twelfth_percentage": "12th_Percentage",
#         }

#         update_data = {}
#         for frontend_field, db_field in field_mappings.items():
#             new_value = data.get(frontend_field, "").strip()
#             old_value = str(user_data.get(db_field, "")).strip()

#             if new_value and new_value != old_value:
#                 update_data[db_field] = new_value

#         # **Handle profile picture upload**
#         if profile_picture:
#             image_data = profile_picture.read()  # Read the image file
#             encoded_image = base64.b64encode(image_data).decode("utf-8")  # Convert to Base64
#             update_data["profile_picture"] = encoded_image  # Store in MongoDB

#         # print(f"Changes detected: {update_data}")  # Debugging

#         if not update_data:
#             return JsonResponse({"status": "success", "message": "No changes detected."})

#         # Update user profile in MongoDB
#         result = auth_user_collection.update_one(
#             {"username": user.username},
#             {"$set": update_data}
#         )

#         print(f"Update result: {result.modified_count} document(s) modified.")  # Debugging

#         return JsonResponse({"status": "success", "message": "Profile updated successfully!"})

#     except Exception as e:
#         print(f"Error updating profile: {e}")  # Debugging
#         return JsonResponse({"status": "error", "message": str(e)}, status=500)
    
#     from django.shortcuts import render
# from django.contrib.auth.decorators import login_required


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

        # print(f"Received data: {data}")  # Debugging

        # Fetch user data from MongoDB
        user_data = auth_user_collection.find_one({"username": user.username})

        if not user_data:
            return JsonResponse({"status": "error", "message": "User profile not found"}, status=404)

        # Field mappings for personal information
        field_mappings = {
            "username": "username",  # Match the name attribute in the form
            "email": "email",  # Match the name attribute in the form
            "father_name": "father_name",  # Match the name attribute in the form
            "mobile": "mobile",  # Match the name attribute in the form
            "location": "location",  # Match the name attribute in the form
            "tenth_school": "10th_school",  # Match the name attribute in the form
            "tenth_board": "10th_board",  # Match the name attribute in the form  
            "tenth_year": "10th_passout_year",  # Match the name attribute in the form
            "twelfth_school": "12th_school",  # Match the name attribute in the form
            "twelfth_board": "12th_board",  # Match the name attribute in the form
            "twelfth_year": "12th_passout_year",  # Match the name attribute in
            "twelfth_percentage": "12th_Percentage",  # Match the name attribute in the form
            
        }

        update_data = {}
        for frontend_field, db_field in field_mappings.items():
            new_value = data.get(frontend_field, "").strip()
            old_value = str(user_data.get(db_field, "")).strip()

            if new_value and new_value != old_value:
                update_data[db_field] = new_value

        # Handle profile picture upload
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

        # print(f"Update result: {result.modified_count} document(s) modified.")  # Debugging

        return JsonResponse({"status": "success", "message": "Profile updated successfully!"})

    except Exception as e:
        print(f"Error updating profile: {e}")  # Debugging
        return JsonResponse({"status": "error", "message": str(e)}, status=500)
@login_required
def profile_page(request):
    """
    View to render the profile page HTML
    """
    return render(request, 'profile.html')


from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def add_skill(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        skill = data.get('skill')
        user = request.user
        auth_user_collection.update_one(
            {"id": user.id},
            {"$push": {"skills": skill}}
        )
        return JsonResponse({"success": True, "skill": skill})
    return JsonResponse({"success": False, "error": "Invalid request method"})


@csrf_exempt
def remove_skill(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        skill = data.get('skill')
        user = request.user
        auth_user_collection.update_one(
            {"id": user.id},
            {"$pull": {"skills": skill}}
        )
        return JsonResponse({"success": True, "skill": skill})
    return JsonResponse({"success": False, "error": "Invalid request method"})


from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

from django.http import JsonResponse
from bson import ObjectId
# def get_projects(request):
#     user_id = request.GET.get('user_id')
#     print(f"Fetching projects for user_id: {user_id}")  # Debugging
#     projects = list(Experience.find({"user_id": user_id}))
#     print(f"Projects found: {projects}")  # Debugging
#     for project in projects:
#         project['_id'] = str(project['_id'])
#     return JsonResponse({"success": True, "data": projects})

import json
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
@csrf_exempt
def add_project(request):
    if request.method == 'POST':
        try:
            # Parse the request body
            data = json.loads(request.body)
            print("Received data:", data)  # Debugging: Print received data

            # Add the user_id to the data
            data['user_id'] = request.user.id  # Ensure the user is authenticated

            # Remove _id field if it exists and is empty
            if '_id' in data and data['_id'] == '':
                del data['_id']

            # Insert the project into the database
            result = Experience.insert_one(data)
            print("Inserted project ID:", result.inserted_id)  # Debugging: Print inserted ID

            return JsonResponse({"success": True, "inserted_id": str(result.inserted_id)})
        except Exception as e:
            print("Error:", str(e))  # Debugging: Print any errors
            return JsonResponse({"success": False, "error": str(e)})
    return JsonResponse({"success": False, "error": "Invalid request method"})
@csrf_exempt
def update_project(request):
    try:
        data = json.loads(request.body)
        project_id = data.pop('_id', None)  # Ensure _id exists

        if not project_id:
            return JsonResponse({"success": False, "error": "Project ID is required"}, status=400)

        Experience.update_one({"_id": ObjectId(project_id)}, {"$set": data})

        return JsonResponse({"success": True})
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)

@csrf_exempt
@login_required
def delete_project(request):
    try:
        if request.method != 'DELETE':
            return JsonResponse({"success": False, "error": "Invalid request method"}, status=405)

        data = json.loads(request.body)  # ✅ Read JSON body instead of request.GET
        project_id = request.GET.get('project_id')

        if not project_id:
            return JsonResponse({"success": False, "error": "Project ID is missing"}, status=400)

        if not (isinstance(project_id, str) and len(project_id) == 24 and all(c in "0123456789abcdefABCDEF" for c in project_id)):
            return JsonResponse({"success": False, "error": "Invalid ObjectId format"}, status=400)

        result = Experience.delete_one({"_id": ObjectId(project_id)})
        if result.deleted_count == 0:
            return JsonResponse({"success": False, "error": "Project not found"}, status=404)

        return JsonResponse({"success": True})

    except json.JSONDecodeError:
        return JsonResponse({"success": False, "error": "Invalid JSON format"}, status=400)

    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)


@login_required
@csrf_exempt
def get_projects(request):
    user_id = request.GET.get('user_id')

    if not user_id:
        return JsonResponse({"success": False, "error": "user_id is required"}, status=400)

    # Ensure user_id is of correct type
    if user_id.isdigit():
        user_id = int(user_id)

    print(f"Fetching projects for user_id: {user_id}")

    try:
        projects = list(Experience.find({"user_id": user_id}, {"_id": 0}))  # Exclude _id from response
        print(f"Projects found: {projects}")

        return JsonResponse({"success": True, "data": projects}, status=200)
    
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)
   

@csrf_exempt
@login_required
def get_project(request):
    try:
        project_id = request.GET.get('project_id')
        print(project_id)

        if not project_id or project_id == "undefined":
            return JsonResponse({"success": False, "error": "Project ID is required and cannot be 'undefined'"}, status=400)

        if not (isinstance(project_id, str) and len(project_id) == 24 and all(c in "0123456789abcdefABCDEF" for c in project_id)):
            return JsonResponse({"success": False, "error": "Invalid ObjectId format"}, status=400)

        project = Experience.find_one({"_id": ObjectId(project_id)})
        if not project:
            return JsonResponse({"success": False, "error": "Project not found"}, status=404)

        project['_id'] = str(project['_id'])
        return JsonResponse({"success": True, "data": project})
    
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)
    
    
    
    
    # hr pannel
    
    
    # views.py

from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from bson.objectid import ObjectId
import json
from datetime import datetime

# Create your HR dashboard view




# @login_required
# def hr_dashboard(request):
#     if not request.session.get('hr_id'):
#         messages.error(request, "You need to log in as an HR to access this page.")
#         return redirect('hr_login')
    
#     hr_id = request.session.get('hr_id')
#     print(f"HR ID: {hr_id}")
    
#     # Fetch jobs created by the current HR
#     hr_jobs = list(job_collection.find({"hr_id": hr_id}))
#     print(hr_jobs)
    
#     # Convert ObjectId to string for each job
#     for job in hr_jobs:
#         job['_id'] = str(job['_id'])
        
#         # Convert Skills to list if it's a string
#         if 'Skills' in job and isinstance(job['Skills'], str):
#             job['Skills'] = [skill.strip() for skill in job['Skills'].split(',')]
        
#         # Count applicants for each job
#         job['applicants_count'] = job_applied_collection.count_documents({"job_id": str(job['_id'])})
    
#     # Fetch job applications for jobs created by this HR
#     job_ids = [job['_id'] for job in hr_jobs]
#     applications = list(job_applied_collection.find({"job_id": {"$in": job_ids}}))
    
#     job_applications = []
#     for app in applications:
#         # Get job details
#         job = job_collection.find_one({"_id": ObjectId(app['job_id'])})
        
#         if job:
#             # Get user details
#             user_details = auth_user_collection.find_one({"id": int(app['user_id'])})
#             user = User.objects.get(id=int(app['user_id']))
            
#             # Format user data
#             user_data = {
#                 "father_name": user_details.get("father_name", "N/A"),
#                 "progress": user_details.get("progress", "N/A"),
#                 "branch": user_details.get("branch", "N/A"),
#                 "Passout_Year": user_details.get("Passout_Year", "N/A"),
#                 "Graduation_Percentage": user_details.get("Graduation_Percentage", "N/A"),
#                 "Percentage_10": user_details.get("10th_Percentage", "N/A"),
#                 "Percentage_12": user_details.get("12th_Percentage", "N/A")
#             }
            
#             job_applications.append({
#                 "id": str(app['_id']),
#                 "job_id": app['job_id'],
#                 "job_title": job.get('title', 'Unknown Position'),
#                 "user_id": app['user_id'],
#                 "user": user,
#                 "user_data": user_data,
#                 "applied_date": app.get('applied_date', datetime.now()),
#                 "status": app.get('status', 'pending')
#             })
    
#     return render(request, 'hr.html', {
#         'hr_jobs': hr_jobs,
#         'job_applications': job_applications
#     })
    
    
    

# Create a new job
@login_required
def create_job(request):
    if request.method == 'POST':
        hr_id = request.session.get('hr_id')
        if not hr_id:
            messages.error(request, "You need to be logged in as an HR to create jobs.")
            return redirect('hr_login')
        
        # Get form data
        job_data = {
            'Job': request.POST.get('title'),
            'Org': request.POST.get('company'),
            'Location': request.POST.get('location'),
            'Salary': request.POST.get('salary'),
            'job_type': request.POST.get('job_type'),
            'experience': request.POST.get('experience'),
            'Skills': request.POST.get('Skills'),
            'FullDescription': request.POST.get('description'),
            'education': request.POST.get('education'),
            'deadline': request.POST.get('deadline'),
            'hr_id': hr_id,
            'posted_date': datetime.datetime.now()
        }
        
        # Insert into MongoDB
        job_collection.insert_one(job_data)
        
        messages.success(request, "Job posting created successfully!")
        return redirect('hr_panel')
    
    return redirect('hr_panel')

from bson import ObjectId
import datetime
from django.contrib import messages
from django.shortcuts import redirect
from django.contrib.auth.decorators import login_required
# update the job
@login_required
def update_job(request):
    if request.method == 'POST':
        hr_id = request.session.get('hr_id')
        job_id = request.POST.get('job_id')

        if not hr_id:
            messages.error(request, "You need to be logged in as an HR to update jobs.")
            return redirect('hr_login')

        if not job_id:
            messages.error(request, "Job ID is missing.")
            return redirect('hr_panel')

        try:
            job_object_id = ObjectId(job_id)
        except Exception as e:
            messages.error(request, "Invalid Job ID format.")
            return redirect('hr_panel')

        # Check if the job exists and belongs to HR
        job = job_collection.find_one({"_id": job_object_id, "hr_id": hr_id})
        if not job:
            messages.error(request, "You can only edit jobs that you've created.")
            return redirect('hr_panel')

        # Update job data
        update_data = {
            'title': request.POST.get('title'),
            'company': request.POST.get('company'),
            'location': request.POST.get('location'),
            'salary': request.POST.get('salary'),
            'job_type': request.POST.get('job_type'),
            'experience': request.POST.get('experience'),
            'Skills': request.POST.get('Skills'),
            'description': request.POST.get('description'),
            'education': request.POST.get('education'),
            'deadline': request.POST.get('deadline'),
            'updated_at': datetime.datetime.now()
        }

        job_collection.update_one({"_id": job_object_id}, {"$set": update_data})
        messages.success(request, "Job posting updated successfully!")
        return redirect('hr_panel')

    return redirect('hr_panel')
from django.http import JsonResponse
from bson import ObjectId

def get_job_data(request, job_id):
    try:
        job_object_id = ObjectId(job_id)
        job = job_collection.find_one({"_id": job_object_id})
        if job:
            job['_id'] = str(job['_id'])  # Convert ObjectId to string
            return JsonResponse(job)
        else:
            return JsonResponse({"error": "Job not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect
from bson import ObjectId
# delete jobs
@login_required
def delete_job(request):
    if request.method == 'POST':
        hr_id = request.session.get('hr_id')
        job_id = request.POST.get('job_id')  # Ensure this matches the form field name
        print(f"HR ID: {hr_id}")
        print(f"Job ID from form: {job_id}")
        
        if not hr_id:
            messages.error(request, "You need to be logged in as an HR to delete jobs.")
            return redirect('hr_login')
        
        if not job_id:
            messages.error(request, "No job ID provided for deletion.")
            return redirect('hr_panel')
            
        try:
            # Convert job_id to ObjectId for MongoDB query
            job_id_obj = ObjectId(job_id)
            print(f"Successfully converted to ObjectId: {job_id_obj}")
            
            # Check if the job belongs to this HR
            job = job_collection.find_one({"_id": job_id_obj, "hr_id": hr_id})
            print(f"Job found: {job is not None}")
            
            if not job:
                messages.error(request, "You can only delete jobs that you've created.")
                return redirect('hr_panel')
            
            # Delete job
            result = job_collection.delete_one({"_id": job_id_obj})
            print(f"Delete result: {result.deleted_count} document(s) deleted")
            
            # Delete related applications
            app_result = job_applied_collection.delete_many({"job_id": str(job_id_obj)})
            print(f"Applications deleted: {app_result.deleted_count}")
            
            messages.success(request, "Job posting and related applications deleted successfully!")
        except Exception as e:
            messages.error(request, f"Error deleting job: {str(e)}")
            print(f"Error in delete_job: {str(e)}")
        
        return redirect('hr_panel')
    
    return redirect('hr_panel')
# Get job details for editing
@login_required
def get_job_details(request, job_id):
    hr_id = request.session.get('hr_id')
    
    if not hr_id:
        return JsonResponse({"error": "Not authorized"}, status=401)
    
    # Fetch job details
    job = job_collection.find_one({"_id": ObjectId(job_id), "hr_id": hr_id})
    
    if not job:
        return JsonResponse({"error": "Job not found or not authorized"}, status=404)
    
    # Convert ObjectId to string for JSON serialization
    job['_id'] = str(job['_id'])
    
    return JsonResponse(job)

# Update application status
@login_required
def update_application_status(request):
    if request.method == 'POST':
        hr_id = request.session.get('hr_id')
        application_id = request.POST.get('application_id')
        status = request.POST.get('status')
        
        if not hr_id:
            return JsonResponse({"error": "Not authorized"}, status=401)
        
        # Update application status
        application = job_applied_collection.find_one({"_id": ObjectId(application_id)})
        
        if not application:
            return JsonResponse({"error": "Application not found"}, status=404)
        
        # Check if the job belongs to this HR
        job = job_collection.find_one({"_id": ObjectId(application['job_id']), "hr_id": hr_id})
        
        if not job:
            return JsonResponse({"error": "Not authorized to update this application"}, status=401)
        
        # Update status
        job_applied_collection.update_one(
            {"_id": ObjectId(application_id)},
            {"$set": {"status": status, "updated_at": datetime.now()}}
        )
        
        return JsonResponse({"success": True, "message": f"Application marked as {status}"})
    
    return JsonResponse({"error": "Method not allowed"}, status=405)

# Contact applicant
@login_required
def contact_applicant(request):
    if request.method == 'POST':
        hr_id = request.session.get('hr_id')
        applicant_email = request.POST.get('applicant_email')
        subject = request.POST.get('subject')
        message = request.POST.get('message')
        
        if not hr_id:
            messages.error(request, "You need to be logged in as an HR to contact applicants.")
            return redirect('hr_login')
        
        # Get HR details for the "from" address
        hr = hr_collection.find_one({"_id": ObjectId(hr_id)})
        
        if not hr:
            messages.error(request, "HR information not found.")
            return redirect('hr_dashboard')
        
        # Here you would integrate with your email sending functionality
        # For example:
        # send_email(
        #     from_email=hr.get('email'),
        #     to_email=applicant_email,
        #     subject=subject,
        #     message=message
        # )
        
        # For now, we'll just show a success message
        messages.success(request, f"Message sent to {applicant_email} successfully!")
        return redirect('hr_dashboard')
    
    return redirect('hr_dashboard')

# HR logout
def hr_logout(request):
    logout(request)
    if 'hr_username' in request.session:
        del request.session['hr_username']
    if 'hr_id' in request.session:
        del request.session['hr_id']
    return redirect('hr_login')




from bson import ObjectId
from django.shortcuts import render, redirect

def hr_panel_view(request):
    # Check if user is logged in as HR
    if not request.session.get('hr_id'):
        return redirect('loginhr')

    hr_id = request.session.get('hr_id')
    print(f"HR ID: {hr_id}")
    # Fetch jobs created by this HR
    hr_jobs = list(job_collection.find({"hr_id": hr_id}))

    # Process Skills field and convert `_id` to string
    for job in hr_jobs:
        job['id'] = str(job['_id'])  # Convert ObjectId to string

        if 'Skills' in job and isinstance(job['Skills'], str):
            job['Skills'] = [skill.strip() for skill in job['Skills'].split(',')]

        # Count applicants for each job
        job['applicants_count'] = job_applied_collection.count_documents({"job_id": job['id']})

    # Fetch applications for jobs posted by this HR
    pipeline = [
        {"$match": {"hr_id": hr_id}},  # Match jobs created by this HR
        {"$lookup": {
            "from": "job_applied",
            "localField": "_id",
            "foreignField": "job_id",
            "as": "applications"
        }},
        {"$unwind": "$applications"},  # Unwind applications array
        {"$lookup": {
            "from": "auth_user",
            "localField": "applications.user_id",
            "foreignField": "id",
            "as": "user"
        }},
        {"$unwind": "$user"},  # Unwind user array
        {"$project": {
            "job_title": "$title",
            "application_id": {"$toString": "$applications._id"},  # Convert ObjectId to string
            "user_id": "$applications.user_id",
            "applied_date": "$applications.applied_date",
            "status": "$applications.status",
            "user": {
                "username": "$user.username",
                "email": "$user.email",
                "father_name": "$user.father_name",
                "progress": "$user.progress",
                "branch": "$user.branch",
                "Passout_Year": "$user.Passout_Year",
                "Graduation_Percentage": "$user.Graduation_Percentage",
                "Percentage_10": "$user.10th_Percentage",
                "Percentage_12": "$user.12th_Percentage"
            }
        }}
    ]

    job_applications = list(job_collection.aggregate(pipeline))

    # Debugging: Print the fetched data
    print("Job Applications:", job_applications)

    context = {
        'hr_jobs': hr_jobs,
        'job_applications': job_applications
    }

    return render(request, 'hr.html', context)