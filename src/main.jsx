import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import PDFMiniApp from './PDFMiniApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <App /> */}
    <PDFMiniApp />
  </StrictMode>,
)
