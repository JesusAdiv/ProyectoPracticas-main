import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaChalkboardTeacher } from "react-icons/fa";
import { IoIosSchool } from "react-icons/io";
import { IoTimeOutline } from "react-icons/io5";


// Componente de link para el sidebar
function NavLink({ to, icon: Icon, text, active, onClick }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-4 px-4 py-2 rounded-lg hover:bg-secondary-100 ${active ? "bg-primary-100" : ""}`}
      style={{ marginBottom: "8px" }}
      onClick={onClick}
    >
      <Icon />
      {text}
    </Link>
  );
}

export default function Sidebar() {
  const [activeLink, setActiveLink] = useState("");
  const handleLinkClick = (link) => {
    setActiveLink(link);
  };

  return (
    <div className="bg-secondary-900 h-[100vh] overflow-y-scroll scrollbar-hide p-4">
      <h1 className="text-center text-2xl font-bold mb-10">BUAP</h1>
      <nav>
        <NavLink
          to="/admin"
          icon={FaChalkboardTeacher}
          text="Clases"
          active={activeLink === "/admin"}
          onClick={() => handleLinkClick("/admin")}
        />

        <NavLink
          to="/admin/profesores"
          icon={IoIosSchool}
          text="Profesores"
          active={activeLink === "/admin/profesores"}
          onClick={() => handleLinkClick("/admin/profesores")}
        />       
      </nav>
    </div>
  );
}