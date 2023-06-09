const express=require('express')
const app=express()
const crypto=require('crypto')
const cors=require('cors')
require('dotenv').config()
const jwt=require('jsonwebtoken')
// const data=require('./data.js')
const bcrypt =require('bcrypt')
const User=require('./User')
const db = require('./db')

app.use(express.json())
app.use(cors())

function generateAccountNumber() {
    let accountNumber = '';
    for (let i = 0; i < 10; i++) {
      accountNumber += Math.floor(Math.random() * 10)
    }
    return accountNumber;
}

function generateToken(username, password) {
    const token = crypto.createHash('sha256').update(username + password).digest('hex')
    return token
}

//create user
app.post('/signup',async (req,res)=>{
    const username = req.body.username
    const password = req.body.password
    // Check if the user already exists
    let sql=`select count(*) from Users where username='${username}'`
    let [resp,_]= await db.execute(sql)
    if(resp[0]['count(*)']>0)return res.status(403).json('user already exists')

    // Encrypt the password (example using simple hash)
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex')
   
    // Generate a unique account number
    const accountNumber = generateAccountNumber()
   
    // Create the new user
    let user=new User(username,hashedPassword,accountNumber,0)
    user=await user.save()

    // Send the response
    res.json({user})
  })

  app.post('/login',async(req,res)=>{
    const username = req.body.username
    const password = req.body.password
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex')

    let [response,_]=await User.getUserCount(username,hashedPassword)
    if(response[0]['count(*)']==0)
    return res.status(401).json('username or password is incorrect')
   
    // Generate a token for authentication
    const token = generateToken(username, hashedPassword)

    const [resp,__]=await User.getUserAccounts(username)
  
    //crete user object to send to client
    const accountArr=[...resp]
    const user={username,password:hashedPassword,accountArr}
    // console.log(resp)
    res.json({user,token})
  })
  
  // Middleware to check if a user is logged in
async function requireAuth (req, res, next) {
    const token = req.body.token
   
    // Check if the token is provided
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Missing token' })
    }
    // Find the user by the token
    const [users,_]=await User.getAllUsers()
    // console.log(users)
    const user = users.find((user) => generateToken(user.username, user.password) === token)
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' })
    }
   
    // Add the user object to the request for further processing
    const [resp,__]=await User.getUserAccounts(user.username)
    const accountArr=[...resp]
    const user1={username:user.username,password:user.password,accountArr}
    req.user = user1
    // console.log(user1)
    next()
  }

  // POST request handler for a logged-in user to generate a new account
app.post('/accounts', requireAuth, async (req, res) => {
  const user = req.user
  const token=req.body.token
  
  // Generate a unique account number
  const accountNumber = generateAccountNumber()
 
  // Create the new account
  await User.generateAccount(user.username,user.password,accountNumber)
 
  //update user info 
  const [resp,__]=await User.getUserAccounts(user.username)
    //crete user object to send to client
    const accountArr=[...resp]
    const user1={username:user.username,password:user.password,accountArr}
  // Send the response
  res.json({user1,token})
})

  //POST request to transfer money from one account to other
  app.post('/transfer',requireAuth,async(req,res)=>{
    const user=req.user
    const token=req.body.token
    const transferTo=req.body.transferTo
    const transferFrom=req.body.transferFrom
    const amount=req.body.amount
   
    // validate sender's account number
    const senderAccount=user.accountArr.find(account=>account.accountNumber===transferFrom) 
    if(!senderAccount)return res.status(401).json({error:"invalid sender account number"})
    
    // validate reciever's account number
    const [recipientAccount,_]=await User.validateAccount(transferTo)
   
    // console.log(recipientAccount)
    if(recipientAccount[0]['count(*)']===0) return res.status(401).json({error:"invalid reciever account number"})

    // case of invalid transaction
    if(senderAccount.balance-amount<0)
    return res.status(403).json({error:'you dont have sufficient balance in this account'})

    // get balance of recipient account
    const [balance,___]=await User.getAccountBalance(transferTo)

    // updating array so that it dont have old state of these two account numbers
    
    // console.log((balance[0].balance))
    await User.updateAccount(transferFrom,parseInt(senderAccount.balance)-parseInt(amount))
    await User.updateAccount(transferTo,parseInt(balance[0].balance)+parseInt(amount))

    //update user info 
    
    const [resp,__]=await User.getUserAccounts(user.username)
    const accountArr=[...resp]
    const user1={username:user.username,password:user.password,accountArr}
      
    // create curr time
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date+' '+time;
    //push to Transactions
    await User.generateTransaction(transferFrom,transferTo,amount,dateTime.toString())
    // console.log(response)
    res.json({success:'transmission successful',user1,token})
  })

  app.post('/transactionHistory',requireAuth,async(req,res)=>{
    const user=req.user
    console.log(user)
    const accountNumber=req.body.account
    if(user.accountArr.find(account=>account.accountNumber===accountNumber)===undefined)
    return res.status(403).json({error:"this account number don't belong to you"})
    const [history,trash]=await User.getTransactionHistory(accountNumber)
    // console.log(history)
    res.json(history)
  })


  app.listen(8000)