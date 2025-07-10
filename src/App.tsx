import './App.css'
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import About from '../public/About'
import Landing from './landing'
import Projects from './pages/Projects';
import './index.css'

{/* Remove-Item -Recurse -Force node_modules
      Remove-Item -Force package-lock.json 
      this will remove all node_modules and package-lock.json*/}

{/*
 installed postcss language support
 ESlint
 file assoc added .css to support tailwind css

 You're using Tailwind CSS v4.1.10, which is a canary or experimental 
 release that doesn’t include the CLI binary anymore by default.
 
 IMPORTANT!!!: use tailwind 3.4.1 most stable version June 2025
 bash:npm install -D tailwindcss@3.4.1 
 */}

const App: React.FC = () => {
  return (
    <Router>
      <div>
        <div
          className="absolute inset-0 bg-cover bg-no-repeat bg-center blur-sm"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("/src/assets/imgg.jpg")',
            zIndex: -1,
          }}>
        </div>

        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
        </Routes>

      </div >
    </Router>
  )
}

export default App
