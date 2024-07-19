from django.db import models

# Create your models here.

class Programmer(models.Model):
    fullname = models.CharField(max_length=100)
    nickname = models.CharField(max_length=50)
    age = models.PositiveSmallIntegerField()
    is_active = models.BooleanField(default=True)


class Alumno(models.Model):
    matricula=models.PositiveBigIntegerField(primary_key=True)
    nombre=models.CharField(max_length=100)
    apellidos=models.CharField(max_length=100)
    correo=models.CharField(max_length=100)
    contrasena=models.CharField(max_length=100, blank=True)

    def __str__(self):
        return str(self.matricula )

class Materia(models.Model):
    clave=models.CharField(max_length=20)
    nombre=models.CharField(max_length=100)

class Clase(models.Model):
    seccion=models.CharField(max_length=100)


class Profesor(models.Model):
    nombre=models.CharField(max_length=250)
    correo=models.CharField(max_length=100, blank=True)
    contrasena=models.CharField(max_length=100, blank=True)
    token=models.CharField(max_length=50, blank=True)

    def __str__(self):
        return self.nombre

class Periodo(models.Model):
    nombre=models.CharField(max_length=100)
    plan=models.CharField(max_length=50)
    estado=models.CharField(max_length=50, choices={"ACTIVO":"ACTIVO","FINALIZADO":"FINALIZADO"})
    fecha_inicio=models.DateField()
    fecha_finalizacion=models.DateField()


class Clase2(models.Model):
    nrc=models.BigIntegerField(primary_key=True)
    clave=models.CharField(max_length=10)
    seccion=models.CharField(max_length=4)
    nombreMateria=models.CharField(max_length=250)
    id_profesor=models.ForeignKey(Profesor, on_delete=models.DO_NOTHING, default=0)


    def __str__(self):
        return str(self.nrc)

class Inscripcion(models.Model):
    clase = models.ForeignKey(Clase2, on_delete=models.DO_NOTHING, null=True)
    alumno = models.ForeignKey(Alumno, on_delete=models.DO_NOTHING, null=True)
    estado = models.CharField(max_length=50, choices=[("ACTIVA","ACTIVA"), ("PENDIENTE","PENDIENTE"), ("BAJA","BAJA")])

class Criterio(models.Model):
    id_criterio = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=250)

    def __str__(self):
        return str(self.id_criterio)

class ClaseCriterio(models.Model):
    id_clase = models.ForeignKey(Clase2, on_delete=models.DO_NOTHING, default=0, db_constraint=False)
    id_criterio = models.ForeignKey(Criterio, on_delete=models.DO_NOTHING, default=0, db_constraint=False)
    nombre = models.CharField(max_length=250)
    ponderacion = models.FloatField()

class Entrega(models.Model):
    nombre = models.CharField(max_length=250)
    tipo = models.ForeignKey(ClaseCriterio, on_delete=models.DO_NOTHING, default=1)  # Aquí estableces el valor predeterminado
    fecha = models.DateField()
    estado = models.CharField(max_length=50, choices=[("REGISTRADA","REGISTRADA"),("PENDIENTE","PENDIENTE")])

class Calificacion(models.Model):
    nota=models.FloatField()
    matricula = models.ForeignKey(Alumno, on_delete=models.DO_NOTHING, default=0)
    id_entrega = models.ForeignKey(Entrega, on_delete=models.DO_NOTHING, default=0)
    

## Esto yo lo hize
class Asistencia(models.Model):
    id_asistencia = models.AutoField(primary_key=True)
    matricula = models.CharField(max_length=20)
    materia_nrc = models.ForeignKey(Clase2, on_delete=models.CASCADE, to_field='nrc', db_column='materia_nrc')
    fecha = models.DateField()

    def __str__(self):
        return f"Asistencia {self.id_asistencia} - {self.matricula} - {self.fecha}"
    
