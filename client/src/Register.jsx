import React from 'react'
import axios from 'axios'
import {useRef} from 'react'
import { useNavigate } from 'react-router-dom'
export default function Register(){
    const username=useRef()
    const email=useRef()
    const password=useRef()
    const navigate=useNavigate()

    const handleSubmit=async (e)=>{
        e.preventDefault()
        console.log('registered')
        const user={
            username:username.current.value,
            password:password.current.value,
            email:email.current.value
        }
        try{
            await axios.post('http://localhost:8000/signup',user)
            // console.log(response)
            navigate('/login')
        }
        catch(err){
            console.log(err.response)
            if(err.response.status===409)
            navigate('/login')
        }
    }
    return (
        <>
            <h1>This is Register page</h1>
            <form onSubmit={handleSubmit}>
                <input type='text' placeholder='username' name='username' ref={username} required />
                <input type='email' placeholder='emailId' name='email address' ref={email} required />
                <input type='password' placeholder='password' name='password' ref={password} required />
                <button type="submit">Register</button>
            </form>
        </>
    )
}