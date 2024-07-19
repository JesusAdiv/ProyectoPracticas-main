import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAtom } from "jotai";
import { alumnosAtom } from "../pages/alumnos";
import { criteriosAtom } from "../pages/criterios";

import { obtenerListaAlumnos } from "../services/inscripcion.api";
import { getCriteriosByNRC } from "../services/claseCriterio.api";



function NavLink({ to, text, active, onClick }) {
  return (
    <Link
      to={to}
      className={` flex-grow text-center items-center justify-center px-2 py-1 rounded-full hover:bg-secondary-100 ${active ? "bg-primary-100" : ""}`}
      style={{ marginBottom: "8px", marginRight: "8px" }}
      onClick={onClick}
    >
      <div className="justify-center w-full ">
        {text}
      </div>
    </Link>
  );
}

export const Nav = ({clase}) => {
  const [activeLink, setActiveLink] = useState("/profesor/alumnos");
  const [mostrarEntregas, setMostrarEntregas] = useState(false);
  const [mostrarAsistencia, setMostrarAsistencia] = useState(false);

  const [ existenAlumnos, setExistenAlumnos ] = useAtom(alumnosAtom);
  const [ existenCriterios, setExistenCriterios ] = useAtom(criteriosAtom);

  console.log(clase);

  const handleLinkClick = (link) => {
    setActiveLink(link);
  };

  useEffect( () => {
   const existenAlumnos2 = async () => {
    let auxExistenAlumnos = false; 
    let res = await obtenerListaAlumnos(clase.nrc)
    if(res.length>0)
     auxExistenAlumnos = true;
    return auxExistenAlumnos;
    
   }
   
   const existenCriterios2 = async () => {
    let auxExistenCriterios = false;
    let res = await getCriteriosByNRC(clase.nrc);
    console.log("Criterios")
    console.log(res.data);
    if(res.data.length>0)
     auxExistenCriterios = true;
    return auxExistenCriterios;
   }
   
   existenAlumnos2().then( (resExistenAlumnos) => {
    if(resExistenAlumnos==true)
    {
     setExistenAlumnos(true);
     existenCriterios2().then( (resExistenCriterios) => {
      console.log("Alumnos:"+resExistenAlumnos+", Criterios:"+resExistenCriterios)
      if(resExistenCriterios==true)
       setExistenCriterios(true)
      else
       setExistenCriterios(false)
     })
    }
   });
  },[]);

  return (
    <div className="bg-secondary-900 w-full p-1">
      <nav className="flex">
        <NavLink
          to="/profesor/alumnos"
          text="Alumnos"
          active={activeLink === "/profesor/alumnos"}
          onClick={() => handleLinkClick("/profesor/alumnos")}

        />

        {
         existenAlumnos && existenCriterios &&

         (
        <NavLink
          to="/profesor/entregas"
          text="Entregas"
          active={activeLink === "/profesor/entregas"}
          onClick={() => handleLinkClick("/profesor/entregas")}
        />
         ) 
        }

        {
         existenAlumnos &&
        (
        <NavLink
          to="/profesor/criterios"
          text="Criterios"
          active={activeLink === "/profesor/criterios"}
          onClick={() => handleLinkClick("/profesor/criterios")}
        />
        )
        }

        {
         existenAlumnos && existenCriterios &&

         (
         <NavLink
          to="/profesor/asistencias"
          text="Asistencias"
          active={activeLink === "/profesor/asistencias"}
          onClick={() => handleLinkClick("/profesor/asistencias")}
         />
         )
        }     
      </nav>
    </div>
  );
}
