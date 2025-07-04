from django.shortcuts import render, redirect
import requests
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from pymongo import MongoClient
from django.http import HttpResponseForbidden
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from bson import ObjectId
import json
from datetime import datetime, timedelta
import datetime as dt
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import login, authenticate
import jwt
import datetime
from django.conf import settings
from rest_framework.decorators import api_view





url = 'mongodb+srv://kmnaveen777:naveen@atlas.eokhe.mongodb.net/'
url_hr='mongodb+srv://pavankumar9686323614:job@job-portal.m1m85.mongodb.net/'

#clients
client = MongoClient(url)
client_hr = MongoClient(url_hr)


#databases
db_hr = client_hr["test_mongo"]
db = client["test_mongo"]  



teacher_collection = db["auth_teachers"] 
users_collection = db["auth_user"]
hr_collection = db_hr["authhr"]
admin_collection = db["auth_admin"]
questions_collection = db["questions"] 
results_collection=db["Results"]
answers_collection=db["Answers"]
courses_collection = db['courses']
blog_collection = db['blog']
blogs= db['blogs']
deleted_question_collection=db["DeletedQuestions"]
deleted_courses_collection=db["DeletedCourses"]
content_types_collection = db['content_types']
deleted_blogs_collection=db['deleted_blogs']
deleted_tests_collection=db["deleted_tests"]
deleted_hr_collection = db_hr["deleted_hr"]
deleted_user_collection = db["deleted_auth_user"]
job_collection = db_hr["Joblist"]
Job_applied_collection = db_hr["JobApplied"]
Api_Job_collection = db_hr["apijob"]
reviews= db["review"]






def index(request):
    return render(request, 'authunticate.html')

def admin_dashboard_stats(request):
    try:
        # Count all collections
        total_users = db.auth_user.count_documents({})
        total_teachers = db.auth_teachers.count_documents({})
        total_hr = db_hr.authhr.count_documents({})
        total_courses = db.courses.count_documents({"is_active": True})
        total_blogs = db.blog.count_documents({})
        total_questions = db.questions.count_documents({})
        
        # Count new users in last 30 days
        thirty_days_ago = datetime.now() - timedelta(days=30)
        new_users = db.auth_user.count_documents({
            "date_joined": {"$gte": thirty_days_ago}
        })
        
        
        revenue = 24800 + (new_users * 10)  # Base + $10 per new user
        
        return JsonResponse({
            'total_users': total_users,
            'total_teachers': total_teachers,
            'total_hr': total_hr,
            'total_courses': total_courses,
            'total_blogs': total_blogs,
            'total_questions': total_questions,
            'new_users': new_users,
            'revenue': revenue,
            'success': True
        })
    except Exception as e:
        return JsonResponse({'error': str(e), 'success': False}, status=500)

def user_growth_data(request):
    try:
        # Get user growth for last 6 months
        data = []
        months = 6
        
        for i in range(months):
            start_date = datetime.datetime.now() - timedelta(days=30*(months-i))
            end_date = datetime.datetime.now() - timedelta(days=30*(months-i-1))
            
            count = db.auth_user.count_documents({
                "date_joined": {
                    "$gte": start_date,
                    "$lt": end_date
                }
            })
            
            data.append({
                'name': start_date.strftime('%b'),
                'users': count
            })
        
        return JsonResponse({'data': data, 'success': True})
    except Exception as e:
        return JsonResponse({'error': str(e), 'success': False}, status=500)

def traffic_sources(request):
    try:
        # For demo, we'll simulate traffic sources
        # In a real app, you'd get this from analytics
        return JsonResponse({
            'data': [
                {'name': 'Web', 'value': 65},
                {'name': 'Mobile', 'value': 35}
            ],
            'success': True
        })
    except Exception as e:
        return JsonResponse({'error': str(e), 'success': False}, status=500)

def system_status(request):
    try:
        # Simulate system status
        # In a real app, you'd get this from monitoring tools
        return JsonResponse({
            'data': [
                {'name': 'CPU Usage', 'value': '24%', 'trend': 'down'},
                {'name': 'Memory', 'value': '3.2/8GB', 'trend': 'stable'},
                {'name': 'Storage', 'value': '45%', 'trend': 'up'},
                {'name': 'Uptime', 'value': '99.9%', 'trend': 'stable'}
            ],
            'success': True
        })
    except Exception as e:
        return JsonResponse({'error': str(e), 'success': False}, status=500)
# def system_status(request):
#     try:
#         # 1. Calculate document counts and estimate storage
#         user_count = db.auth_user.count_documents({})
#         teacher_count = db.auth_teachers.count_documents({})
#         course_count = db.courses.count_documents({})
#         blog_count = db.blog.count_documents({})
#         question_count = db.questions.count_documents({})
        
#         # 2. Estimate storage usage (adjust these weights based on your actual document sizes)
#         estimated_sizes = {
#             'users': user_count * 2,      # KB per user (adjust based on your schema)
#             'teachers': teacher_count * 3, # KB per teacher
#             'courses': course_count * 10,  # KB per course (courses are larger)
#             'blogs': blog_count * 15,      # KB per blog
#             'questions': question_count * 5 # KB per question
#         }
        
#         total_used_kb = sum(estimated_sizes.values())
#         total_used_gb = round(total_used_kb / (1024 * 1024), 2)  # Convert to GB
        
#         # 3. Get actual storage stats from MongoDB (requires admin privileges)
#         storage_stats = db.command('dbStats')
#         storage_used_bytes = storage_stats.get('storageSize', 0)
#         storage_used_gb = round(storage_used_bytes / (1024 ** 3), 2)
        
#         # 4. Calculate percentages (assuming 100GB total storage for example)
#         total_storage_gb = 100  # Adjust this to your actual storage capacity
#         storage_percent = min(100, round((storage_used_gb / total_storage_gb) * 100, 2))
        
#         # 5. Get memory usage from system
#         import psutil
#         memory = psutil.virtual_memory()
#         memory_used = round(memory.used / (1024 ** 3), 1)
#         memory_total = round(memory.total / (1024 ** 3), 1)
#         memory_percent = memory.percent
        
#         # 6. CPU usage
#         cpu_percent = psutil.cpu_percent(interval=1)
        
#         # 7. Uptime (server uptime)
#         uptime_seconds = psutil.boot_time()
#         uptime_days = round((time.time() - uptime_seconds) / (24 * 3600), 1)
        
#         return JsonResponse({
#             'data': [
#                 {
#                     'name': 'CPU Usage',
#                     'value': f'{cpu_percent}%',
#                     'trend': 'down' if cpu_percent < 30 else 'up' if cpu_percent > 70 else 'stable'
#                 },
#                 {
#                     'name': 'Memory',
#                     'value': f'{memory_used}/{memory_total}GB ({memory_percent}%)',
#                     'trend': 'stable'
#                 },
#                 {
#                     'name': 'Storage',
#                     'value': f'{storage_percent}% ({storage_used_gb}GB used of {total_storage_gb}GB)',
#                     'trend': 'up' if storage_percent > 80 else 'stable',
#                     'breakdown': {
#                         'users': f'{user_count} users ({estimated_sizes["users"]}KB)',
#                         'teachers': f'{teacher_count} teachers ({estimated_sizes["teachers"]}KB)',
#                         'courses': f'{course_count} courses ({estimated_sizes["courses"]}KB)',
#                         'blogs': f'{blog_count} blogs ({estimated_sizes["blogs"]}KB)',
#                         'questions': f'{question_count} questions ({estimated_sizes["questions"]}KB)'
#                     }
#                 },
#                 {
#                     'name': 'Uptime',
#                     'value': f'{uptime_days} days',
#                     'trend': 'stable'
#                 },
#                 {
#                     'name': 'Collections Summary',
#                     'value': '',
#                     'details': {
#                         'total_users': user_count,
#                         'total_teachers': teacher_count,
#                         'total_courses': course_count,
#                         'total_blogs': blog_count,
#                         'total_questions': question_count
#                     }
#                 }
#             ],
#             'success': True
#         })
        
#     except Exception as e:
#         return JsonResponse({
#             'error': str(e),
#             'success': False
#         }, status=500)

def recent_activities(request):
    try:
        activities = []
        
        # 1. Recent user registrations (2 most recent)
        recent_users = list(db.auth_user.find(
            {"date_joined": {"$exists": True}}
        ).sort("date_joined", -1).limit(2))
        
        for user in recent_users:
            activities.append({
                'action': 'New user registration',
                'time': user['date_joined'].isoformat(),
                'user': user.get('username', f"User {user['_id']}"),
                'type': 'registration',
                'icon': 'user-plus'
            })
        
        # 2. Recent logins (2 most recent, requires last_login field)
        recent_logins = list(db.auth_user.find(
            {"last_login": {"$exists": True}}
        ).sort("last_login", -1).limit(2))
        
        for user in recent_logins:
            activities.append({
                'action': 'User login',
                'time': user['last_login'].isoformat(),
                'user': user.get('username', f"User {user['_id']}"),
                'type': 'login',
                'icon': 'log-in',
                'ip': user.get('last_login_ip', 'Unknown')  # Add this field in your login handler
            })
        
        # 3. Recent course creations (2 most recent)
        recent_courses = list(db.courses.find().sort("created_at", -1).limit(2))
        for course in recent_courses:
            # Try to get teacher name if available
            teacher = db.auth_teachers.find_one(
                {"_id": ObjectId(course['teacher_id'])},
                {"username": 1}
            ) if 'teacher_id' in course else None
            
            activities.append({
                'action': 'New course created',
                'time': course['created_at'].isoformat(),
                'user': teacher['username'] if teacher else f"Teacher {course['teacher_id']}",
                'type': 'course',
                'icon': 'book',
                'title': course.get('title', 'Untitled Course')
            })
        
        # 4. Recent blog posts (2 most recent)
        recent_blogs = list(db.blog.find().sort("created_at", -1).limit(2))
        for blog in recent_blogs:
            author = db.auth_user.find_one(
                {"_id": ObjectId(blog['author_id'])},
                {"username": 1}
            ) if 'author_id' in blog else None
            
            activities.append({
                'action': 'New blog post',
                'time': blog['created_at'].isoformat(),
                'user': author['username'] if author else f"Author {blog.get('author_id', 'Unknown')}",
                'type': 'blog',
                'icon': 'edit-3',
                'title': blog.get('title', 'Untitled Post')
            })
        
        # 5. Add more activity types as needed (question submissions, test results, etc.)
        
        # Sort all activities by time (newest first)
        activities.sort(key=lambda x: x['time'], reverse=True)
        
        return JsonResponse({
            'data': activities[:5],  # Return only the 5 most recent
            'success': True
        })
        
    except Exception as e:
        return JsonResponse({
            'error': str(e),
            'success': False
        }, status=500)

import base64
from datetime import datetime
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

@api_view(['POST'])
def create_blog(request):
    try:
        blog_data = request.data
        print("Received blog data:", blog_data)
        
        # Validate required fields
        if not blog_data.get('title'):
            return Response({'error': 'Blog title is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Process file uploads and convert to Base64
        chapters = blog_data.get('chapters', [])
        for chapter in chapters:
            for content in chapter.get('contents', []):
                if content['type'] in ['image', 'video', 'pdf']:
                    if 'file' in content and content['file']:
                        # Convert file to Base64
                        if isinstance(content['file'], str):
                            # If it's already a Base64 string (from frontend)
                            content['file_data'] = content['file']
                        else:
                            # If it's a file object
                            content['file_data'] = base64.b64encode(content['file'].read()).decode('utf-8')
                        del content['file']
                        # Add metadata
                        content['file_name'] = content.get('file_name', 'uploaded_file')
                        content['file_type'] = content['type']
        
        # Process featured image
        featured_image = blog_data.get('featured_image') or ''

        if featured_image and 'file' in featured_image:
            if isinstance(featured_image['file'], str):
                featured_image['file_data'] = featured_image['file']
            else:
                featured_image['file_data'] = base64.b64encode(featured_image['file'].read()).decode('utf-8')
            del featured_image['file']
            featured_image['file_name'] = featured_image.get('file_name', 'featured_image')
            featured_image['file_type'] = 'image'  # Featured image is always an image
        
        # Create blog document
        blog_doc = {
            'title': blog_data['title'],
            'created_at': datetime.now(),
            'updated_at': datetime.now(),
            'author_id': blog_data.get('teacher_id'),
            'chapters': chapters,
            'description': blog_data.get('description', ''),
            'tags': blog_data.get('tags', []),
            'is_published': blog_data.get('is_published', False),
            'featured_image': featured_image,
            'category': blog_data.get('category', 'General'),
            'content_types': blog_data.get('content_types', []),
            'custom_content_types': blog_data.get('custom_content_types', [])
        }
        
        # Insert into MongoDB
        result = blog_collection.insert_one(blog_doc)
        blog_id = str(result.inserted_id)
        
        return Response({
            'message': 'Blog created successfully',
            'blog_id': blog_id
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        import traceback
        print("Error:", traceback.format_exc())
        return Response(
            {'error': f'Failed to create blog: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
# @api_view(['POST'])
# def create_blog(request):
#     try:
#         blog_data = request.data
        
        
#         # Validate required fields
#         if not blog_data.get('title'):
#             return Response({'error': 'Blog title is required'}, status=status.HTTP_400_BAD_REQUEST)
        
#         # Convert the blog data to JSON string for storage
#         blog_json = json.dumps(blog_data)
        
#         # Create blog document
#         blog_doc = {
#             'title': blog_data['title'],
#             'created_at': datetime.datetime.now(),
#             'updated_at': datetime.datetime.now(),
#             'author_id': blog_data.get('teacher_id'),  # Using teacher_id as author_id
#             'blog_data_json': blog_json,
#             'description': blog_data.get('description', ''),
#             'tags': blog_data.get('tags', []),
#             'is_published': blog_data.get('is_published', False),
#             'featured_image': blog_data.get('featured_image', ''),
#             'category': blog_data.get('category', 'General')
#         }
        
#         # Insert into MongoDB
#         result = blog_collection.insert_one(blog_doc)
#         blog_id = str(result.inserted_id)
        
#         return Response({
#             'message': 'Blog created successfully',
#             'blog_id': blog_id
#         }, status=status.HTTP_201_CREATED)
        
#     except Exception as e:
#         import traceback
#         print("Error:", traceback.format_exc())  # Detailed error logging
#         return Response(
#             {'error': f'Failed to create blog: {str(e)}'}, 
#             status=status.HTTP_500_INTERNAL_SERVER_ERROR
#         )

@api_view(['GET'])
def get_test_by_id1(request, id):
    try:
        test = questions_collection.find_one({"_id": ObjectId(id)})
        if not test:
            return Response({"error": "Test not found"}, status=404)
        test['_id'] = str(test['_id'])  # convert ObjectId to string
        return Response(test)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
    
@api_view(['PUT'])
def update_test_by_id(request, id):
    try:
        data = request.data
        data.pop('_id', None)
        result = questions_collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": data}
        )
        if result.matched_count == 0:
            return Response({"error": "Test not found"}, status=404)
        return Response({"message": "Test updated successfully"})
    except Exception as e:
        return Response({"error": str(e)}, status=500)


def get_test_by_id(test_id):
    """Helper function to fetch a test by ID"""
    # Assuming 'test_id' is stored as ObjectId in MongoDB
    return questions_collection.find_one({"_id": ObjectId(test_id)})

@api_view(["GET"])
def view_test(request, id):
    try:
        # Fetch the test by its ID from the database using the helper function
        test = get_test_by_id(id)
        
        if not test:
            return Response({'error': 'Test not found'}, status=status.HTTP_404_NOT_FOUND)

        # Convert ObjectId to string in the test data
        test['_id'] = str(test['_id'])

        # Return the test data
        return Response(test, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': f'Failed to retrieve test: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        
        
def update_test(test_id, test_data):
    """Helper function to update a test"""
    result = questions_collection.update_one(
        {"_id": ObjectId(test_id)},
        {"$set": test_data}
    )
    return result.modified_count > 0  # Return True if update is successful, False otherwise

@api_view(["PUT"])
def edit_test(request, test_id):
    try:
        # Fetch the test by its ID to check if it exists
        test = get_test_by_id(test_id)

        if not test:
            return Response({'error': 'Test not found'}, status=status.HTTP_404_NOT_FOUND)

        # Validate and update the fields
        updated_data = request.data
        update_success = update_test(test_id, updated_data)

        if not update_success:
            return Response({'error': 'Failed to update test'}, status=status.HTTP_400_BAD_REQUEST)

        # Return a success response
        return Response({'message': 'Test updated successfully'}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': f'Failed to update test: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

#hr admin

def serialize_document(doc):
    if isinstance(doc, list):
        return [serialize_document(item) for item in doc]
    elif isinstance(doc, dict):
        return {key: serialize_document(value) for key, value in doc.items()}
    elif isinstance(doc, ObjectId):
        return str(doc)
    elif isinstance(doc, datetime.datetime):
        return doc.isoformat()
    return doc

# GET all HRs
@api_view(['GET'])
def get_all_hrs(request):
    try:
        hrs = list(hr_collection.find().sort("date_joined", -1))
        return Response(serialize_document(hrs), status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
@api_view(['GET'])
def get_all_reviews(request):
    try:
        all_reviews = list(reviews.find())
        serialized = [serialize_document(r) for r in all_reviews]
        return Response({'reviews': serialized}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




# POST - Add new HR
@api_view(['POST'])
def add_hr(request):
    data = request.data
    print("Received data:", data)
    required_fields = ['hrname', 'email', 'first_name', 'last_name', 'password']
    if not all(data.get(field) for field in required_fields):
        return Response({"error_message": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)

    if hr_collection.find_one({"$or": [{"email": data['email']}, {"hrname": data['hrname']}]}) is not None:
        return Response({"error_message": "Email or username already exists"}, status=status.HTTP_400_BAD_REQUEST)

    hashed_password = make_password(data['password'])
    
    hr_data = {
        "hrname": data['hrname'],
        "email": data['email'],
        "first_name": data['first_name'],
        "last_name": data['last_name'],
        "password": hashed_password,
        "is_active": data.get('is_active', True),
        "role": "hr",
        "is_staff": True,
        "date_joined": datetime.datetime.now(),
        "_id": ObjectId(),
        "id": int(str(ObjectId())[:8], 16)
    }

    try:
        hr_collection.insert_one(hr_data)
        return Response({"message": "HR added successfully", "hr_id": str(hr_data["_id"])}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error_message": f"An error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# PUT - Update HR
@api_view(['PUT'])
def update_hr(request, id):
    try:
        data = request.data
        result = hr_collection.update_one({'_id': ObjectId(id)}, {'$set': data})
        if result.matched_count == 0:
            return Response({'error': 'HR not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'message': 'HR updated successfully'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# PATCH - Archive HR (soft delete)
@api_view(['DELETE'])
def archive_hr(request, id):
    try:
        hr = hr_collection.find_one({'_id': ObjectId(id)})
        if not hr:
            return Response({'error': 'HR not found'}, status=status.HTTP_404_NOT_FOUND)

        # Move to archive
        
        deleted_hr_collection.insert_one(hr)
        
        
        
        hr_collection.delete_one({'_id': ObjectId(id)})
        print("hr archived")
        return Response({'message': 'HR archived successfully'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#student retrival for admin


@api_view(['POST'])
def add_student(request):
   
    
    # Basic fields
    username = request.data.get('username', '').strip()
    email = request.data.get('email', '').strip()
    first_name = request.data.get('first_name', '').strip()
    last_name = request.data.get('last_name', '').strip()
    password = request.data.get('password', '')
    is_active = request.data.get('is_active', False)

    # Validate required fields
    if not username or not email or not first_name or not password:
        return Response(
            {"error_message": "All fields are required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check if the email or username already exists
    if (
        users_collection.find_one({"$or": [{"email": email}, {"username": username}]}) or
        teacher_collection.find_one({"$or": [{"email": email}, {"username": username}]}) or
        admin_collection.find_one({"$or": [{"email": email}, {"username": username}]})
    ):
        return Response({"error_message": "Email or username already exists"}, status=status.HTTP_400_BAD_REQUEST)

    # Extra fields
    mobile = request.data.get('mobile', '').strip()
    location = request.data.get('location', '').strip()
    father_name = request.data.get('father_name', '').strip()

    tenth_board = request.data.get('10th_board', '').strip()
    tenth_school = request.data.get('10th_school', '').strip()
    tenth_percentage = request.data.get('10th_Percentage', '').strip()
    tenth_passout_year = request.data.get('10th_passout_year', '').strip()

    twelfth_board = request.data.get('12th_board', '').strip()
    twelfth_school = request.data.get('12th_school', '').strip()
    twelfth_percentage = request.data.get('12th_Percentage', '').strip()
    twelfth_passout_year = request.data.get('12th_passout_year', '').strip()

    graduation_percentage = request.data.get('Graduation_Percentage', '').strip()
    passout_year = request.data.get('Passout_Year', '').strip()
    branch = request.data.get('branch', '').strip()
    ug_college = request.data.get('ug_college', '').strip()

    skills_raw = request.data.get('skills', '')
    print("Skills raw:", len(skills_raw))
    if len(skills_raw)>1:
        
        skills = [s.strip() for s in skills_raw.split(',')] 
    else :
        skills=[]

    # Hash password
    hashed_password = make_password(password)

    student_data = {
        "username": username,
        "email": email,
        "first_name": first_name,
        "last_name": last_name,
        "password": hashed_password,
        "is_active": is_active,
        "role": "student",
        "date_joined": datetime.datetime.now(),
        "_id": ObjectId(),
        "id": int(str(ObjectId())[:8], 16),

        # Extra fields
        "mobile": mobile,
        "location": location,
        "father_name": father_name,

        "10th_board": tenth_board,
        "10th_school": tenth_school,
        "10th_Percentage": tenth_percentage,
        "10th_passout_year": tenth_passout_year,

        "12th_board": twelfth_board,
        "12th_school": twelfth_school,
        "12th_Percentage": twelfth_percentage,
        "12th_passout_year": twelfth_passout_year,

        "Graduation_Percentage": graduation_percentage,
        "Passout_Year": passout_year,
        "branch": branch,
        "ug_college": ug_college,

        "skills": skills
    }

    try:
        users_collection.insert_one(student_data)
        return Response(
            {"message": "Student added successfully", "student_id": str(student_data["_id"])},
            status=status.HTTP_201_CREATED
        )
    except Exception as e:
        return Response(
            {"error_message": f"An error occurred: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def serialize_document(doc):
    from datetime import datetime
    if isinstance(doc, list):
        return [serialize_document(item) for item in doc]
    elif isinstance(doc, dict):
        return {key: serialize_document(value) for key, value in doc.items()}
    elif isinstance(doc, ObjectId):
        return str(doc)
    elif isinstance(doc, datetime):
        return doc.isoformat()
    
    
    return doc

@api_view(['GET'])
def get_all_students(request):
    
    try:
        
        students = list(users_collection.find())
        students_serialized = [serialize_document(student) for student in students]
        return Response(students_serialized, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
# Update a student
@api_view(['PUT'])
def update_student(request, student_id):
    try:
        data = request.data
        result = users_collection.update_one({'_id': ObjectId(student_id)}, {'$set': data})
        if result.matched_count == 0:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'message': 'Student updated successfully'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    




# Archive a student (move to deleted_user_collection)
@api_view(['DELETE'])

def archive_student(request, student_id):
    try:
        student = users_collection.find_one({'_id': ObjectId(student_id)})
        
        if not student:
            return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
        
        deleted_user_collection.insert_one(student)
        users_collection.delete_one({'_id': ObjectId(student_id)})

        return Response({'message': 'Student archived successfully'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#teacher admin view


@api_view(['GET'])
def get_all_teachers(request):
    try:
        teachers = list(teacher_collection.find())
        return Response([serialize_document(t) for t in teachers], status=200)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
def add_teacher(request):
    data = request.data
    required = ['username', 'email', 'first_name', 'last_name', 'password']
    if not all(data.get(f, '').strip() for f in required):
        return Response({"error": "All fields are required"}, status=400)
    
    if teacher_collection.find_one({"$or": [{"email": data['email']}, {"username": data['username']}]}):
        return Response({"error": "Email or username already exists"}, status=400)

    data['password'] = make_password(data['password'])
    data['role'] = 'teacher'
    data['is_active'] = data.get('is_active', True)
    data['_id'] = ObjectId()
    teacher_collection.insert_one(data)
    return Response({"message": "Teacher added"}, status=201)

    
@api_view(['PUT'])
def update_teacher(request, teacher_id):
    try:
        data = request.data.copy()
        data.pop('_id', None) 

        result = teacher_collection.update_one({'_id': ObjectId(teacher_id)}, {'$set': data})

        if result.matched_count == 0:
            return Response({'error': 'Teacher not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'message': 'Teacher updated successfully'}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
def archive_teacher(request, teacher_id):
    try:
        teacher = teacher_collection.find_one({'_id': ObjectId(teacher_id)})
        if not teacher:
            return Response({'error': 'Not found'}, status=404)
        deleted_user_collection.insert_one(teacher)
        teacher_collection.delete_one({'_id': ObjectId(teacher_id)})
        return Response({'message': 'Archived'}, status=200)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


# #Course creation

# @api_view(['POST'])
# def create_course(request):
#     try:
#         course_data = request.data
#         print("Received course data:", course_data)  
        
       
#         if not course_data.get('title'):
#             return Response({'error': 'Course title is required'}, status=status.HTTP_400_BAD_REQUEST)
        
       
        
#         course_json = json.dumps(course_data)
        
       
#         course_doc = {
#             'title': course_data['title'],
#             'created_at': datetime.now(),
#             'updated_at': datetime.now(),
#             'teacher_id': course_data.get('teacher_id'),
#             'course_data_json': course_json  
#         }
        
       
#         result = courses_collection.insert_one(course_doc)
#         course_id = str(result.inserted_id)
        
#         return Response({
#             'message': 'Course created successfully',
#             'course_id': course_id
#         }, status=status.HTTP_201_CREATED)
        
#     except Exception as e:
#         import traceback
#         print("Error:", traceback.format_exc())  # Detailed error logging
#         return Response(
#             {'error': f'Failed to create course: {str(e)}'}, 
#             status=status.HTTP_500_INTERNAL_SERVER_ERROR
#         )
#Course creation

@api_view(['POST'])
def create_course(request):
    try:
        course_data = request.data
        print("Received course data:", course_data)
        
        if not course_data.get('title'):
            return Response({'error': 'Course title is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Handle file uploads
        chapters = course_data.get('chapters', [])
        for chapter in chapters:
            for content in chapter.get('contents', []):
                if content['type'] in ['image', 'video', 'pdf']:
                    if 'file' in content and content['file']:
                        # Store the file data directly in the content
                        content['file_data'] = content['file']
                        del content['file']
        
        course_doc = {
            'title': course_data['title'],
            'created_at': datetime.now(),
            'updated_at': datetime.now(),
            'teacher_id': course_data.get('teacher_id'),
            'chapters': chapters,
            'custom_content_types': course_data.get('custom_content_types', [])
        }
        
        result = courses_collection.insert_one(course_doc)
        course_id = str(result.inserted_id)
        
        return Response({
            'message': 'Course created successfully',
            'course_id': course_id
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        import traceback
        print("Error:", traceback.format_exc())
        return Response(
            {'error': f'Failed to create course: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
@api_view(['PUT'])
def update_course(request, course_id):
    try:
        # Get the existing course first
       
        existing_course = courses_collection.find_one({"_id": ObjectId(course_id)})
        if not existing_course:
            return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

        # Parse the incoming data
        update_data = request.data
        
        # Validate required fields
        if not update_data.get('title'):
            return Response({"error": "Course title is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Prepare the course_data_json structure
        course_data_json = {
            "title": update_data.get('title', existing_course.get('title', '')),
            "description": update_data.get('description', existing_course.get('description', '')),
            "teacher_id": update_data.get('teacher_id', existing_course.get('teacher_id')),
            "chapters": update_data.get('chapters', []),
            "custom_content_types": update_data.get('custom_content_types', [])
        }

        # Prepare the update document
        update_doc = {
            "title": update_data.get('title', existing_course.get('title', '')),
            "updated_at": datetime.now(),
            
            
            "course_data_json": json.dumps(course_data_json)
        }

        # Add optional fields if they exist in the update data
        if 'description' in update_data:
            update_doc['description'] = update_data['description']
        if 'teacher_id' in update_data:
            update_doc['teacher_id'] = update_data['teacher_id']
        if 'tags' in update_data:
            update_doc['tags'] = update_data['tags']
        if 'image' in update_data:
            update_doc['image'] = update_data['image']

        # Perform the update
        result = courses_collection.update_one(
            {"_id": ObjectId(course_id)},
            {"$set": update_doc}
        )

        if result.modified_count == 0:
            return Response({"message": "No changes detected"}, status=status.HTTP_200_OK)

        # Fetch the updated course to return
        updated_course = courses_collection.find_one({"_id": ObjectId(course_id)})
        updated_course['_id'] = str(updated_course['_id'])

        return Response({
            "message": "Course updated successfully",
            "course": updated_course
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {"error": f"Failed to update course: {str(e)}"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

from bson import ObjectId
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import json
from datetime import datetime

@api_view(['GET'])
def get_course(request, course_id):
    print(f"Received request for course ID: {course_id}")
    try:
        if not ObjectId.is_valid(course_id):
            return Response({'error': 'Invalid course ID format'}, status=status.HTTP_400_BAD_REQUEST)

        print(f"Searching for course with ID: {course_id}")
        course = courses_collection.find_one({'_id': ObjectId(course_id)})
        
        if not course:
            print("Course not found in database")
            return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Convert ObjectId and datetime objects to strings
        course['_id'] = str(course['_id'])
        if 'created_at' in course:
            course['created_at'] = course['created_at'].isoformat() if isinstance(course['created_at'], datetime) else str(course['created_at'])
        if 'updated_at' in course:
            course['updated_at'] = course['updated_at'].isoformat() if isinstance(course['updated_at'], datetime) else str(course['updated_at'])
        
        # Parse and merge course_data_json if it exists
        if 'course_data_json' in course and course['course_data_json']:
            try:
                json_data = json.loads(course['course_data_json'])
                # Merge the JSON data while preserving original metadata
                merged_data = {
                    **course,
                    **json_data,
                    '_id': course['_id'],
                    'created_at': course['created_at'],
                    'updated_at': course['updated_at'],
                    'teacher_id': course.get('teacher_id')
                }
                course = merged_data
            except json.JSONDecodeError as e:
                print(f"Failed to parse course_data_json: {str(e)}")
                # Continue with original data if parsing fails
        
        # Remove the course_data_json field as we've merged it
        if 'course_data_json' in course:
            del course['course_data_json']
        
        # Ensure chapters and contents exist
        if 'chapters' not in course:
            course['chapters'] = []
        
        # Convert any ObjectIds in chapters/contents
        for chapter in course['chapters']:
            if 'id' in chapter:
                chapter['id'] = str(chapter['id'])
            if 'contents' in chapter:
                for content in chapter['contents']:
                    if 'id' in content:
                        content['id'] = str(content['id'])
        
        print("Processed course data:", course)
        return Response(course, status=status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response(
            {'error': f'Failed to retrieve course: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def get_blogs(request):
    try:
        # Get all courses from MongoDB
        courses = list(blog_collection.find({}))
        parsed_courses = []
        
        for course in courses:
            # Convert MongoDB ObjectId to string
            course['_id'] = str(course['_id'])
            
            # Parse the JSON data back to Python dict
            if 'blog_data_json' in course:
                course_data = json.loads(course['blog_data_json'])
                
                course.update(course_data)
                del course['blog_data_json']
            
            # Get teacher name from users collection
            teacher_fname = "Unknown Teacher"
            teacher_lname = ""
            if 'author_id' in course:
                teacher = teacher_collection.find_one({'_id': ObjectId(course['author_id'])})
                
                if teacher:
                    
                    teacher_fname = teacher.get('name', teacher.get('first_name', 'Unknown Teacher'))
                    teacher_lname = teacher.get('name', teacher.get('last_name', ''))
                course['teacher_name'] = teacher_fname+" "+teacher_lname
            
            
            # Convert datetime objects to strings
            course['created_at'] = str(course.get('created_at'))
            course['updated_at'] = str(course.get('updated_at'))
            
            # Calculate total lessons and chapters
            if 'chapters' in course:
                print("hii")
                total_lessons = sum(len(chapter.get('contents', [])) for chapter in course['chapters'])
                print("Total lessons:", total_lessons)
                
                total_chapters = len(course['chapters'])
                course['total_lessons'] = total_lessons
                course['total_chapters'] = total_chapters
            
            # Add default values for frontend
            course.setdefault('progress', 0)
            course.setdefault('completed_lessons', 0)
            course.setdefault('estimated_hours', course.get('total_lessons', 0) * 0.5)  # 30 mins per lesson
            
            parsed_courses.append(course)

        return Response(parsed_courses, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': f'Failed to retrieve courses: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def get_blog_by_id(request, blog_id):
    try:
        # Find the blog by ID
        blog = blog_collection.find_one({'_id': ObjectId(blog_id)})

        if not blog:
            return Response({'error': 'Blog not found'}, status=status.HTTP_404_NOT_FOUND)

        # Convert ObjectId to string
        blog['_id'] = str(blog['_id'])

        # Parse blog_data_json if exists
        if 'blog_data_json' in blog:
            blog_data = json.loads(blog['blog_data_json'])
            blog.update(blog_data)
            del blog['blog_data_json']

        # Get teacher/author name
        teacher_fname = "Unknown Teacher"
        teacher_lname = ""
        if 'author_id' in blog:
            teacher = teacher_collection.find_one({'_id': ObjectId(blog['author_id'])})
            if teacher:
                teacher_fname = teacher.get('name', teacher.get('first_name', 'Unknown Teacher'))
                teacher_lname = teacher.get('name', teacher.get('last_name', ''))
            blog['teacher_name'] = teacher_fname + " " + teacher_lname

        # Convert datetime objects to strings
        blog['created_at'] = str(blog.get('created_at'))
        blog['updated_at'] = str(blog.get('updated_at'))

        # Calculate total lessons and chapters
        if 'chapters' in blog:
            total_lessons = sum(len(chapter.get('contents', [])) for chapter in blog['chapters'])
            total_chapters = len(blog['chapters'])
            blog['total_lessons'] = total_lessons
            blog['total_chapters'] = total_chapters

        # Default frontend fields
        blog.setdefault('progress', 0)
        blog.setdefault('completed_lessons', 0)
        blog.setdefault('estimated_hours', blog.get('total_lessons', 0) * 0.5)

        return Response(blog, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': f'Failed to retrieve blog: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
def update_blog(request, blog_id):
    try:
        # Get the existing blog first
        existing_blog = blog_collection.find_one({"_id": ObjectId(blog_id)})
        if not existing_blog:
            return Response({"error": "Blog not found"}, status=status.HTTP_404_NOT_FOUND)

        data = request.data.copy()  # Make the data mutable
        data.pop('_id', None)  # Remove _id if present
        
        # Prepare the blog_data_json structure based on incoming data
        blog_data_json = {
            "title": data.get('title', existing_blog.get('title', '')),
            "description": data.get('description', existing_blog.get('description', '')),
            "author_id": data.get('author_id', existing_blog.get('author_id', '')),
            "chapters": data.get('chapters', existing_blog.get('chapters', [])),
        }

        # Prepare the update document
        update_fields = {
            "title": data.get('title', existing_blog.get('title', '')),
            "description": data.get('description', existing_blog.get('description', '')),
            "tags": data.get('tags', existing_blog.get('tags', [])),
            "is_published": data.get('is_published', existing_blog.get('is_published', False)),
            "featured_image": data.get('featured_image', existing_blog.get('featured_image', '')),
            "category": data.get('category', existing_blog.get('category', 'General')),
            "updated_at": datetime.datetime.now(),
            "blog_data_json": json.dumps(blog_data_json)  # Store the JSON structure
        }

        # Perform the update
        result = blog_collection.update_one(
            {"_id": ObjectId(blog_id)},
            {"$set": update_fields}
        )

        if result.modified_count == 0:
            return Response({"message": "No changes detected"}, status=status.HTTP_200_OK)

        # Fetch updated blog to return
        updated_blog = blog_collection.find_one({"_id": ObjectId(blog_id)})
        updated_blog['_id'] = str(updated_blog['_id'])

        return Response({
            "message": "Blog updated successfully",
            "blog": updated_blog
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {"error": f"Failed to update blog: {str(e)}"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )



     
@api_view(['GET'])
def get_courses(request):
    try:
        # Get all courses from MongoDB
        courses = list(courses_collection.find({}))
        parsed_courses = []
        
        for course in courses:
            # Convert MongoDB ObjectId to string
            course['_id'] = str(course['_id'])
            
            # Parse the JSON data back to Python dict
            if 'course_data_json' in course:
                course_data = json.loads(course['course_data_json'])
                course.update(course_data)
                del course['course_data_json']
            
            # Get teacher name from users collection
            teacher_fname = "Unknown Teacher"
            teacher_lname = ""
            if 'teacher_id' in course:
                teacher = teacher_collection.find_one({'_id': ObjectId(course['teacher_id'])})
                if teacher:
                    teacher_fname = teacher.get('name', teacher.get('first_name', 'Unknown Teacher'))
                    teacher_lname = teacher.get('name', teacher.get('last_name', ''))
                course['teacher_name'] = teacher_fname+" "+teacher_lname
            
            # Convert datetime objects to strings
            course['created_at'] = str(course.get('created_at'))
            course['updated_at'] = str(course.get('updated_at'))
            
            # Calculate total lessons and chapters
            if 'chapters' in course:
                total_lessons = sum(len(chapter.get('contents', [])) for chapter in course['chapters'])
                total_chapters = len(course['chapters'])
                course['total_lessons'] = total_lessons
                course['total_chapters'] = total_chapters
            
            # Add default values for frontend
            course.setdefault('progress', 0)
            course.setdefault('completed_lessons', 0)
            course.setdefault('estimated_hours', course.get('total_lessons', 0) * 0.5)  # 30 mins per lesson
            
            parsed_courses.append(course)

        return Response(parsed_courses, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': f'Failed to retrieve courses: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        
        
        
@api_view(['GET'])
def get_teacher_blogs(request, author_id):
    try:
        # Find blogs written by the author_id
        blogs = list(blog_collection.find(
            {'author_id': author_id},
            {
                '_id': 1, 'title': 1, 'created_at': 1, 'updated_at': 1,
                'description': 1, 'tags': 1, 'is_published': 1,
                'featured_image': 1, 'category': 1, 'blog_data_json': 1
            }
        ).sort('created_at', -1))

        parsed_blogs = []
        for blog in blogs:
            # Convert MongoDB ObjectId to string
            blog['_id'] = str(blog.pop('_id'))

            # Parse the blog_data_json
            if 'blog_data_json' in blog:
                blog_data = json.loads(blog['blog_data_json'])
                blog.update(blog_data)
                del blog['blog_data_json']

            # Convert datetime objects to string
            blog['created_at'] = str(blog.get('created_at'))
            blog['updated_at'] = str(blog.get('updated_at'))

            parsed_blogs.append(blog)

        return Response(parsed_blogs, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
@api_view(['GET'])
def get_teacher_courses(request, teacher_id):
    try:
        # Find courses and exclude the MongoDB _id field from the initial query
        courses = list(courses_collection.find(
            {'teacher_id': teacher_id},
            {'_id': 1, 'title': 1, 'created_at': 1, 'updated_at': 1, 'course_data_json': 1}
        ).sort('created_at', -1))

        parsed_courses = []
        for course in courses:
            # Convert MongoDB ObjectId to string
            course['_id'] = str(course.pop('_id'))
            
            # Parse the JSON data back to Python dict
            
            if 'course_data_json' in course:
                course_data = json.loads(course['course_data_json'])
                # Merge the parsed data with the course document
                course.update(course_data)
                # Remove the JSON string as we now have the parsed data
                del course['course_data_json']
            
            # Convert datetime objects to strings
            course['created_at'] = str(course.get('created_at'))
            course['updated_at'] = str(course.get('updated_at'))
            
            parsed_courses.append(course)

        return Response(parsed_courses, status=status.HTTP_200_OK)
        
    except Exception as e:
        import traceback
        print("Error:", traceback.format_exc())
        return Response(
            {'error': f'Failed to retrieve courses: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def get_all_courses(request):
    try:
        courses = list(courses_collection.find().sort('created_at', -1))
        
        # Convert ObjectIds to strings
        for course in courses:
            course['_id'] = str(course['_id'])
        
        return Response(courses, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': f'Failed to retrieve courses: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )



@api_view(['POST'])
def save_course_content(request, course_id):
    try:
        content_data = request.data
        
        # Validate required fields
        if not content_data.get('chapters'):
            return Response({'error': 'Chapters data is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get the existing course
        course = courses_collection.find_one({'_id': ObjectId(course_id)})
        if not course:
            return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Process chapters and their content
        chapters = []
        for chapter in content_data.get('chapters', []):
            chapter_doc = {
                'id': chapter['id'],
                'title': chapter['title'],
                'template': chapter.get('template', 'clean'),
                'order': chapter.get('order', 0),
                'contents': []
            }
            
            # Process chapter contents
            contents = []
            for content in chapter.get('contents', []):
                # Skip assessment and assignment types
                if content['type'] in ['assessment', 'assignment']:
                    continue
                    
                content_doc = {
                    'id': content['id'],
                    'type': content['type'],
                    'order': content.get('order', 0),
                    'content': None
                }
                
                # Handle different content types
                if content['type'] == 'text':
                    content_doc['content'] = content['content']
                elif content['type'] == 'link':
                    content_doc['content'] = content['content']
                elif content['type'] == 'youtube':
                    content_doc['content'] = content['content']
                elif content['type'] == 'code':
                    content_doc['content'] = {
                        'code': content['content'],
                        'language': 'javascript'  # Default, can be changed
                    }
                elif content['type'] == 'quiz':
                    quiz_data = content.get('quizData', {})
                    content_doc['content'] = {
                        'question': quiz_data.get('question', ''),
                        'options': quiz_data.get('options', []),
                        'correctAnswer': quiz_data.get('correctAnswer', 0)
                    }
                elif content['type'] in ['image', 'video', 'pdf']:
                    # Check if we already have file info for this content
                    existing_content = next(
                        (c for c in course['chapters'][chapter['order']]['contents'] 
                         if c['id'] == content['id'] and 'fileId' in c.get('content', {})),
                        None
                    )
                    if existing_content:
                        content_doc['content'] = existing_content['content']
                    else:
                        content_doc['content'] = {
                            'placeholder': f"File upload for {content['type']} will be handled separately",
                            'filename': f"sample.{content['type'] if content['type'] != 'pdf' else 'pdf'}"
                        }
                elif content['type'].startswith('custom-'):
                    # Handle custom content types
                    content_doc['content'] = content['content']
                
                contents.append(content_doc)
            
            # Sort contents by their order
            chapter_doc['contents'] = sorted(contents, key=lambda x: x['order'])
            chapters.append(chapter_doc)
        
        # Sort chapters by their order
        sorted_chapters = sorted(chapters, key=lambda x: x['order'])
        
        # Update the course in MongoDB
        result = courses_collection.update_one(
            {'_id': ObjectId(course_id)},
            {
                '$set': {
                    'chapters': sorted_chapters,
                    'updated_at': datetime.now()
                }
            }
        )
        
        return Response({'message': 'Course content saved successfully'}, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': f'Failed to save course content: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )




@api_view(['PUT'])
def update_course_status(request, course_id):
    """
    Toggle the active status of a course (activate/deactivate)
    """
    try:
        if not ObjectId.is_valid(course_id):
            return Response(
                {"error": "Invalid course ID"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get current status to toggle
        course = courses_collection.find_one({"_id": ObjectId(course_id)})
        if not course:
            return Response(
                {"error": "Course not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

        new_status = not course.get('is_active', True)

        # Update only the is_active field
        result = courses_collection.update_one(
            {'_id': ObjectId(course_id)},
            {
                '$set': {
                    'is_active': new_status,
                    'updated_at': datetime.datetime.now()
                }
            }
        )

        if result.modified_count == 0:
            return Response(
                {"error": "No changes made"}, 
                status=status.HTTP_304_NOT_MODIFIED
            )

        return Response(
            {"message": f"Course {'activated' if new_status else 'deactivated'} successfully"},
            status=status.HTTP_200_OK
        )

    except Exception as e:
        return Response(
            {"error": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        from datetime import datetime
@api_view(['DELETE'])
def delete_course(request, course_id):
    """
    Soft delete course by moving to deleted_courses collection
    """
    try:
        if not ObjectId.is_valid(course_id):
            return Response(
                {"error": "Invalid course ID"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get course data before deletion
        course = courses_collection.find_one({"_id": ObjectId(course_id)})
        if not course:
            return Response(
                {"error": "Course not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

        # Prepare deleted course document
        deleted_course = {
            "original_data": course,  # Store entire course document
            "deleted_at": datetime.now(),
            "deleted_by": request.user.id if hasattr(request, 'user') else None,
            "reason": request.data.get('reason', 'No reason provided')
        }

        # Insert into deleted collection
        deleted_courses_collection.insert_one(deleted_course)

        # Delete from main collection
        courses_collection.delete_one({"_id": ObjectId(course_id)})

        return Response(
            {"message": "Course moved to archive"},
            status=status.HTTP_200_OK
        )

    except Exception as e:
        return Response(
            {"error": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        
        
@api_view(['PUT'])
def update_blog_status(request, blog_id):
    """
    Toggle the active status of a blog (activate/deactivate)
    """
    try:
        if not ObjectId.is_valid(blog_id):
            return Response(
                {"error": "Invalid blog ID"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get current status to toggle
        blog = blog_collection.find_one({"_id": ObjectId(blog_id)})
        if not blog:
            return Response(
                {"error": "Blog not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

        new_status = not blog.get('is_active', True)

        # Update only the is_active field
        result = blog_collection.update_one(
            {'_id': ObjectId(blog_id)},
            {
                '$set': {
                    'is_active': new_status,
                    'updated_at': datetime.datetime.now()
                }
            }
        )

        if result.modified_count == 0:
            return Response(
                {"error": "No changes made"}, 
                status=status.HTTP_304_NOT_MODIFIED
            )

        return Response(
            {"message": f"Blog {'activated' if new_status else 'deactivated'} successfully"},
            status=status.HTTP_200_OK
        )

    except Exception as e:
        return Response(
            {"error": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
def delete_blog(request, blog_id):
    """
    Soft delete blog by moving to deleted_blogs collection
    """
    try:
        if not ObjectId.is_valid(blog_id):
            return Response(
                {"error": "Invalid blog ID"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get blog data before deletion
        blog = blog_collection.find_one({"_id": ObjectId(blog_id)})
        if not blog:
            return Response(
                {"error": "Blog not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

        # Prepare deleted blog document
        deleted_blog = {
            "original_data": blog,  # Store entire blog document
            "deleted_at": datetime.now(),
            "deleted_by": request.user.id if hasattr(request, 'user') else None,
            "reason": request.data.get('reason', 'No reason provided')
        }

        # Insert into deleted collection
        deleted_blogs_collection.insert_one(deleted_blog)

        # Delete from main collection
        blog_collection.delete_one({"_id": ObjectId(blog_id)})

        return Response(
            {"message": "Blog moved to archive"},
            status=status.HTTP_200_OK
        )

    except Exception as e:
        return Response(
            {"error": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
@api_view(['PUT'])
def update_test_status(request, test_id):
    """
    Toggle the active status of a test (activate/deactivate)
    """
    try:
        if not ObjectId.is_valid(test_id):
            return Response(
                {"error": "Invalid test ID"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get current status to toggle
        test =  questions_collection.find_one({"_id": ObjectId(test_id)})
        if not test:
            return Response(
                {"error": "Test not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

        new_status = not test.get('is_active', True)

        # Update only the is_active field
        result =  questions_collection.update_one(
            {'_id': ObjectId(test_id)},
            {
                '$set': {
                    'is_active': new_status,
                    'updated_at': datetime.datetime.now()
                }
            }
        )

        if result.modified_count == 0:
            return Response(
                {"error": "No changes made"}, 
                status=status.HTTP_304_NOT_MODIFIED
            )

        return Response(
            {
                "message": f"Test {'activated' if new_status else 'deactivated'} successfully",
                "is_active": new_status
            },
            status=status.HTTP_200_OK
        )

    except Exception as e:
        return Response(
            {"error": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
def delete_test(request, test_id):
    """
    Soft delete test by moving to deleted_tests collection
    """
    try:
        if not ObjectId.is_valid(test_id):
            return Response(
                {"error": "Invalid test ID"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get test data before deletion
        test =  questions_collection.find_one({"_id": ObjectId(test_id)})
        if not test:
            return Response(
                {"error": "Test not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

        # Prepare deleted test document
        deleted_test = {
            "original_data": test,  # Store entire test document
            "deleted_at": datetime.now(),
            "deleted_by": request.user.id if hasattr(request, 'user') else None,
            "reason": request.data.get('reason', 'No reason provided'),
            "test_type": test.get('type', 'assessment')  # Store test type for reference
        }

        # Insert into deleted collection
        deleted_question_collection.insert_one(deleted_test)

        # Delete from main collection
        questions_collection.delete_one({"_id": ObjectId(test_id)})

        return Response(
            {"message": "Test moved to archive"},
            status=status.HTTP_200_OK
        )

    except Exception as e:
        return Response(
            {"error": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])

def getting_assesment_id(request):
    """
    Get all assessments for a specific teacher using POST method
    """
    try:
        teacher_id = request.data.get('teacher_id')
        if not teacher_id:
            return Response(
                {'error': 'Teacher ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        
        assessments = list(questions_collection.find({"teacher_id": teacher_id}).sort("_id", -1))
                      
        
        
        for assessment in assessments:
            assessment['_id'] = str(assessment['_id'])
        
        return Response(assessments, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        
        
@api_view(['GET'])
def assessment_details(request, assessment_id):
    """
    Get details of a specific assessment
    """
    try:
        
        assessment = questions_collection.find_one({"_id": ObjectId(assessment_id)})
        
        if not assessment:
            return Response(
                {'error': 'Assessment not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
        assessment['_id'] = str(assessment['_id'])
        return Response(assessment, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': 'Invalid assessment ID'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
        
from bson import ObjectId

@api_view(["POST"])
def test(request):
    try:
        
        assessments = list(questions_collection.find({"is_assigned": True}).sort("timestamp", -1))
        
        # Get unique teacher IDs to avoid duplicate queries
        unique_teacher_ids = list({ObjectId(assessment['teacher_id']) for assessment in assessments})
       
        
        # Fetch teacher names for all unique teachers
        teachers = list(teacher_collection.find(
            {"_id": {"$in": unique_teacher_ids}},
            {"first_name": 1, "last_name": 1},  
        ))
       
        
        # Create mapping with fallback for missing names
        teacher_name_map = {}
        for teacher in teachers:
            teacher_id = str(teacher['_id'])
            fname = teacher.get('first_name')  or 'Unknown Teacher'
            lname= teacher.get('last_name', '')
            name= f"{fname} {lname}".strip()
            teacher_name_map[teacher_id] = name
        
        # Prepare response data
        response_data = []
        for assessment in assessments:
            assessment_data = {
                **assessment,
                '_id': str(assessment['_id']),
                'teacher_name': teacher_name_map.get(assessment['teacher_id'], 'Unknown Teacher')
            }
            response_data.append(assessment_data)
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        print("Error:", str(e))  # Add detailed error logging
        return Response(
            {'error': f'Failed to retrieve assessments: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
# views.py
@api_view(["POST"])
def completed_tests(request):
    try:
        student_id = request.data.get('student_id')
        if not student_id:
            return Response(
                {'error': 'Student ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get all completed tests for this student
        submissions = list(answers_collection.find({
            "student_id": ObjectId(student_id)
        }).sort("submitted_at", -1))

        # Get test details for each submission
        completed_tests = []
        for sub in submissions:
            test = questions_collection.find_one({"_id": sub["test_id"]})
            if test:
                completed_tests.append({
                    "_id": str(sub["_id"]),
                    "test_id": str(sub["test_id"]),
                    "assessment_name": test.get("assessment_name", "Test"),
                    "course": test.get("course", "General"),
                    "submitted_at": sub.get("submitted_at"),
                    "score": sub.get("score", {}),
                    "test_details": {
                        "time_allotment": test.get("time_allotment"),
                        "questions_count": len(test.get("questions", {}))
                    }
                })

        return Response(completed_tests, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
@api_view(["POST"])
def delete_assessment(request):
    try:
        assessment_id = request.data.get("assessment_id")
        if not assessment_id:
            return Response({"error": "No assessment ID provided"}, status=status.HTTP_400_BAD_REQUEST)

        # Find the assessment first
        assessment = questions_collection.find_one({"_id": ObjectId(assessment_id)})
        if not assessment:
            return Response({"error": "Assessment not found."}, status=status.HTTP_404_NOT_FOUND)

        # Insert into deleted collection
        deleted_question_collection.insert_one(assessment)
        
        # Now delete from original collection
        result = questions_collection.delete_one({"_id": ObjectId(assessment_id)})
        
        if result.deleted_count == 1:
            return Response({"message": "Assessment moved to deleted collection successfully."}, status=status.HTTP_200_OK)
        else:
            # This shouldn't happen since we found it above, but just in case
            return Response({"error": "Failed to delete assessment."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
@api_view(["POST"])
def test_results(request):
    try:
        test_id = request.data.get('test_id')
        student_id = request.data.get('student_id')
        
        if not test_id or not student_id:
            return Response(
                {'error': 'Both test_id and student_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get the test submission
        submission = answers_collection.find_one({
            "_id": ObjectId(test_id),
            "student_id": ObjectId(student_id)
        })
        
        if not submission:
            return Response(
                {'error': 'Test results not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get the original test questions
        test = questions_collection.find_one({
            "_id": submission["test_id"]
        })
        
        if not test:
            return Response(
                {'error': 'Original test not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Prepare the response
        response_data = {
            "_id": str(submission["_id"]),
            "assessment_name": test.get("assessment_name", "Test"),
            "submitted_at": submission.get("submitted_at"),
            "score": submission.get("score", {}),
            "answers": submission.get("answers", {}),
            "questions": []
        }
        
        # Add question details
        for q_id, q_data in test.get("questions", {}).items():
            response_data["questions"].append({
                "id": q_id,
                "question": q_data.get("question"),
                "options": q_data.get("options", []),
                "corrected": q_data.get("corrected")
            })
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        
@api_view(["POST"])  
def get_test(request):
    try:
        # Get test_id from request body instead of URL
        test_id = request.data.get('testId')
        if not test_id:
            return Response(
                {'error': 'Test ID not provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get test document from MongoDB
        test = questions_collection.find_one({"_id": ObjectId(test_id)})
        
        if not test:
            return Response(
                {'error': 'Test not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Convert ObjectId to string
        test['_id'] = str(test['_id'])
        
        # Format questions into array
        questions_array = []
        for q_num, q_data in test.get('questions', {}).items():
            q_data['number'] = q_num
            questions_array.append(q_data)
        
        # Replace questions object with array
        test['questions'] = questions_array
        
        return Response(test, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': f'Failed to retrieve test: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
            
@api_view(["POST"])
def submit_test(request):
    try:
        print("Received submission data:", request.data)  # Log incoming data
        data = request.data
        
        
        # Validate required fields
        required_fields = ['testId', 'studentId', 'answers', 'timeSpent']
        for field in required_fields:
            if field not in data:
                return Response(
                    {'error': f'Missing required field: {field}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        test_id = data['testId']
        student_id = data['studentId']
        answers = data['answers']
        time_spent = data['timeSpent']
        
        # Verify test exists
        test = questions_collection.find_one({"_id": ObjectId(test_id)})
        if not test:
            return Response(
                {'error': 'Test not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verify student exists (optional)
        student = users_collection.find_one({"_id": ObjectId(student_id)})
        if not student:
            return Response(
                {'error': 'Student not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Calculate score with AI evaluation for short answers
        print("Starting score calculation...")
        score = calculate_score(test, answers)
        print("Score calculation completed:", score)
        
        # Prepare submission document
        submission = {
            "test_id": ObjectId(test_id),
            "student_id": ObjectId(student_id),
            "answers": answers,
            "score": score,
            "time_spent": time_spent,
            "submitted_at": datetime.now(),
            "status": "completed",
            "ai_evaluated": score.get('ai_evaluated', False)  # Add flag if AI was used
        }
        
        # Insert into answers collection
        result = answers_collection.insert_one(submission)
        
        return Response({
            'message': 'Test submitted successfully',
            'submission_id': str(result.inserted_id),
            'score': score
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print(f"Error in submit_test: {str(e)}")  # Detailed error logging
        
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )




def evaluate_with_gemini(question_text, student_answer):
    """
    Evaluate answer and generate correct answer using Gemini.
    If score is 0, check for fallback keywords manually.
    Returns both score and generated correct answer.
    """

    # Define fallback keywords for known questions (add more if needed)
    
    print(question_text,"question_text")
    print(student_answer,"student_answer")
    try:
        prompt = f"""
You are an experienced EXAM EVALUATOR.

Your task has two steps:

Step 1: Read the question and write an ideal, complete answer that a well-informed student should give.

QUESTION: {question_text}

Step 2: Evaluate the student's answer using the following rules:
- If the answer is correct and well explained, give a full score (1.0).
- If the answer is brief but relevant (e.g., just a keyword), give partial credit (e.g., 0.4 to 0.6).
- If the answer captures only part of a multi-part answer, give proportionate score.
- If the answer is unrelated or completely incorrect, give a score of 0.

Examples for reference:
- Question: What is the output of print(5<3)?
  Student Answer: false
  → Score: 1.0

- Question: Which programming language is used in AI?
  Student Answer: python
  → Score: 0.6 (correct keyword, but not detailed)

- Question: Which languages support OOP?
  Student Answer: java
  → Score: 0.5 (one correct keyword, but not all correct answers)

Use keyword presence and answer completeness to estimate the score.

Now, evaluate:

STUDENT ANSWER: {student_answer}

Return a JSON object with:
- generated_answer (ideal complete answer as string)
- score (a float between 0 and 1 based on evaluation)
"""


        response = requests.post(
            "http://localhost:8000/lmsai/api/generate-questions/",
            json={"prompt": prompt}
        )
       
        response_data = response.json()
        raw_json_string = response_data['response']
        cleaned_json = raw_json_string.strip().removeprefix("```json").removesuffix("```").strip()
        result = json.loads(cleaned_json)
        print(result)
        score = result.get('score', 0)
        generated_answer = result.get('generated_answer', '')

        

        return {
            'score': score,
            'generated_answer': generated_answer
        }

    except Exception as e:
        print(f"Evaluation error: {str(e)}")
        return {
            'score': 0,
            'generated_answer': ''
        }

def calculate_score(test, answers):
    """
    Calculate the score with AI evaluation for short answer questions.
    Updates the corrected answer in database with Gemini's generated answer.
    """
    score = 0
    questions_dict = test['questions']
    total_questions = len(questions_dict)
    ai_evaluated_questions = []

    for question_id, student_answer in answers.items():
        question_data = questions_dict.get(str(question_id))
        
        if not question_data:
            continue

        # Check the type of question using `question_type` array
        # try:
        #     index = int(question_id) - 1
        #     question_type = test.get("question_type", [])[index]
        # except (IndexError, ValueError):
        #     question_type = ""
            
        try:
            index = int(question_id) - 1
            question_type_list = test.get("question_type", [])
            question_type = question_type_list[index] if index < len(question_type_list) else ""

            if question_type is None:
                question_type = ""
        except (IndexError, ValueError, TypeError):
        
            question_type = ""

        if question_type == "Short Answer":
            print("AI evaluation triggered for question:", question_id)
            evaluation = evaluate_with_gemini(
                question_text=question_data['question'],
                student_answer=student_answer
            )
            print("AI evaluation result:", evaluation)

            # if evaluation.get('generated_answer'):
            #     questions_collection.update_one(
            #         {"_id": test['_id']},
            #         {"$set": {f"questions.{question_id}.corrected": evaluation['generated_answer']}}
            #     )

            score += evaluation.get('score', 0)
            ai_evaluated_questions.append({
                'question_id': question_id,
                'score': evaluation.get('score', 0),
                'student_answer': student_answer,
                'generated_answer': evaluation.get('generated_answer', '')
            })

        else:
            if student_answer == question_data.get('corrected'):
                score += 1

    return {
        'correct': score,
        'total': total_questions,
        'percentage': (score / total_questions) * 100 if total_questions > 0 else 0,
        'ai_evaluated': len(ai_evaluated_questions) > 0,
        'ai_evaluated_questions': ai_evaluated_questions
    }

from datetime import datetime, timedelta


@api_view(['POST'])
def login_react(request):
    username = request.data.get('username')
    password = request.data.get('password')

    # Authenticate using Django
    
    mongo_user = users_collection.find_one({"username": username})
    if mongo_user is None:
        return Response({"error_message": "User Doesn't Exist"}, status=status.HTTP_400_BAD_REQUEST)

    if mongo_user and check_password(password, mongo_user["password"]):
        role= mongo_user.get("role", "student")
        
       
        current_time = datetime.now()

        users_collection.update_one(
            {"_id": mongo_user["_id"]},
            {"$set": {"last_login": current_time}}
        )
       

        # Generate JWT Token
        # refresh = RefreshToken.for_user(mongo_user)
        # access_token = str(refresh.access_token)
        payload = {
            "id": str(mongo_user["_id"]),
            "username": mongo_user["username"],
            "role": role,
            "exp": datetime.now() + timedelta(days=1)

        }
        access_token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

        # Return response with MongoDB user data
        return Response({
            "message": "Login successful",
            "token": access_token,
            "user": {
                "id": str(mongo_user["_id"]),  
                "username": mongo_user["username"],
                "email": mongo_user["email"],
                "first_name": mongo_user["first_name"],
                "last_name": mongo_user["last_name"],
                 "role": mongo_user.get("role", "student"),
                # "full_name": mongo_user.get("full_name", ""),
            }
        }, status=status.HTTP_200_OK)

    return Response({"error_message": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def login_react_admin(request):
    username = request.data.get('username')
    password = request.data.get('password')

   
    
    mongo_user = admin_collection.find_one({"username": username})
    if mongo_user is None:
        return Response({"error_message": "User Doesn't Exist"}, status=status.HTTP_400_BAD_REQUEST)

    if mongo_user and check_password(password, mongo_user["password"]):
        role= mongo_user.get("role", "admin")
        
       
        payload = {
            "id": str(mongo_user["_id"]),
            "username": mongo_user["username"],
            "role": role,
        "exp": datetime.now() + timedelta(days=1)

        }
        access_token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

        # Return response with MongoDB user data
        return Response({
            "message": "Login successful",
            "token": access_token,
            "user": {
                "id": str(mongo_user["_id"]),  
                "username": mongo_user["username"],
                "email": mongo_user["email"],
                "first_name": mongo_user["first_name"],
                "last_name": mongo_user["last_name"],
                 "role": mongo_user.get("role", "student"),
                # "full_name": mongo_user.get("full_name", ""),
            }
        }, status=status.HTTP_200_OK)

    return Response({"error_message": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login_react_teacher(request):
    username = request.data.get("username")
    password = request.data.get("password")

    
    teacher = teacher_collection.find_one({"username": username})

    if teacher and check_password(password, teacher["password"]):  
        role = teacher.get("role", "student")

       
        
     
        payload = {
            "id": str(teacher["_id"]),
            "username": teacher["username"],
            "role": role,
            "exp":datetime.now() + timedelta(days=1),  
        }
        access_token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

        return Response({
            "message": "Login successful",
            "token": access_token,
            "user": {
                "id": str(teacher["_id"]),  
                "username": teacher["username"],
                "role": role,
                "email": teacher["email"],
                "first_name": teacher["first_name"],
                "last_name": teacher["last_name"],
                "date_joined": teacher["date_joined"],
            }
        }, status=status.HTTP_200_OK)

    return Response({"error_message": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def signup_react(request):
    first_name = request.data.get('first_name', '').strip()
    last_name = request.data.get('last_name', '').strip()
    email = request.data.get('email', '').strip()
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '')

    if (
    users_collection.find_one({"$or": [{"email": email}, {"username": username}]}) or
    teacher_collection.find_one({"$or": [{"email": email}, {"username": username}]}) or
    admin_collection.find_one({"$or": [{"email": email}, {"username": username}]})
):
        return Response({"error_message": "Email or username already exists"}, status=status.HTTP_400_BAD_REQUEST)


    hashed_password = make_password(password)

    user_data = {
        "username": username,
        "email": email,
        "password": hashed_password,
        "first_name": first_name,
        "last_name": last_name,
        "role": "student",
        "is_active": True,
        "is_staff": False,
        "is_superuser": False,
        "date_joined": datetime.now(),
    }
    user_data["_id"] = ObjectId()
    user_data["id"] = int(str(user_data["_id"])[:8], 16)

    users_collection.insert_one(user_data)

    return Response({"message": "Signup successful"}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def signup_react_admin(request):
    first_name = request.data.get('first_name', '').strip()
    last_name = request.data.get('last_name', '').strip()
    email = request.data.get('email', '').strip()
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '')

    if (
    users_collection.find_one({"$or": [{"email": email}, {"username": username}]}) or
    teacher_collection.find_one({"$or": [{"email": email}, {"username": username}]}) or
    admin_collection.find_one({"$or": [{"email": email}, {"username": username}]})
):
        return Response({"error_message": "Email or username already exists"}, status=status.HTTP_400_BAD_REQUEST)



    hashed_password = make_password(password)

    user_data = {
        "username": username,
        "email": email,
        "password": hashed_password,
        "first_name": first_name,
        "last_name": last_name,
        "role": "admin",
        "is_active": True,
        "is_staff": False,
        "is_superuser": False,
        "date_joined": datetime.datetime.now(),
    }
    user_data["_id"] = ObjectId()
    user_data["id"] = int(str(user_data["_id"])[:8], 16)

    admin_collection.insert_one(user_data)

    return Response({"message": "Signup successful"}, status=status.HTTP_201_CREATED)



@api_view(['POST'])
def signup_react_teacher(request):
    first_name = request.data.get('first_name', '').strip()
    print(first_name,"hii")
    last_name = request.data.get('last_name', '').strip()
    email = request.data.get('email', '').strip()
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '')

    # Check if email or username already exists
    if (
    users_collection.find_one({"$or": [{"email": email}, {"username": username}]}) or
    teacher_collection.find_one({"$or": [{"email": email}, {"username": username}]}) or
    admin_collection.find_one({"$or": [{"email": email}, {"username": username}]})
):
        return Response({"error_message": "Email or username already exists"}, status=status.HTTP_400_BAD_REQUEST)


    
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
        "date_joined": datetime.now(),
    }
    print(teacher_data)
    teacher_collection.insert_one(teacher_data)

    return Response({"message": "Signup successful"}, status=status.HTTP_201_CREATED)


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
    
   
   
        
        
    if request.user.is_authenticated:
        try:
            
            user = users_collection.find_one({"id": request.user.id}) 
            f=user["first_name"]+" "+user["last_name"]
           
            
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






def check_auth(request):
    if request.user.is_authunticated:
        return HttpResponse(f"<h1>User is authenticated</h1>")
    return HttpResponse(f"<h1>User is not authenticated</h1>")

from bson import ObjectId
def signup(request):
    if request.method == "POST":
       
        first_name = request.POST.get('firstname', '').strip()
        last_name = request.POST.get('lastname', '').strip()
        email = request.POST.get('email', '').strip()
        username = request.POST.get('username', '').strip()
        password = request.POST.get('password', '')

        hashed_password = make_password(password)
        
        
        if users_collection.find_one({"email": email}):
            return render(request, "authunticate.html", {
                "error_message": "Email already exists"
            })

        if users_collection.find_one({"username": username}):
            
            return render(request, "authunticate.html", {
                "error_message": "User already exists"
            })
        if teacher_collection.find_one({"email": email}):
                return render(request, "authunticate.html", {
                    "error_message": "Email already exists"
                })
        if teacher_collection.find_one({"username": username}):
                return render(request, "authunticate.html", {
                    "error_message": "User already exists"
                })

        hashed_password = make_password(password)
        user_data = {
                "username": username,
                "email": email,
                "password": hashed_password,
                "first_name": first_name,
                "last_name": last_name,
                "role": "student",
                "is_active": True,
                "is_staff": False,
                "is_superuser": False,
            }
        user_data["_id"] = ObjectId()
        user_data["id"] = int(str(user_data["_id"])[:8], 16)
       
        users_collection.insert_one(user_data) 
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

        user = users_collection.find_one({"username": username})
        if user and check_password(password, user["password"]):  
            role = user.get("role", "student")
            request.session["user_type"] = role  
            request.session["username"] = username
            request.session["user_id"] = str(user["_id"])  

            
            user, created = User.objects.get_or_create(username=username)
            login(request, user, backend='django.contrib.auth.backends.ModelBackend') 
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




User = get_user_model()  

def teacher_login(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]

        user = authenticate(request, username=username, password=password, backend="app.auth_backends.TeacherAuthBackend")

        if user:
            request.session["user_type"] = "teacher"
            request.session["teacher_username"] = username
            request.session["teacher_id"] = str(user.id)

            login(request, user, backend="app.auth_backends.TeacherAuthBackend")
            return redirect("teacher_dashboard")

        return render(request, "auth_teacher.html", {"error_message": "Invalid credentials"})

    return render(request, "auth_teacher.html")






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



from bson import ObjectId
import json
from datetime import datetime
from django.conf import settings
import jwt
from django.contrib.auth.hashers import make_password, check_password
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

# views.py
from django.http import JsonResponse

@api_view(['GET'])
def get_user_profile(request):
    print("All headers:", request.headers)
    print("Auth header:", request.META.get('HTTP_AUTHORIZATION', request.headers.get('Authorization', '')))
    
    auth_header = request.META.get('HTTP_AUTHORIZATION', '') or request.headers.get('Authorization', '')
    if not auth_header:
        print("No auth header received")
        return Response(
            {'success': False, 'error': 'Authorization header is missing'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    try:
        print("Incoming headers:", request.headers)  # Debug all headers
        print("Auth header:", request.META.get('HTTP_AUTHORIZATION'))
        
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header:
            return Response(
                {'success': False, 'error': 'Authorization header is missing'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Extract token
        token = auth_header.split(' ')[-1] if ' ' in auth_header else auth_header
        
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = payload['id']
            user = users_collection.find_one({"_id": ObjectId(user_id)})
            print("Complete user document:", user)  # Add this line
            print("Passout Year:", user.get("Passout_Year", "Not available"))
            print("Graduation Percentage:", user.get("Graduation_Percentage", "Not available"))


            if not user:
                return Response(
                    {'success': False, 'error': 'User not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
                
            return Response({
                'success': True,
                'data': {
                    'id': str(user['_id']),
                    'username': user.get('username'),
                    'email': user.get('email'),
                    'first_name': user.get('first_name', ''),
                    'last_name': user.get('last_name', ''),
                    'mobile': user.get('mobile', ''),
                    'location': user.get('location', ''),
                    'skills': user.get('skills', []),
                    'experiences': user.get('experiences', []),
                    'resume': user.get('resume'),
                    'profile_picture': user.get('profile_picture', ''),
                    'projects': user.get('projects', {}),
                    '10th_board': user.get('10th_board', ''),
                    '10th_Percentage': user.get('10th_Percentage', ''),
                    '10th_school': user.get('10th_school', ''),
                    '10th_passout_year': user.get('10th_passout_year', ''),
                    '12th_board': user.get('12th_board', ''),
                    '12th_Percentage': user.get('12th_Percentage', ''),
                    '12th_school': user.get('12th_school', ''),
                    '12th_passout_year': user.get('12th_passout_year', ''),
                     "Passout_Year": user.get("Passout_Year", ""),
                    "branch": user.get("branch", ""),
                    "ug_college": user.get("ug_college", ""),
                    "Graduation_Percentage": user.get('Graduation_Percentage', ''),
                }
            })
          
            
        except jwt.ExpiredSignatureError:
            return Response(
                {'success': False, 'error': 'Token expired'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        except jwt.InvalidTokenError:
            return Response(
                {'success': False, 'error': 'Invalid token'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            return Response(
                {'success': False, 'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
            
    except Exception as e:
        return Response(
            {'success': False, 'error': 'Server error: ' + str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        
@api_view(['PUT'])
def update_user_profile(request):
    try:
        auth_header = request.META.get('HTTP_AUTHORIZATION', '') or request.headers.get('Authorization', '')
        if not auth_header:
            return Response(
                {'success': False, 'error': 'Authorization header is missing'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        token = auth_header.split(' ')[-1] if ' ' in auth_header else auth_header
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        user_id = payload['id']
        
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return Response(
                {'success': False, 'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        data = request.data
        update_data = {}

        # Basic profile fields
        basic_fields = [
            'first_name', 'last_name', 'mobile', 'location', 
            'title', 'experience', 'profile_picture'
        ]
        for field in basic_fields:
            if field in data:
                update_data[field] = data[field]

        # Skills - handle array
        if 'skills' in data and isinstance(data['skills'], list):
            update_data['skills'] = data['skills']

        # Projects - handle array of objects
        if 'projects' in data and isinstance(data['projects'], list):
            update_data['projects'] = []
            for project in data['projects']:
                # Validate and clean project data
                clean_project = {
                    'title': project.get('title', ''),
                    'description': project.get('description', ''),
                    'link': project.get('link', ''),
                    'start_date': project.get('start_date', ''),
                    'end_date': project.get('end_date', ''),
                    'currently_ongoing': project.get('currently_ongoing', False)
                }
                update_data['projects'].append(clean_project)

        # Work Experience - handle array of objects
        if 'experiences' in data and isinstance(data['experiences'], list):
            update_data['experiences'] = []
            for exp in data['experiences']:
                # Validate and clean experience data
                clean_exp = {
                    'company_name': exp.get('company_name', ''),
                    'job_title': exp.get('job_title', ''),
                    'start_date': exp.get('start_date', ''),
                    'end_date': exp.get('end_date', ''),
                    'currently_working': exp.get('currently_working', False),
                    'description': exp.get('description', '')
                }
                update_data['experiences'].append(clean_exp)

        # Education fields
        education_mapping = {
            '10th_board': '10th_board',
            '10th_school': '10th_school',
            '10th_Percentage': '10th_Percentage',
            '10th_passout_year': '10th_passout_year',
            '12th_board': '12th_board',
            '12th_school': '12th_school',
            '12th_Percentage': '12th_Percentage',
            '12th_passout_year': '12th_passout_year',
            'ug_college': 'ug_college',
            'branch': 'branch',
            'Graduation_Percentage': 'Graduation_Percentage',
            'Passout_Year': 'Passout_Year'
        }

        for field, db_field in education_mapping.items():
            if field in data:
                update_data[db_field] = data[field]

        # Perform the update
        result = users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )

        if result.modified_count > 0:
            return Response({
                'success': True,
                'message': 'Profile updated successfully'
            })
        else:
            return Response({
                'success': False,
                'message': 'No changes were made to the profile'
            })

    except jwt.ExpiredSignatureError:
        return Response(
            {'success': False, 'error': 'Token expired'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    except jwt.InvalidTokenError:
        return Response(
            {'success': False, 'error': 'Invalid token'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    except Exception as e:
        return Response(
            {'success': False, 'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

import base64
from bson import ObjectId
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import jwt
from django.conf import settings

@api_view(['POST'])
def upload_profile_picture(request):
    try:
        # Authentication check
        auth_header = request.META.get('HTTP_AUTHORIZATION', '') or request.headers.get('Authorization', '')
        if not auth_header:
            return Response(
                {'success': False, 'error': 'Authorization header is missing'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        token = auth_header.split(' ')[-1] if ' ' in auth_header else auth_header
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        user_id = payload['id']
        
        # Check if file was uploaded
        if 'profile_picture' not in request.FILES:
            return Response(
                {'success': False, 'error': 'No file uploaded'},
                status=status.HTTP_400_BAD_REQUEST
            )

        profile_picture = request.FILES['profile_picture']
        
        # Read the file and convert to Base64
        image_data = profile_picture.read()
        base64_encoded = base64.b64encode(image_data).decode('utf-8')
        
        # Determine content type
        content_type = profile_picture.content_type
        
        # Create the data structure to store
        picture_data = {
            'content_type': content_type,
            'data': base64_encoded
        }
        
        # Update user's profile picture in database
        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"profile_picture": picture_data}}
        )
        
        return Response({
            'success': True,
            'profile_picture': picture_data
        })
        
    except Exception as e:
        return Response(
            {'success': False, 'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )     
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import jwt
from django.conf import settings
from bson import ObjectId

@api_view(['PUT'])
def update_profile_skills(request):
    try:
        # 1. Authentication
        auth_header = request.META.get('HTTP_AUTHORIZATION', '') or request.headers.get('Authorization', '')
        if not auth_header:
            return Response(
                {'success': False, 'error': 'Authorization header missing'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # 2. Validate token
        token = auth_header.split(' ')[-1] if ' ' in auth_header else auth_header
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = payload['id']
        except jwt.ExpiredSignatureError:
            return Response(
                {'success': False, 'error': 'Token expired'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        except jwt.InvalidTokenError:
            return Response(
                {'success': False, 'error': 'Invalid token'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # 3. Validate request data
        if not request.data:
            return Response(
                {'success': False, 'error': 'Request body is empty'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if 'skills' not in request.data:
            return Response(
                {'success': False, 'error': 'Skills field is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not isinstance(request.data['skills'], list):
            return Response(
                {
                    'success': False,
                    'error': 'Skills must be an array',
                    'received_type': str(type(request.data['skills']))
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # 4. Validate each skill
        invalid_skills = [s for s in request.data['skills'] if not isinstance(s, str)]
        if invalid_skills:
            return Response(
                {
                    'success': False,
                    'error': 'All skills must be strings',
                    'invalid_skills': invalid_skills
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # 5. Update database
        result = users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"skills": request.data['skills']}}
        )

        return Response({
            'success': True,
            'message': 'Skills updated successfully',
            'skills': request.data['skills']
        })

    except Exception as e:
        return Response(
            {
                'success': False,
                'error': 'Server error',
                'details': str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )



from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import jwt
from django.conf import settings
import base64
from datetime import datetime
from bson.objectid import ObjectId

@api_view(['POST'])
def upload_resume(request):
    try:
        # Authentication check
        auth_header = request.META.get('HTTP_AUTHORIZATION', '') or request.headers.get('Authorization', '')
        if not auth_header:
            return Response(
                {'success': False, 'error': 'Authorization header is missing'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        token = auth_header.split(' ')[-1] if ' ' in auth_header else auth_header
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        user_id = payload['id']
        
        # Check if file was uploaded
        if 'resume' not in request.FILES:
            return Response(
                {'success': False, 'error': 'No file uploaded'},
                status=status.HTTP_400_BAD_REQUEST
            )

        resume_file = request.FILES['resume']
        
        # Validate file type (PDF or DOC/DOCX)
        allowed_types = ['application/pdf', 'application/msword', 
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        if resume_file.content_type not in allowed_types:
            return Response(
                {'success': False, 'error': 'Only PDF, DOC, and DOCX files are allowed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Limit file size (5MB)
        if resume_file.size > 5 * 1024 * 1024:
            return Response(
                {'success': False, 'error': 'File size exceeds 5MB limit'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Read the file and convert to Base64
        file_data = resume_file.read()
        base64_encoded = base64.b64encode(file_data).decode('utf-8')
        
        # Create the data structure to store
        resume_data = {
            'filename': resume_file.name,
            'content_type': resume_file.content_type,
            'data': base64_encoded,
            'uploaded_at': datetime.now().isoformat()  
        }
        
        # Update user's resume in database
        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"resume": resume_data}}
        )
        
        response = Response({
            'success': True,
            'message': 'Resume uploaded successfully',
            'filename': resume_file.name
        })
        
        # Add CORS headers
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        
        return response
        
    except jwt.ExpiredSignatureError:
        return Response(
            {'success': False, 'error': 'Token expired'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    except jwt.InvalidTokenError:
        return Response(
            {'success': False, 'error': 'Invalid token'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    except Exception as e:
        return Response(
            {'success': False, 'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
# views.py
# views.py
from django.http import HttpResponse, JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
import base64
import jwt
from django.conf import settings
from bson.objectid import ObjectId
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
def download_resume(request):
    try:
        # 1. Authentication
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header:
            logger.error('No authorization header')
            return JsonResponse(
                {'error': 'Authorization header missing'}, 
                status=401
            )
            
        # Extract token
        token = auth_header.split(' ')[-1] if ' ' in auth_header else auth_header
        
        try:
            # Verify token
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = payload['id']
        except jwt.ExpiredSignatureError:
            return JsonResponse({'error': 'Token expired'}, status=401)
        except jwt.InvalidTokenError:
            return JsonResponse({'error': 'Invalid token'}, status=401)
        
        # 2. Get user from database
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            logger.error(f'User not found for ID: {user_id}')
            return JsonResponse({'error': 'User not found'}, status=404)
        
        # 3. Check if resume exists
        if 'resume' not in user or not user['resume']:
            logger.error('No resume found for user')
            return JsonResponse({'error': 'Resume not found'}, status=404)
        
        resume_data = user['resume']
        
        # 4. Validate resume data structure
        required_fields = ['data', 'content_type', 'filename']
        if not all(field in resume_data for field in required_fields):
            logger.error('Invalid resume data structure')
            return JsonResponse(
                {'error': 'Invalid resume data format'}, 
                status=500
            )
        
        # 5. Decode and send file
        try:
            file_data = base64.b64decode(resume_data['data'])
            response = HttpResponse(
                file_data,
                content_type=resume_data['content_type']
            )
            response['Content-Disposition'] = (
                f'attachment; filename="{resume_data["filename"]}"'
            )
            return response
        except Exception as e:
            logger.error(f'File decoding error: {str(e)}')
            return JsonResponse(
                {'error': 'Failed to process resume file'}, 
                status=500
            )
            
    except Exception as e:
        logger.error(f'Unexpected error: {str(e)}')
        return JsonResponse(
            {'error': 'Internal server error'}, 
            status=500
        )

from rest_framework.decorators import api_view
from rest_framework.response import Response

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import jwt
from django.conf import settings
from bson import ObjectId


@api_view(['DELETE'])
def delete_resume(request):
    try:
        # Get the Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '') or request.headers.get('Authorization', '')
        if not auth_header:
            return Response(
                {'error': 'Authorization header is missing'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Extract the token from header
        token = auth_header.split(' ')[-1] if ' ' in auth_header else auth_header
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        user_id = payload['id']

        # Find the user in MongoDB
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        # Delete the resume (set it to None)
        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"resume": None}}
        )

        return Response({'success': True})

    except jwt.ExpiredSignatureError:
        return Response({'error': 'Token expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError:
        return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_all_jobs(request):
    try:
        jobs = list(job_collection.find().sort("postedDate", -1))
        
        for job in jobs:
            job['_id'] = str(job['_id'])
            job['days_ago'] = calculate_days_ago(job.get('postedDate'))
            
            # Properly format education field
            if 'education' in job:
                if isinstance(job['education'], list):
                    job['education'] = ', '.join([str(item) for item in job['education']])
                elif isinstance(job['education'], str) and job['education'].startswith('['):
                    # Handle case where it's a string representation of a list
                    try:
                        parsed = eval(job['education'])  # Note: eval can be dangerous with untrusted data
                        job['education'] = ', '.join([str(item) for item in parsed])
                    except:
                        pass
            
            # Properly format location field
            if 'Location' in job:
                if isinstance(job['Location'], list):
                    job['Location'] = ', '.join([str(item) for item in job['Location']])
                elif isinstance(job['Location'], str) and job['Location'].startswith('['):
                    try:
                        parsed = eval(job['Location'])
                        job['Location'] = ', '.join([str(item) for item in parsed])
                    except:
                        pass
            
        return Response(jobs, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def calculate_days_ago(posted_date):
    """Helper function to calculate days since posting"""
    if not posted_date:
        return "Recently"
    
    today = datetime.datetime.now()
    posted = datetime.datetime.strptime(posted_date, '%Y-%m-%d')
    diff = today - posted
    
    if diff.days == 0:
        return "Today"
    elif diff.days == 1:
        return "Yesterday"
    else:
        return f"{diff.days} days ago"
@api_view(['GET'])
def search_jobs(request):
    try:
        search_query = request.query_params.get('q', '').lower()
        
        if not search_query:
            return get_all_jobs(request)
            
        # Create a case-insensitive regex pattern
        regex_pattern = f".*{search_query}.*"
        
        jobs = list(job_collection.find({
            "$or": [
                {"title": {"$regex": regex_pattern, "$options": "i"}},
                {"company": {"$regex": regex_pattern, "$options": "i"}},
                {"location": {"$regex": regex_pattern, "$options": "i"}},
                {"description": {"$regex": regex_pattern, "$options": "i"}}
            ]
        }).sort("postedDate", -1))
        
        # Convert ObjectId to string and format dates
        for job in jobs:
            job['_id'] = str(job['_id'])
            job['days_ago'] = calculate_days_ago(job.get('postedDate'))
            
        return Response(jobs, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# views.py
# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import jwt
from django.conf import settings
from bson import ObjectId
from datetime import datetime

@api_view(['POST'])
def apply_job(request):
    auth_header = request.META.get('HTTP_AUTHORIZATION', '') or request.headers.get('Authorization', '')
    if not auth_header:
        return Response({'error': 'Authorization header missing'}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        token = auth_header.split(' ')[-1] if ' ' in auth_header else auth_header
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        user_id = payload['id']
        
        job_id = request.data.get('job_id')
        hr_id = request.data.get('hr_id')
        
        if not job_id or not hr_id:
            return Response({'error': 'Missing job_id or hr_id'}, status=status.HTTP_400_BAD_REQUEST)
        
        existing_application = Job_applied_collection.find_one({
            'user_id': str(user_id),
            'job_id': job_id
        })
        
        if existing_application:
            return Response({'error': 'Already applied to this job'}, status=status.HTTP_400_BAD_REQUEST)
        
        application = {
            'user_id': str(user_id),
            'job_id': job_id,
            'hr_id': hr_id,
            'applied_at': datetime.utcnow()
        }
        
        Job_applied_collection.insert_one(application)
        
        return Response({'message': 'Application submitted successfully'}, status=status.HTTP_201_CREATED)

    except jwt.ExpiredSignatureError:
        return Response({'error': 'Token expired'}, status=status.HTTP_401_UNAUTHORIZED)
    except jwt.InvalidTokenError:
        return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
@api_view(['GET'])

def check_applied(request):
    auth_header = request.META.get('HTTP_AUTHORIZATION', '') or request.headers.get('Authorization', '')
    
    try:
        token = auth_header.split(' ')[-1] if ' ' in auth_header else auth_header
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        user_id = payload['id']
        job_id = request.query_params.get('job_id')
        
        if not job_id:
            return Response({'error': 'Missing job_id'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if application exists
        application = Job_applied_collection.find_one({
            'user_id': str(user_id),
            'job_id': job_id
        })
        
        return Response({'applied': application is not None}, status=status.HTTP_200_OK)
    
    except Exception as e:
        print("Error in check_applied:", str(e))
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timedelta
import os
# from dotenv import load_dotenv

# load_dotenv()

# MongoDB connection setup would be here
# ...

@api_view(['GET'])
def fetch_and_store_jobs(request):
    """
    Fetch jobs from JSearch API and store in MongoDB
    """
    try:
        # First, delete all existing jobs
        Api_Job_collection.delete_many({})
        
        # JSearch API parameters
        url = "https://jsearch.p.rapidapi.com/search"
        querystring = {
            "query": "Software Engineer",  # Default query, can be parameterized
            "page": "1",
            "num_pages": "3",  # Get more pages for more results
            "date_posted": "today",  # Get only today's jobs
            "employment_types": "FULLTIME",
        }
        
        headers = {
            "X-RapidAPI-Key": os.getenv('44491fd700msh827d20b1bd779b9p192e4cjsne0003142b454'),
            "X-RapidAPI-Host": os.getenv('jsearch.p.rapidapi.com')
        }
        
        response = requests.get(url, headers=headers, params=querystring)
        response.raise_for_status()
        data = response.json()
        
        if data.get('status') != 'OK':
            return Response({'error': 'JSearch API returned non-OK status'}, 
                          status=status.HTTP_502_BAD_GATEWAY)
        
        jobs_data = data.get('data', [])
        current_time = datetime.now()
        
        # Process and store jobs
        processed_jobs = []
        for job in jobs_data:
            processed_job = {
                'job_id': job.get('job_id'),
                'employer_name': job.get('employer_name'),
                'job_title': job.get('job_title'),
                'job_country': job.get('job_country'),
                'job_state': job.get('job_state'),
                'job_city': job.get('job_city'),
                'job_description': job.get('job_description'),
                'job_employment_type': job.get('job_employment_type'),
                'job_min_salary': job.get('job_min_salary'),
                'job_max_salary': job.get('job_max_salary'),
                'job_salary_period': job.get('job_salary_period'),
                'job_salary_currency': job.get('job_salary_currency'),
                'job_posted_at_timestamp': job.get('job_posted_at_timestamp'),
                'job_apply_link': job.get('job_apply_link'),
                'employer_logo': job.get('employer_logo'),
                'job_is_remote': job.get('job_is_remote'),
                'fetched_at': current_time,
                'expires_at': current_time + timedelta(days=1),  # 24 hour expiration
                'source': 'jsearch'
            }
            processed_jobs.append(processed_job)
        
        if processed_jobs:
            Api_Job_collection.insert_many(processed_jobs)
        
        return Response({
            'message': f'Successfully stored {len(processed_jobs)} jobs',
            'jobs_processed': len(processed_jobs)
        }, status=status.HTTP_200_OK)
    
    except requests.exceptions.RequestException as e:
        return Response({
            'error': 'JSearch API request failed',
            'details': str(e)
        }, status=status.HTTP_502_BAD_GATEWAY)
    except Exception as e:
        return Response({
            'error': 'Internal server error',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_all_jobs1(request):
    try:
        # Test connection first
        print("Collections in database:", Api_Job_collection.database.list_collection_names())
        
        # Count documents
        count = Api_Job_collection.count_documents({})
        print(f"Found {count} documents in collection")
        
        jobs = list(Api_Job_collection.find({}))
        print("First 3 jobs:", jobs[:3])  # Print sample if exists
        
        for job in jobs:
            job['_id'] = str(job['_id'])
            
        return Response(jobs, status=status.HTTP_200_OK)
    except Exception as e:
        print("Error:", str(e))
        return Response({'error': str(e)}, status=500)