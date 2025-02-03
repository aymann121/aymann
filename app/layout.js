import './globals.css'
// import { Inter } from 'next/font/google'
import Navbar from './layout/navbar'
import Footer from './layout/footer'
import {AuthContextProvider} from './context/AuthContext'
import Head from './head'
// 
// const inter = Inter({ subsets: ['latin'] })

// export const metadata = {
//   title: 'Create Next App',
//   description: 'Generated by create next app',
// }

export default function RootLayout({ children }) {
  return (
    <html lang="en" className = "h-full">
      <Head />
      <body className = "flex flex-col h-full">
        <AuthContextProvider>
          <Navbar />
          <main >{children}</main>
        </AuthContextProvider>
        <Footer />
      </body>
    </html>
  )
}