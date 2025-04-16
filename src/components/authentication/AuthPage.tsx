import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Login from "./Login"
import Register from "./Register"
import { AuthPageProps } from "../../types"

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [currentPage, setCurrentPage] = useState<"login" | "register">("login")

  const switchToLogin = (): void => setCurrentPage("login")
  const switchToRegister = (): void => setCurrentPage("register")

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 rounded-3xl shadow-xl border border-gray-100 p-4">
      <div className="flex justify-center mb-6">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-md bg-gradient-to-r from-purple-600 to-purple-800 flex items-center justify-center text-white mr-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <span className="text-2xl font-bold text-gray-900">WordFreq</span>
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        {currentPage === "login" ? (
          <motion.div
            key="login"
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <Login onLogin={onLogin} onSwitchToRegister={switchToRegister} />
          </motion.div>
        ) : (
          <motion.div
            key="register"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <Register onSwitchToLogin={switchToLogin} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
