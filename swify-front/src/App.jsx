import React from 'react'
import { Route,Routes } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import KYCSubmit from './pages/KYCSubmit'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path ='/' element={<Home/>} />
        <Route path ='/login' element={<Login/>} />
        <Route path ='/register' element={<Register/>} />
        <Route path ='/kycsubmit' element={<KYCSubmit/>} />
      </Routes>
    </div>
  )
}

export default App