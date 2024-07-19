import { Outlet } from "react-router-dom"
import Sidebar from "../components/sidebarAdmin"
import Toast from "../components/toast"


export default function Layout(){
    return(
        <div className="min-h-screen grid grid-cols-1 xl:grid-cols-6 scrollbar-hide">
            <Toast></Toast>
            <Sidebar/>
            <div className="xl:col-span-5 bg bg-secondary-900 ">
                <div className="h-full overflow-y-scroll scrollbar-hide p-4 bg-secondary-100">
                    <Outlet/>
                </div>
            </div>
        </div>
    )
}