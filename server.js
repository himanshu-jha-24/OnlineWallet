const express=require('express')
const app=express()
const crypto=require('crypto')
require('dotenv').config()
const jwt=require('jsonwebtoken')
// const data=require('./data.js')
const bcrypt =require('bcrypt')

app.use(express.json())

const account=[]
const transactions=[]
const secret_key=process.env.SECRET_KEY

function generateAccountNumber() {
  let accountNumber = '';
  for (let i = 0; i < 10; i++) {
    accountNumber += Math.floor(Math.random() * 10)
  }
  return accountNumber;
}
  // Helper function to generate a token for authentication
function generateToken(username, password) {
  const token = crypto.createHash('sha256').update(username + password).digest('hex')
  return token
}
//increment money for a user
function addMoney(user){
  user.accountArr[0].balance = user.accountArr[0].balance+1000000
}
  
//create user
app.post('/signup',(req,res)=>{
  const username = req.body.username
  const password = req.body.password
  // Check if the user already exists
  const existingUser = account.find((user) => user.username === username)
  if (existingUser) {
    return res.status(409).json({ error: 'User already exists' })
  }
  // Encrypt the password (example using simple hash)
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex')
  // Generate a unique account number
  const accountNumber = generateAccountNumber()
  // Create the new user
  const accountArr=[{
    accountNumber,
    balance:0
  }]
  const newUser = {
    username,
    password: hashedPassword,
    accountArr
  }
  account.push(newUser)
  if(account.length===1)
  addMoney(newUser)
  // Send the response
  res.json({newUser})
})


//login
app.post('/login', (req, res) => {
  const username = req.body.username
  const password = req.body.password
  // Find the user by username
  const user = account.find((user) => user.username === username)
  if (!user) {
    return res.status(404).json({ error: 'User not found' })//unique username has to be there
  }
  // Verify the password (example using simple hash)
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex')
  if (user.password !== hashedPassword) {
    return res.status(401).json({ error: 'Invalid password' })
  }
  // Generate a token for authentication
  const token = generateToken(username, hashedPassword)
  // Send the response
  res.json({ username, message: 'Logged in', token })
})

// Middleware to check if a user is logged in
function requireAuth(req, res, next) {
  const token = req.body.token
  // Check if the token is provided
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' })
  }
  // Find the user by the token
  const user = account.find((user) => generateToken(user.username, user.password) === token)
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' })
  }
  // Add the user object to the request for further processing
  req.user = user
  // console.log(user)
  next()
}


// POST request handler for a logged-in user to generate a new account
app.post('/accounts', requireAuth, (req, res) => {
    const user = req.user
    // Generate a unique account number
    const accountNumber = generateAccountNumber()
    // Create the new account
    const newAccount = {
      accountNumber,
      balance: 0
    }
    user.accountArr.push(newAccount)
    // Send the response
    res.json(user)
  })

  //POST request to transfer money from one account to other
app.post('/transfer',requireAuth,(req,res)=>{
  const user=req.user
  const transferTo=req.body.transferTo
  const transferFrom=req.body.transferFrom
  const amount=req.body.amount
  // validate sender's account number
  const senderAccount=user.accountArr.find(account=>account.accountNumber===transferFrom) 
  if(!senderAccount)return res.status(401).json({error:"invalid sender account number"})
  // validate reciever's account number
  const recipient=account.find(user=>user.accountArr.find(account=>account.accountNumber===transferTo)!==undefined)
  // console.log(recipient)
  const recipientAccount=recipient.accountArr.find(account=>account.accountNumber===transferTo)
  if(!recipientAccount) return res.status(401).json({error:"invalid reciever account number"})
  // case of invalid transaction
  if(senderAccount.balance<amount)
  return res.status(403).json({error:'you dont have sufficient balance in this account'})
  // updating array so that it dont have old state of these two account numbers
  user.accountArr=user.accountArr.filter(account=>
    account.accountNumber!==transferFrom | account.accountNumber!==transferTo)
    // new state of sender account
  user.accountArr.push(
    {
      accountNumber:transferFrom,
      balance:senderAccount.balance-amount
    }
  )
  // new state of reciever's account
  user.accountArr.push(
    {
      accountNumber:transferTo,
      balance:recipientAccount.balance+amount
    }
  )
  //create curr time
  var today = new Date();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var dateTime = date+' '+time;
  transactions.push(
    {
      transferFrom,
      transferTo,
      amount,
      timeOfTransaction:dateTime.toString()
    }
  )
  res.json({success:'transmission successful'})

})

app.post('/transactionHistory',requireAuth,(req,res)=>{
  const user=req.user
  const accountNumber=req.body.account
  if(user.accountArr.find(account=>account.accountNumber===accountNumber)===undefined)
  return res.status(403).json({error:"this account number don't belong to you"})
  const history=transactions.filter(transaction=>
    transaction.transferFrom===accountNumber | transaction.transferTo===accountNumber)
  res.json(history)
})



app.listen(8000)

