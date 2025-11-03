import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { productsDbServer } from "@/lib/db/products-server"
import { Database } from "../../types/database.types"
import { HomePageSidebar } from "@/components/homepage/HomePageSidebar"
import { MobileBottomNav } from "@/components/layout/MobileBottomNav"
import { HeroSection } from "@/components/homepage/HeroSection"
import { ServicesSection } from "@/components/homepage/ServicesSection"
import { WhyChooseUsSection } from "@/components/homepage/WhyChooseUsSection"
import { FeaturedProductsSection } from "@/components/homepage/FeaturedProductsSection"
import { TrackTicketCTA } from "@/components/homepage/TrackTicketCTA"

type Product = Database['public']['Tables']['products']['Row']

async function getFeaturedProducts() {
  try {
    const data = await productsDbServer.getFeatured()
    return data || []
  } catch (err) {
    // Only show detailed errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching featured products:", err.message || err)
    } else {
      console.error("Error fetching featured products")
    }
    return []
  }
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <HomePageSidebar />
        <main className="flex-1">
          <div className="min-h-screen">
            <HeroSection />
            <ServicesSection />
            <WhyChooseUsSection />
            <FeaturedProductsSection featuredProducts={featuredProducts} />
            <TrackTicketCTA />
          </div>
        </main>
      </div>
      <Footer />
      <MobileBottomNav />
    </div>
  )
}