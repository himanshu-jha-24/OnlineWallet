import './App.css';
import React from 'react'
import {BrowserRouter as Router,Route,Routes} from 'react-router-dom'
import Register from './Register';
import LogIn from './LogIn'
import Home from './Home'
import Welcome from './Welcome'
function App() {
  
  return (
    <Router>
      <Routes>
        <Route path='/' Component={Home}/>
        <Route path='/login' Component={LogIn}/>
        <Route path='/register' Component={Register}/>
        <Route path='/welcome' Component={Welcome}/>
      </Routes>
     </Router> 
  )
}

export default App;
