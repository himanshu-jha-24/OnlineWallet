import React from 'react'
import axios from 'axios'
import {useRef} from 'react'
import User from './User'
import { useNavigate } from 'react-router-dom'
export default function LogIn(){
    const username=useRef()
    const password=useRef()
    const navigate=useNavigate()
    const handleSubmit=async(e)=>{
        e.preventDefault()
        console.log('logged in')
        const user={
            username:username.current.value,
            password:password.current.value
        }
        try{
            const response=await axios.post('http://localhost:8000/login',user)
            User.push(response.data)
            // console.log(response.data)
            sessionStorage.setItem("user",JSON.stringify(response.data))
            navigate('/welcome')
        }
        catch(err){
            console.log(err)
            // alert('incorrect credentials')
        }
    }
    return(
        <>
        <h1>this is LogIn page</h1>
        <form onSubmit={handleSubmit}>
                <input type='text' placeholder='username' name='username' ref={username} required />
                <input type='password' placeholder='password' name='password' ref={password} required />
                <button type="submit">Login</button>
            </form>
        </>
    )
}