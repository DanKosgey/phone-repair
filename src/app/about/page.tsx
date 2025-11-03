import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Clock, Heart, ShieldCheck, Wrench } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="bg-primary text-primary-foreground py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold">About Jay's Shop</h1>
              <p className="text-xl text-muted-foreground">
                Your trusted partner for phone repair services and quality products.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <p className="text-lg mb-4">
              Jay's Shop is a leading provider of phone repair services and quality products. 
              Founded with a passion for technology and customer satisfaction, we've been serving 
              our community for years with exceptional service.
            </p>
            <p className="text-lg mb-4">
              Our mission is to provide fast, reliable, and affordable phone repair services 
              while offering quality products that enhance your mobile experience. We believe 
              in building lasting relationships with our customers through transparency, 
              expertise, and genuine care.
            </p>
            <ul className="space-y-2 mt-6">
              <li className="flex items-center">
                <Wrench className="h-5 w-5 text-primary mr-2" />
                <span>Certified technicians with years of experience</span>
              </li>
              <li className="flex items-center">
                <ShieldCheck className="h-5 w-5 text-primary mr-2" />
                <span>90-day warranty on all repairs</span>
              </li>
              <li className="flex items-center">
                <Clock className="h-5 w-5 text-primary mr-2" />
                <span>Same-day service for most repairs</span>
              </li>
              <li className="flex items-center">
                <Heart className="h-5 w-5 text-primary mr-2" />
                <span>Customer satisfaction guarantee</span>
              </li>
            </ul>
          </div>
          <div className="hidden lg:block">
            <img src="/about.jpg" alt="About Us" className="rounded-lg shadow-lg" />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}