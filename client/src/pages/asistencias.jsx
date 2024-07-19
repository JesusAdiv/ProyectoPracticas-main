import React, { useContext, useEffect } from "react";
import { NavContext } from "../layouts/layoutProfesor";



const Asistencias = () => {

  const { showNav, shownav } = useContext(NavContext);

  useEffect(() => {
    showNav();
  }, [])

  console.log(shownav)

  return (
    <div className="items-center text-center mt-10">
      <i className="pi pi-hammer" style={{fontSize:"50px"}}/>
      <h2 className="text-2xl font-bold">Seccion en construccion </h2>
    </div>
  )
}

export default Asistencias 