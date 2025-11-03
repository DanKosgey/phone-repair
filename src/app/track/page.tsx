'use client'

import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import EnhancedTrackTicket from "@/components/track/EnhancedTrackTicket"
import '@/components/track/track-animations.css'

export default function TrackTicketPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <EnhancedTrackTicket />
      </main>
      <Footer />
    </div>
  )
}