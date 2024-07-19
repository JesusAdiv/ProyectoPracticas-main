
import React, { useState, useEffect } from 'react';
import { extraerDatosMaterias } from '../services/importacion.js';
import MateriaCard from "../components/card"
import { Button } from "@nextui-org/react";
import {toast} from 'react-hot-toast';
import { getAllProfesores, createProfesor } from '../services/profesor.api.js';
import { getAllClases, crearClase } from '../services/clases.api.js';
import axios from "axios";


export default function Home() {
  const [archivoPDF, setArchivoPDF] = useState(null); 
  const [clases, setClases] = useState([]);
  const [resultadoExtraccion, setResultadoExtraccion] = useState(-1);
  const [mostrarTarjetas, setMostrarTarjetas] = useState(false);
  const [lista, setLista] = useState([]);



  const mensajesImportacion = [
    "¡Se han importado los datos del PDF exitosamente!", // 0 sin problemas
    "¡El archivo PDF esta vacio!", // 1
    "¡La estructura del documento no es valida!", //2
    "¡El tipo de archivo no es valido!",//3 Solo PDF
    "¡Seleccione un archivo primero!"//4 Sin archivo
  ];

  useEffect(()=>{
    async function cargarclases(){
      const res =  await getAllClases();
      console.log(res);
      setLista(res.data)
    }
    cargarclases();
  },[]);


  const registrarProfesores = async (listaClases) => {
   //console.log("Profesores:")
   let respuesta = await getAllProfesores();
   let nombreProfesoresBD = respuesta.data.map( (profesor) => profesor.nombre )
   let nombreProfesores = listaClases.map( (clase) => clase.nombreProfesor); 
   //console.log(nombreProfesores);
   let auxProfesores = new Set(nombreProfesores);
   let listaProfesoresEncontrados = [...auxProfesores];
   //console.log(listaProfesoresEncontrados);
   let profesoresNoEncontrados = listaProfesoresEncontrados.filter( (profesor) => !nombreProfesoresBD.includes(profesor) );
   console.log(profesoresNoEncontrados)
   //let profesoresCreados = []
   let promesas = profesoresNoEncontrados.map( profesor => createProfesor({"nombre":profesor}));
   await Promise.all(promesas).then( res => {console.log("Profesores creados")});

   //console.log(profesoresUnicos);
   
  }

  const obtenerDatosProfesores = async (listaClases) => {
   let respuesta = await getAllProfesores();
   let profesoresBD = respuesta.data;
   let profesoresExtraccion = [...new Set(listaClases.map( (clase) => clase.nombreProfesor))]; 
   let listaProfesores = profesoresBD.filter( (profesor) => profesoresExtraccion.includes(profesor.nombre) );
   return listaProfesores;
   

  }
  
  const registrarClases = async (listaClases) => {
   let profesores = await obtenerDatosProfesores(listaClases);
   let JSONClase = {
    "nrc":"",
    "clave":"",
    "seccion":"",
    "nombreMateria":"",
    "id_profesor":""
   }
   for(let clase of listaClases)
   {
    let profesor = profesores.find( (profesor) => profesor.nombre==clase.nombreProfesor)
    JSONClase = {
     "nrc": clase.nrc,
     "clave": clase.clave,
     "seccion": clase.seccion,
     "nombreMateria": clase.nombreMateria,
     "id_profesor": profesor.id
    }
    console.log( await crearClase(JSONClase) );
   }
  }

  const manejarArchivo = (e) => {
    let archivoSeleccionado = e.target.files[0];
    if (archivoSeleccionado) {
      let tipoArchivo = archivoSeleccionado.type;
      if (tipoArchivo === "application/pdf") { // Validar que sea un archivo PDF
        let leerArchivo = new FileReader();
        leerArchivo.readAsArrayBuffer(archivoSeleccionado);
        leerArchivo.onload = (e) => {
        setArchivoPDF(e.target.result);
        };
      } else { 
      toast.error("Por favor seleccione un archivo PDF");
      }
    }
  };

  const leerPDF = async (e) => {
    e.preventDefault();
    const response = await extraerDatosMaterias(archivoPDF);
    if (response) {
      const { resultado, clases: listaClases } = response;
      let nuevaLista = [];
      let bandera = 0;
      for (let i = 0; i < listaClases.length; i++) {
        bandera=0;
        lista.map((clase, index)=>{
          if (clase.nrc == listaClases[i].nrc) {
            bandera = 1; 
          }
        })
        if (bandera == 0) {
          nuevaLista.push(listaClases[i])
        }
      }
      setClases(nuevaLista);
      await registrarProfesores(nuevaLista);
      console.log("Profesores registrados");
      await registrarClases(nuevaLista);

    /*  for (let i = 0; i < nuevaLista.length; i++) {
        axios.post(import.meta.env.VITE_BACKEND_URL + "Clase2/", nuevaLista[i]).then( res => {
        console.log(res);
       });
      } */
      setResultadoExtraccion(resultado);
      setMostrarTarjetas(resultado === 0);
      


      if (resultado != 0) {
      toast.error(mensajesImportacion[resultado]);
        
      }else{
      toast.success(mensajesImportacion[resultado]);
      }
    } else {
      toast.error('Selecciona un archivo primero');
    }
    
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-full">
      {!mostrarTarjetas && (
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-center text-3xl font-bold mb-8">
            Parece que aún no tienes registrada ninguna clase
          </h1>
          <form className="mb-4">
            <input type="file" accept=".pdf" id="cargar" name="archivo" onChange={manejarArchivo} />
          </form>
          <Button
          radius="large"
          className="bg-gradient-to-tr from-primary-100 to-primary-200 text-white mt-20"
          onClick={leerPDF}
        >
          Extraer datos
        </Button>
        </div>
      )}

      {mostrarTarjetas && (
        <div className="grid grid-cols-3 gap-4 p-4 ">
          {clases.map((clase, index) => (
            <MateriaCard key={index} clase={clase} />
          ))}
        </div>
      )}
    </div>
  );
}

