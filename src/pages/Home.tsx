import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export default function Home() {
    const [nama, setNama] = useState<string | null>(null)
    const [status, setStatus] = useState<string | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        const token = localStorage.getItem("auth_token")
        const user = localStorage.getItem("user")

        if (!token || !user) {
            navigate("/auth/mentor/login")
            return
        }

        try {
            const userData = JSON.parse(user)
            setNama(userData.nama)
            setStatus(userData.status)
        } catch (error) {
            console.error("Error parsing user data:", error)
            navigate("/auth/mentor/login")
        }
    }, [navigate])

    return (
        <div>
            {status == "mentor" ? <h1>Hi, Ust.{nama}</h1> : <h1>Hi, {nama}</h1>}
        </div>
    )
}
