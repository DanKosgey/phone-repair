"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, ShoppingBag, Recycle, Smartphone, Tablet, Laptop, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useFeatureToggle } from "@/hooks/use-feature-toggle";

// Predefined positions to avoid hydration issues
const FLOATING_ELEMENTS = [
  { top: "15%", left: "10%", size: "20px" },
  { top: "70%", left: "85%", size: "25px" },
  { top: "40%", left: "75%", size: "15px" },
  { top: "80%", left: "20%", size: "30px" },
  { top: "25%", left: "30%", size: "18px" },
  { top: "60%", left: "65%", size: "22px" },
  { top: "35%", left: "15%", size: "28px" },
  { top: "75%", left: "80%", size: "16px" },
  { top: "20%", left: "70%", size: "24px" },
  { top: "55%", left: "25%", size: "19px" },
  { top: "45%", left: "60%", size: "26px" },
  { top: "65%", left: "40%", size: "21px" },
];

const ServicesSection = () => {
  const [mounted, setMounted] = useState(false);
  const { enableShop, enableSecondHandProducts, enableTracking, loading: featureLoading } = useFeatureToggle();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter services based on feature toggles
  const services = [
    enableShop && { 
      icon: ShoppingBag, 
      title: "Quality Products", 
      description: "Genuine parts and accessories for all major brands",
      devices: [Smartphone, Tablet, Laptop]
    },
    enableTracking && { 
      icon: Wrench, 
      title: "Repair Services", 
      description: "Expert repairs for phones, tablets, and laptops",
      devices: [Smartphone, Tablet, Laptop]
    },
    enableSecondHandProducts && { 
      icon: Recycle, 
      title: "Trade-In Program", 
      description: "Buy and sell second-hand devices in our marketplace",
      devices: [Smartphone, Tablet, Laptop]
    }
  ].filter(Boolean) as { icon: any; title: string; description: string; devices: any[] }[];

  // Don't render if still loading feature toggle or if no services are enabled
  if (featureLoading || !isClient || services.length === 0) {
    return (
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="h-16 mb-16"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(services.length || 3)].map((_, i) => (
              <div key={i} className="h-80"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!mounted) {
    return (
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="h-16 mb-16"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(services.length)].map((_, i) => (
              <div key={i} className="h-80"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-b from-background to-primary/5">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background to-primary/3" />
        
        {/* Floating elements */}
        {FLOATING_ELEMENTS.map((element, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary/15"
            style={{
              top: element.top,
              left: element.left,
              width: element.size,
              height: element.size,
            }}
            animate={{
              y: [0, i % 2 === 0 ? -20 : 20, 0],
              x: [0, i % 2 === 0 ? 20 : -20, 0],
              scale: [1, i % 3 === 0 ? 1.4 : 0.7, 1],
            }}
            transition={{
              duration: 15 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2 
            className="text-4xl md:text-5xl font-extrabold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Our <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Services</span>
          </motion.h2>
          <motion.p 
            className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Comprehensive solutions for all your device needs
          </motion.p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.6,
                delay: index * 0.2,
                ease: "easeOut"
              }}
              whileHover={{ 
                y: -15,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              className="h-full"
            >
              <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-background to-primary/5 backdrop-blur-sm border border-primary/15 rounded-2xl overflow-hidden">
                <CardHeader className="text-center pb-4">
                  <motion.div 
                    className="mx-auto mb-6"
                    whileHover={{ 
                      rotate: [0, 15],
                      scale: 1.15,
                    }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 300,
                      duration: 0.5
                    }}
                  >
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-primary/20 border-2 border-primary/25">
                      <service.icon className="h-12 w-12 text-primary" />
                    </div>
                  </motion.div>
                  <CardTitle className="text-2xl mb-3 font-bold">{service.title}</CardTitle>
                  <CardDescription className="text-base mt-2 font-medium">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center pt-4">
                  <div className="flex gap-4 mb-8">
                    {service.devices.map((DeviceIcon, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        transition={{ type: "spring", stiffness: 400 }}
                        className="p-3 rounded-xl bg-primary/15 border border-primary/20"
                      >
                        <DeviceIcon className="h-7 w-7 text-primary/90" />
                      </motion.div>
                    ))}
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full"
                  >
                    <Button variant="outline" className="w-full border-2 border-primary/40 text-primary hover:bg-primary/15 font-semibold py-6 group rounded-xl">
                      Learn More <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { ServicesSection };