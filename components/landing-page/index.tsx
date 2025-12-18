"use client"

import { useState } from "react"
import Header from "./header"
import Hero from "./hero"
import Services from "./services"
import Faq from "./faq"
import CallToAction from "./call-to-action"
import Footer from "./footer"
import { AuthModal } from "@/components/AuthModal"

interface LandingPageProps {
  showHeader?: boolean
  showFooter?: boolean
}
export { Header, Hero, Services, Faq, CallToAction, Footer }

export default function LandingPage({ showHeader = true, showFooter = true }: LandingPageProps) {
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)

  return (
    <main className="min-h-screen bg-white dark:bg-[#111111]">
      {showHeader && (
        <Header
          onLoginClick={() => setShowLogin(true)}
          onRegisterClick={() => setShowRegister(true)}
        />
      )}
      <div className="container pt-4">
        <Hero />
        <Services />
        <Faq />
        <CallToAction />
      </div>
      {showFooter && <Footer />}

      <AuthModal open={showLogin} mode="signin" onClose={() => setShowLogin(false)} />
      <AuthModal open={showRegister} mode="signup" onClose={() => setShowRegister(false)} />
    </main>
  )
}
