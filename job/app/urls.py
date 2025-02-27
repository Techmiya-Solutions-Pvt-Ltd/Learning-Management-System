from django.urls import path
from .views import toggle_apply_job

from .views import add_person, check_auth, dashbord, get_person, index, job_list_view, login_view, logout_view, signup, user_list, update_profile, update_password, toggle_apply_job, hr_list

urlpatterns = [  
    path('apply/', toggle_apply_job, name='toggle_apply_job'),  
    path('hr_list/', hr_list, name='hr_list'),
    path('', index, name='index'),
    path('signup/', signup, name='signup'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('dashbord/', dashbord, name='dashbord'),
    path('job_list/', job_list_view, name='job_list'),
    path('user_list/', user_list, name='user_list'),
    path('update_profile/', update_profile, name='update_profile'),
    path('update_password/', update_password, name='update_password'),
    path('toggle_apply_job/', toggle_apply_job, name='toggle_apply_job'),
]