from django.urls import path
# from .views import check_user # Import the new view function



from .views import toggle_apply_job,update_profile

from .views import check_auth, dashbord, index, job_list_view, login_view, logout_view, signup, user_list, hr_list, api_jobs,get_user_profile


urlpatterns = [  
    # path('check_user/', check_user, name='check_user'),  # Add the new URL pattern
  


    path('apply/', toggle_apply_job, name='toggle_apply_job'),  
    path('hr_list/', hr_list, name='hr_list'),
    path('api_jobs/', api_jobs, name='api_jobs'),
    path('', index, name='index'),
    path('signup/', signup, name='signup'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('dashbord/', dashbord, name='dashbord'),
    path('job_list/', job_list_view, name='job_list'),
    path('user_list/', user_list, name='user_list'),
    path('update_profile/', update_profile, name='update_profile'),
   
  
    path('toggle_apply_job/', toggle_apply_job, name='toggle_apply_job'),
    path('get_user_profile/', get_user_profile, name='get_user_profile'),
]
