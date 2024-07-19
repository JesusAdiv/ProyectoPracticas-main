import LoginCard from "../components/loginCard"

export default function Login(){

    return(
        <div className="flex w-full h-screen">
            <div className="w-full flex items-center justify-center lg:w-1/2 ">
                <LoginCard></LoginCard>
            </div>
            <div className="flex-col hidden lg:flex h-full w-1/2 items-center justify-center">
                <b className="text-3xl">Sistema de Control Escolar</b>
                <div className="text-base mt-3 w-9/12">Para ingresar al sistema, coloque su correo institucional como usuario y la contraseña enviada a su correo.</div>
            </div>
        </div>
    )
}
