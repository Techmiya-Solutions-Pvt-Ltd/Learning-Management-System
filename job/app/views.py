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
        project_id = data.get('project_id')

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
