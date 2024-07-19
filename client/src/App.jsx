import { BrowserRouter, Route, Routes } from "react-router-dom"


//import layout
import Layout from "./layouts/layout"
import LayoutProfesor from "./layouts/layoutProfesor";
import LayoutAlumno from "./layouts/layoutAlumno";

//importpages
import Home from "./pages/homepage";
import Profesores from "./pages/profesores";
import Error404 from "./pages/error404";
import Historico from "./pages/historico"
import Alumnos from "./pages/alumnos";
import Login from "./pages/login";
import HomeProfesor from "./pages/homepageProfesor";
import Criterios from "./pages/criterios";
import Entregas from "./pages/entregas";
import RegistroCalificaciones from "./pages/registroCalificaciones";
import Asistencias from "./pages/asistencias";

export default function App() {
  return (
   <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login/>}/>
      <Route path="/admin" element={<Layout/>}>
        <Route index element ={<Home/>}/>
        <Route path="profesores" element={<Profesores/>}/>
      </Route>
      <Route path="/profesor" element={<LayoutProfesor/>}>
        <Route index element ={<HomeProfesor email=""/>}/>
        <Route path="historico" element ={<Historico/>}/>
        <Route path="alumnos" element={<Alumnos/>}/>
        <Route path="asistencias" element={<Asistencias/>}/>
        <Route path="entregas" element={<Entregas/>}>
         <Route path="reporte" element={<RegistroCalificaciones/>}/> 
        </Route>
        <Route path="criterios" element={<Criterios/>}/>
      </Route>
      <Route path="/alumno" element={<LayoutAlumno/>}>

      </Route>
      <Route path="*" element={<Error404/>} />
      <Route path="/login" element={<Login/>}/>
    </Routes>
   </BrowserRouter> 
  )
}
