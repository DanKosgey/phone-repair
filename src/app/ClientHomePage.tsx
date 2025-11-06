"use client";

import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { HomePageSidebar } from "@/components/homepage/HomePageSidebar"
import { MobileBottomNav } from "@/components/layout/MobileBottomNav"
import { ServicesSection } from "@/components/homepage/ServicesSection"
import { WhyChooseUsSection } from "@/components/homepage/WhyChooseUsSection"
import { TrackTicketCTA } from "@/components/homepage/TrackTicketCTA"
import { Suspense } from "react"

// Dynamically import heavy components with lazy loading
import dynamic from 'next/dynamic'

const EnhancedBackground = dynamic(() => import('@/components/homepage/EnhancedBackground').then(mod => mod.EnhancedBackground), {
  loading: () => <div className="fixed inset-0 overflow-hidden -z-10 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
})

const HeroSection = dynamic(() => import('@/components/homepage/HeroSection').then(mod => mod.HeroSection), {
  loading: () => (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="h-10 w-64 mx-auto bg-primary/10 rounded-full animate-pulse" />
          <div className="h-20 bg-primary/10 rounded-lg animate-pulse" />
          <div className="h-6 bg-primary/10 rounded animate-pulse" />
          <div className="flex gap-4 justify-center">
            <div className="h-14 w-48 bg-primary/10 rounded-lg animate-pulse" />
            <div className="h-14 w-48 bg-primary/10 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  )
})

const FeaturedProductsSection = dynamic(() => import('@/components/homepage/FeaturedProductsSection').then(mod => mod.FeaturedProductsSection), {
  loading: () => (
    <section className="py-16 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-primary/20 rounded-full animate-pulse" />
            <div>
              <div className="h-8 w-48 bg-primary/20 rounded animate-pulse" />
              <div className="h-4 w-64 bg-primary/10 rounded mt-2 animate-pulse" />
            </div>
          </div>
          <div className="h-10 w-48 bg-primary/20 rounded animate-pulse" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-80 bg-primary/10 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </section>
  )
})

export default function ClientHomePage() {
  return (
    <>
      <Suspense fallback={<div className="fixed inset-0 overflow-hidden -z-10 bg-gradient-to-br from-primary/5 via-background to-primary/10" />}>
        <EnhancedBackground />
      </Suspense>
      <Navbar />
      <div className="flex flex-1">
        <HomePageSidebar />
        <main className="flex-1">
          <div className="min-h-screen">
            <Suspense fallback={
              <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background py-20 lg:py-32">
                <div className="container mx-auto px-4">
                  <div className="max-w-4xl mx-auto text-center space-y-6">
                    <div className="h-10 w-64 mx-auto bg-primary/10 rounded-full animate-pulse" />
                    <div className="h-20 bg-primary/10 rounded-lg animate-pulse" />
                    <div className="h-6 bg-primary/10 rounded animate-pulse" />
                    <div className="flex gap-4 justify-center">
                      <div className="h-14 w-48 bg-primary/10 rounded-lg animate-pulse" />
                      <div className="h-14 w-48 bg-primary/10 rounded-lg animate-pulse" />
                    </div>
                  </div>
                </div>
              </section>
            }>
              <HeroSection />
            </Suspense>
            <ServicesSection />
            <WhyChooseUsSection />
            <Suspense fallback={
              <section className="py-16 relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-primary/20 rounded-full animate-pulse" />
                      <div>
                        <div className="h-8 w-48 bg-primary/20 rounded animate-pulse" />
                        <div className="h-4 w-64 bg-primary/10 rounded mt-2 animate-pulse" />
                      </div>
                    </div>
                    <div className="h-10 w-48 bg-primary/20 rounded animate-pulse" />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, index) => (
                      <div key={index} className="h-80 bg-primary/10 rounded-lg animate-pulse" />
                    ))}
                  </div>
                </div>
              </section>
            }>
              <FeaturedProductsSection />
            </Suspense>
            <TrackTicketCTA />
          </div>
        </main>
      </div>
      <Footer />
      <MobileBottomNav />
    </>
  )
}