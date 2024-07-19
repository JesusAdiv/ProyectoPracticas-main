import { useState} from 'react'
import * as XLSX from 'xlsx'; 


function ImportacionAlumnos() {

  const [archivoExcel, setArchivoExcel] = useState(null);
  const [alumnos, setAlumnos] = useState(null);


  //
  // ----------------------------------------------------
  // --- Estados de la variable 'resultadoExtraccion' ---
  // ----------------------------------------------------
  //
  // 0 => Indica que la extraccion se realizo correctamente
  //
  // 1 => Indica que el archivo esta vacio
  //
  // 2 => Indica que el Excel tiene una estructura interna invalida.
  //
  // 3 => Indica que se ha seleccionado un archivo con un tipo diferente a Excel
  //
  // 4 => Indica que se intentando comenzar con el proceso de lectura del Excel sin tener algun archivo seleccionado.
  //
  const [resultadoExtraccion, setResultadoExtraccion] = useState(-1);

  // Esta variable contiene los mensajes que aparecen en cada uno de los posibles escenarios identificados hasta el momento.
  const mensajesImportacionExcel = ["¡Se han importado los datos del Excel exitosamente!",
                               "¡¡¡El archivo Excel esta vacio!!!",
                               "¡¡¡La estructura del documento no es valida!!!",
                               "¡¡¡El tipo de archivo no es valido!!!",
                               "¡Seleccione primero un archivo!",  
                              ];
                              
  //
  // ---------------------------------------------------------------------------------
  //  Esta funcion detecta cuando se ha seleccionado un archivo mediante el formulario
  // ---------------------------------------------------------------------------------
  //
  const manejarArchivo = (e) =>{
    let archivoSeleccionado = e.target.files[0];

    if (archivoSeleccionado) {
      let tipoArchivo = archivoSeleccionado.type;
      console.log(tipoArchivo);
      if (tipoArchivo === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") { // Validar que sea un archivo PDF
        let leerArchivo = new FileReader();
        leerArchivo.readAsArrayBuffer(archivoSeleccionado);
        leerArchivo.onload = (e) => {
          setArchivoExcel(e.target.result);
        };
      }
      else
      {
       setResultadoExtraccion(3);
      } 

    }
  }
  
  //
  // ------------------------------------------------------------------------------------------------------------
  //  Funcion que permite obtener el nombre y los apellidos de los alumnos dentro del String extraido del Excel.
  // ------------------------------------------------------------------------------------------------------------
  //
  const procesarNombreCompleto = (nombreAlumno) =>{
   let auxiliarNombreAlumno = nombreAlumno.split(","); //Se divide el String en 2 partes, tomando como referencia el simbolo ',' para la division.
   let nombre = auxiliarNombreAlumno[1].trim(); // Se obtiene el nombre del alumno, borrando a su vez los espacios que puedan existir al principio y al final del nombre.
   let apellidos = auxiliarNombreAlumno[0]; // Se obtienen los apellidos del alumno
   return {nombre, apellidos}; //Se regresa el nombre y apellidos del alumno.
  }
  
  //
  // ------------------------------------------------------------------------------------------------------------
  //  Esta funcion permite extraer los correos de los alumnos que estan dentro de un mismo String inicialmente.
  // ------------------------------------------------------------------------------------------------------------
  //
  const obtenerCorreos = (correos) =>{
   const contenidoBuscado = /\w+\.\w+@alumno.buap.mx /g; //Patron que se utilizara para buscar los correos dentro del String.
   let listaCorreos = correos.match(contenidoBuscado); // Se buscan todos aquellos elementos dentro del String que cumplan con el patron indicado,
                                                       // obteniendo como resultado un arreglo con todos los correos.
   return listaCorreos; //Se regresa el arreglo con todos los correos.
  }

  //
  // ---------------------------------------------------------------------------------------------------------
  //  Esta funcion permite crear un arreglo de objetos con los datos que se almacenaran en la base de datos.
  // ---------------------------------------------------------------------------------------------------------
  //
  const crearJSON_Alumnos = (datosAlumnos, listaCorreos) => {
   let listaAlumnos;
   //Se recorre el arreglo con los datos extraidos del Excel, con el proposito de obtener aquellos datos
   //que se enviaran a la API.
   listaAlumnos = datosAlumnos.map((alumno, indice) =>{
    let {nombre, apellidos} = procesarNombreCompleto(alumno["Nombre de Alumno"]); //Se procesa el nombre completo de uno de los alumnos, obteniendo su nombre y apellido.
    let registroAlumno = { //Estructura que contiene los campos definidos en el modelo de la base de datos para Alumno.
     "matricula": alumno.ID,
     "nombre": nombre,
     "apellidos": apellidos,
     "correo": listaCorreos[indice],
    };
    return registroAlumno; //Se agrega el objeto generado al arreglado llamado "listaAlumnos";
    });
   return listaAlumnos; //Se retorna el arreglo con los datos de los alumnos.
  }

  //
  // -----------------------------------------------------------------------------
  // Funcion la cual permite validar si la estructura interna del Excel es valida.
  // ------------------------------------------------------------------------------
  //
  //  ---------------
  //  ---Variables---
  //  ---------------
  //
  //  -------------------------------------------------------------------
  //   existeNombre, existeMatricula, existeCorreo, esValido -> Booleano
  //  -------------------------------------------------------------------
  //
  const validarEstructuraExcel = (contenidoExcel) =>{
    const campoNombre = /[A-Z]+\s\w+,\s[A-Z\s\.]+/g; //Patron que se utilizara para verificar si el Excel contiene el campo Nombre.
    const campoMatricula = /\d{9}/g; //Patron que se utilizara para verificar si el Excel contiene el campo Matricula.
    const campoCorreo = /\w+\.\w+@alumno.buap.mx /g; //Patron que se utilizara para verificar si existe el campo Correo.
    let existeNombre = false; //Indica si existe el campo Nombre.
    let existeMatricula = false; //Indica si existe el campo Matricula
    let existeCorreo = false; //Permite conocer si existe el campo Correo dentro del Excel.
    let esValido = false; // Se utilizara para conocer si la estructura del Excel es valida.
    existeNombre = contenidoExcel.search(campoNombre)!= -1?true:false; //Se busca si existe el campo Nombre.
    existeMatricula = contenidoExcel.search(campoMatricula)!= -1?true:false; //Se busca si existe el campo Matricula.
    existeCorreo = contenidoExcel.search(campoCorreo)!= -1?true:false; // Se busca si existe el campo Correo dentro del Excel.
    
    esValido = existeNombre && existeMatricula && existeCorreo; //Se verifica si existen los 3 campos necesarios para poder leer el Excel
    return esValido;

  }


  //
  // --------------------------------------------------------
  //  Funcion que permite la extraccion de los datos del PDF
  // --------------------------------------------------------
  //
  const leerExcel = async (e) =>{
    e.preventDefault();
    if(archivoExcel!=null)
    { //Se verifica si el usuario ha seleccionado el archivo Excel.
     const workbook = await XLSX.read(archivoExcel, {type: 'buffer'}); //Se obtiene la referencia al archivo Excel
     const worksheetName = await workbook.SheetNames[1]; //Se obtiene el nombre de la segunda hoja del Excel, la cual es aquella que contiene los datos de los alumnos.
     const worksheet = await workbook.Sheets[worksheetName]; //Se obtiene la referencia a la segunda hoja de Excel mediante su nombre.
     const excelValido = validarEstructuraExcel(XLSX.utils.sheet_to_txt(worksheet)); //Se verifica si la estructura del Excel es valida.
     if(!excelValido)
     { //Si el Excel no tiene una estructura valida, entonces se asigna un valor igual 2 al estado llamado "resultadoExtraccion".
      setResultadoExtraccion(2);
     }
     else
     {//Si el Excel tiene una estructura valida, entonces comienza el proceso de extraccion.
      let datosAlumnos = await XLSX.utils.sheet_to_json(worksheet); // Se obtiene un arreglo con cada una de las filas de la segundo hoja del archivo Excel
      datosAlumnos.shift(); //Se elimina el primer elemento del arreglo, debido a que contiene informacion de los encabezados de la tabla.
      let correosAlumnos = datosAlumnos.pop()["Número de"]; //Se extrae el ultimo elemento del arreglo, el cual contiene los correos de los estudiantes.
      const listaCorreos = obtenerCorreos(correosAlumnos).map((correo) => correo.trim()); //Se procesa el String con los correos, obteniendo una arreglo con los correos de los alumnos.
      const listaAlumnos = crearJSON_Alumnos(datosAlumnos, listaCorreos); //Se procesa el arreglo con los datos de los alumnos, obteniendo otro arreglo con los datos mas relevantes de los alumnos
      console.log(listaAlumnos);
      setAlumnos(listaAlumnos); //Se guarda el arreglo obtenido en el estado "listaAlumnos";
      setResultadoExtraccion(0); //Se indica que el proceso de extraccion se realizo correctamente.
     }
    }
    else
    { //Si el usuario aun no ha seleccionado algun archivo, se asignara un valor igual a 4 al estado "resultadoExtraccion".
     setResultadoExtraccion(4);
    }
   }


  return (
    <>
      <div>
      </div>
      <h1>Leer un archivo Excel</h1>
      <form>
      <label htmlFor="cargar">Seleccione su archivo: </label>

      <input type="file" accept=".xlsx" id="cargar" name="archivo" onChange={manejarArchivo} />


      </form>
      <br/>

      <button className="botonExtraer" onClick={leerExcel}> Extraer datos</button>
      <br/>
      <br/>
      {
      resultadoExtraccion !=-1 &&

      <h3 style={{paddingTop:"6px", paddingBottom:"6px", color:"white", backgroundColor: resultadoExtraccion==0?"green":"firebrick", borderRadius:"8px"}}>
       { resultadoExtraccion != -1  && mensajesImportacionExcel[resultadoExtraccion]}
      </h3>

      }
      <br/>      
      <hr></hr>
      <h2>Lista de Alumnos:</h2>
      <div>
       {
        alumnos!=null &&
        alumnos.map( (alumno, indice) => (
                                        <div key={indice}>
                                        
                                        <p> 
                                         <strong>Nombre:</strong> {alumno["nombre"] +" "+ alumno["apellidos"]}                                         
                                        </p>

                                        <p> 
                                         <strong>Matricula:</strong> {alumno["matricula"]}                                         
                                        </p>

                                        <p> 
                                         <strong>Correo:</strong> {alumno["correo"]}                                         
                                        </p>

                                        <hr></hr> 
                                        </div>
                                        )
                                        )
       }
      </div>
    </>
  )
}

export default ImportacionAlumnos;
