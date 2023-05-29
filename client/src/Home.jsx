import React from 'react'
import {useNavigate} from 'react-router-dom'
export default function Home(){
    const navigate=useNavigate()
    const handleLogin=()=>{
        navigate('/login')
    }
    const handleRegister=()=>{
        navigate('/register')
    }
    return (
        <>
            <h1>Welcome To Wallet!</h1>
            <button onClick={handleLogin}>LogIn</button>
            <button onClick={handleRegister}>Register</button>
        </>
    )
}