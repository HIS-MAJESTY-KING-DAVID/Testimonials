import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './pages/Home'
import Submit from './pages/Submit'
import './styles.css'

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/submit', element: <Submit /> },
])

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} future={{ v7_startTransition: true }} />
  </React.StrictMode>
)
