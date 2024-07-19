import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import Sidebar from "../components/sidebar"
import Header from "../components/header"
import Toast from "../components/toast"
import { Nav } from "../components/navbar"
import { useState, createContext } from "react"
import { revisarEstadoSesion } from "../services/profesor.api"


export const NavContext = createContext();
export const claseContext = createContext();
export const profesorContext = createContext();

export default function LayoutProfesor() {
    const location = useLocation();
    const navigate = useNavigate();
    const profesor = new URLSearchParams(location.search).get('email');
    const nombre = new URLSearchParams(location.search).get('nombre');

    //Estados de la NavBar
    const [shownav, setshownav] = useState(false);
    const showNav = () => {
        setshownav(true);
    }
    const dontshowNav = () => {
        setshownav(false);
    }

    //Estados de una clase
    const [dataClase, setDataClase] = useState([]);
    const limpiarDatos = () => {
        setDataClase([]);
    }
    const asignarDatos = (datos) => {
        setDataClase(datos);
    }

    //Estados de un Profesor
    const [dataProfesor, setDataProfesor] = useState(profesor);
    const limpiarProfesor = () =>{
        setDataProfesor("");
    }

    useEffect(() => {
     async function autenticacion () {
      let sesionUsuarioApp = window.localStorage.getItem("sesionUsuarioApp");
      if(sesionUsuarioApp)
      {
       let profesor = JSON.parse(sesionUsuarioApp);
       let res = await revisarEstadoSesion(profesor.id,profesor.token);
       console.log("Layout")
       console.log(res)
       if(res.data.estadoSesion!=0)
        navigate("/");
       // setDataProfesor(res.data.nombre)
      }
      else
       navigate("/");
     }

     autenticacion();

    }
    ,[])


    return (
        <profesorContext.Provider value={{dataProfesor, limpiarProfesor}}>
            <claseContext.Provider value={{ dataClase, limpiarDatos, asignarDatos }}>
                <div className="flex h-screen overflow-hidden">
                    <Toast></Toast>
                    <Sidebar />
                    <div className="flex flex-col flex-1">
                        <Header />
                        {shownav && <Nav clase={dataClase}/>}
                        <div className="flex-1 overflow-y-auto px-4 pb-8">
                            <NavContext.Provider value={{ shownav, showNav, dontshowNav }}>
                                <Outlet/>
                            </NavContext.Provider>
                        </div>
                    </div>
                </div>
            </claseContext.Provider>
        </profesorContext.Provider>
    )
}
