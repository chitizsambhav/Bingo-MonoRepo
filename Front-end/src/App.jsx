import React, { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { getData } from './services/api'
import Layout from './component/layout/Layout'
import {createBrowserRouter, createRoutesFromElements, RouterProvider, Route} from 'react-router-dom'
import Join from './pages/join/Join'
import Game from './pages/game/Game'
import { loginAction } from './pages/join/Join'
import { gameLoader } from './pages/game/Game'


const routes = createBrowserRouter(createRoutesFromElements(
  <Route path='/' element={<Layout />} >
    <Route index element={<Join />} action={loginAction}/>
    <Route path='/games' element={<Game />} loader={gameLoader}/>
  </Route>
))

 function App() {

  return (
    <>
      <RouterProvider router={routes} />
    </>
  )
}

export default App
