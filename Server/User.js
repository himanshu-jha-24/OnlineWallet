const db=require('./db')

class User{
    constructor(username,password,accountNumber,Balance){
        this.username=username
        this.password=password
        this.accountNumber=accountNumber
        this.Balance=Balance
    }

    async save(){
        let sql=`
        insert into Users(username,password,accountNumber,Balance)
        values('${this.username}','${this.password}','${this.accountNumber}','${this.Balance}')`
        const [newUser,_]= await db.execute(sql)
        return newUser
    }
    static findAll(){
        let sql='select * from Users'
        return  db.execute(sql)
    }
    static getUser(username,password){
        let sql=`select * from Users where username='${username}' and password='${password}'`
        return db.execute(sql)
    }
    static getUserCount(username,password){
        let sql=`select count(*) from Users where username='${username}' and password='${password}'`
        return db.execute(sql)
    }
    static getUserAccounts(username){
        let sql=`select accountNumber,balance from Users where username='${username}'`
        return db.execute(sql)
        
    }
    static getAllUsers(){
        let sql=`select username,password from Users`
        return db.execute(sql)
    }
    static generateAccount(username,password,accountNumber){
        let sql=`insert into Users values('${username}','${password}','${accountNumber}','0')`
        return db.execute(sql)
    }
    static validateAccount(accountNumber){
        let sql=`select count(*) from Users where accountNumber='${accountNumber}'`
        return db.execute(sql)
    }
    static getAccountBalance(accountNumber){
        let sql=`select balance from Users where accountNumber='${accountNumber}'`
        return db.execute(sql)
    }
    static updateAccount(accountNumber,balance){
        let sql=`update Users set balance='${balance}' where accountNumber='${accountNumber}'`
        return db.execute(sql)
    }
    static generateTransaction(transferFrom,transferTo,amount,time){
        let sql=`insert into Transactions values('${transferFrom}','${transferTo}','${amount}','${time}')`
        return db.execute(sql)
    }
    static getTransactionHistory(accountNumber){
        let sql=`select * from Transactions where transferFrom='${accountNumber}' or transferTo='${accountNumber}'`
        return db.execute(sql)
    }

}
module.exports=User