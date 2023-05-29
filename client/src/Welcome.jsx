import React from 'react'
import axios from 'axios'
import {useState,useRef} from 'react'
// import User from './User'

export default function LogIn(){
    // console.log(User[0])
    const [LoggedUser,setLoggeduser]=useState(JSON.parse(sessionStorage.getItem("user")))
    console.log(LoggedUser)
    const userAccounts=LoggedUser.user===undefined?LoggedUser.accountArr:LoggedUser.user.accountArr
    const userToken={token:LoggedUser.token}
    const transferTo=useRef()
    const amount=useRef()
    const transferFrom=useRef()
    const accountTransaction=useRef()
    const [transaction,setTransaction]=useState(false)
    const [history,setHistory]=useState([])
    
    const createAccount=async(e)=>{
        e.preventDefault()
        try{
            const response=await axios.post('http://localhost:8000/accounts',userToken)
            setLoggeduser(response.data)
            // User.pop()
            // User.push(response.data)
            // console.log(LoggedUser)
            // console.log(userAccounts)
            // navigate('/welcome')
        }
        catch(err){
            console.log(err.response)
        }
    }
    
    const handleTransfer=async(e)=>{
        e.preventDefault()
        
        const request={
            token:LoggedUser.token,
            amount:amount.current.value,
            transferTo:transferTo.current.value,
            transferFrom:transferFrom.current.value
        }
        console.log('request:',request)
        try{
            const response=await axios.post('http://localhost:8000/transfer',request)
            // console.log(response)
            setLoggeduser(response.data)
        }
        catch(err){
            console.log(err)
        }
    }

    const showTransactions=async(e)=>{
        e.preventDefault()
        const request={
            token:LoggedUser.token,
            account:accountTransaction.current.value
        }
        // console.log(request)
        try{
            const response=await axios.post('http://localhost:8000/transactionHistory',request)
            setTransaction(true)
            setHistory(response.data)
            // console.log(response)

        }
        catch(err){
            console.log(err)
        }
    }

    return(
        <>
        <h1>Welcome {(LoggedUser.user!==undefined)?LoggedUser.user.username:LoggedUser.username}</h1>
        <h2>Here are your accounts:</h2>
        {userAccounts.map((account)=>(
            <>
            <h3>Account Number: {account.accountNumber}</h3>
            <h3>Balance: {account.balance}</h3>
            </>
        ))}
        <form onSubmit={handleTransfer}>
                <input type='text' placeholder="transferFrom" ref={transferFrom} required/>
                <input type='text' placeholder="transferTo" ref={transferTo} required/>
                <input type='text' placeholder='amount' ref={amount} required/>
                <button type='submit' >Transfer</button>
            </form>
        <button onClick={createAccount}>Create a new account</button>
        <form onSubmit={showTransactions}>
            <h3>View Transactions </h3>
            <input type='text' placeholder="account number" ref={accountTransaction} required/>
            <button type="submit">Get Transactions</button>
        </form>
        {transaction && history.map(transactionObj=>(
            <>
                <h3>Transfer From: {transactionObj.transferFrom}</h3>
                <h3>Transfer To: {transactionObj.transferTo}</h3>
                <h3>Amount: {transactionObj.amount}</h3>
                <h3>Time: {transactionObj.timeOfTransaction}</h3>
                <hr/>
            </>
        ))}
        </>
    )
}