from django.urls import path, include
from rest_framework import routers 
from rest_framework.documentation import include_docs_urls 
from api import views

router=routers.DefaultRouter()
#router2=routers.DefaultRouter()
router.register(r'programmmers',views.ProgrammerViewSet)
router.register(r'Alumno',views.AlumnoViewSet)
router.register(r'Clase2',views.Clase2ViewSet)
router.register(r'Profesor',views.ProfesorViewSet,'Profesor')
router.register(r'Inscripcion',views.InscripcionViewSet,'Inscripcion')
router.register(r'Criterio',views.CriterioViewSet,'Criterio')
router.register(r'ClaseCriterio',views.ClaseCriterioViewSet,'ClaseCriterio')
router.register(r'Entrega',views.EntregaViewSet,'Entrega')
router.register(r'Calificacion', views.CalificacionViewSet,'Calificacion')
router.register(r'Asistencia', views.AsistenciaViewSet, 'AsistenciaViewSet')


urlpatterns =[
    path('',include(router.urls)),
    path('docs/',include_docs_urls(title="API"))
]