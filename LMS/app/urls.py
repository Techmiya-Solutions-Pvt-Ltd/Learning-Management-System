from django.urls import include, path
from . import views


urlpatterns = [
    path('signup/',views.signup,name='signup'),
    path('teachersignup/',views.teacher_signup,name='teachersignup'),
    path('loginauth/',views.login_view,name='login'),
    path('teacherlogin/',views.teacher_login,name='teacherlogin'),
    path('loginteacher/',views.teacher,name='loginteacher'),
    path('',views.dashbord,name='dashbord'),
    # path('dashbord1/',views.dashbord1,name='dashbord1'),
    path('accounts/',include('allauth.urls')),
    path('oauth/', include('social_django.urls', namespace='social')),
    path('logout/', views.logout_view, name='logout'),
    
    path('login/', views.index, name='index'),
    path('add/', views.add_person, name='add_person'),
    path('get/', views.get_person, name='get_person'),
    path('check-auth/', views.check_auth, name='check_auth'),
    
     path('teacher/google/login/', views.teacher_google_login, name='teacher_google_login'),
     path('teacher/github/login/', views.teacher_github_login, name='teacher_github_login'),
]