"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Switch 
} from "@/components/ui/switch"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { 
  Save, 
  Building, 
  Bell, 
  Shield, 
  Palette, 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  CreditCard,
  Globe,
  Clock,
  Upload,
  Database,
  Image
} from "lucide-react"
import { useAuth } from '@/contexts/auth-context'
import { redirect } from 'next/navigation'
import { getBusinessConfig, saveBusinessConfig, type BusinessConfig } from '@/lib/config-service'
import { getFeatureSettings, saveFeatureSettings } from '@/lib/feature-toggle'
import { Wrench, Package, Recycle } from "lucide-react"

// Define types for our settings
interface FeatureSettings {
  enableSecondHandProducts: boolean
  enableTracking: boolean
  enableShop: boolean
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system'
  primaryColor: string
  secondaryColor: string
}

export default function Settings() {
  const { user, role, isLoading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("contact")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Business Information
  const [businessSettings, setBusinessSettings] = useState<BusinessConfig>({
    businessName: "Jay's Shop",
    businessEmail: "info@devicecaretaker.com",
    businessPhone: "+254700123456",
    businessAddress: "123 Tech Street, Nairobi, Kenya",
    businessWebsite: "https://devicecaretaker.com",
    businessDescription: "Professional phone repair services and quality products.",
    copyrightText: "2024 Jay's Shop. All rights reserved.",
    primaryColor: "#3b82f6",
    secondaryColor: "#8b5cf6"
  })

  // Feature Toggles
  const [featureSettings, setFeatureSettings] = useState<FeatureSettings>({
    enableSecondHandProducts: true,
    enableTracking: true,
    enableShop: true
  })

  // Appearance Settings
  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>({
    theme: "light",
    primaryColor: "#3b82f6",
    secondaryColor: "#8b5cf6"
  })

  // Contact Information for Homepage
  const [contactInfo, setContactInfo] = useState({
    phone: "(555) 123-4567",
    email: "support@repairhub.com",
    hours: "Mon-Sat 9AM-6PM"
  })

  // Load existing settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const config = await getBusinessConfig()
        setBusinessSettings(config)
        setAppearanceSettings({
          theme: "light",
          primaryColor: config.primaryColor,
          secondaryColor: config.secondaryColor
        })
        
        // Load feature settings
        const featureConfig = await getFeatureSettings()
        setFeatureSettings(featureConfig)
        
        // Load contact info from localStorage or use defaults
        if (typeof window !== 'undefined') {
          const storedContactInfo = localStorage.getItem('homepageContactInfo')
          if (storedContactInfo) {
            setContactInfo(JSON.parse(storedContactInfo))
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error)
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive",
        })
      }
    }
    
    loadSettings()
  }, [])

  // Redirect to login if not authenticated or not admin
  useEffect(() => {
    if (!authLoading) {
      if (!user || role !== 'admin') {
        redirect('/login')
      }
    }
  }, [user, role, authLoading])

  // Handle business settings changes
  const handleBusinessSettingsChange = (field: keyof BusinessConfig, value: string) => {
    setBusinessSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle feature settings changes
  const handleFeatureSettingsChange = (field: keyof FeatureSettings, value: boolean) => {
    setFeatureSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle appearance settings changes
  const handleAppearanceSettingsChange = (field: keyof AppearanceSettings, value: string | 'light' | 'dark' | 'system') => {
    setAppearanceSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle contact info changes
  const handleContactInfoChange = (field: keyof typeof contactInfo, value: string) => {
    setContactInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Save business settings
      await saveBusinessConfig(businessSettings)
      
      // Save feature settings
      await saveFeatureSettings(featureSettings)
      
      // Save contact info to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('homepageContactInfo', JSON.stringify(contactInfo))
      }
      
      toast({
        title: "Success",
        description: "Settings updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your business settings and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Contact Info
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        {/* Contact Information Tab */}
        <TabsContent value="contact">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Homepage Contact Information
                </CardTitle>
                <CardDescription>
                  Update the contact information displayed on the homepage and footer
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Preview</h3>
                  <div className="bg-background p-4 rounded border">
                    <h4 className="font-semibold mb-3">Contact</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>Phone: {contactInfo.phone}</li>
                      <li>Email: {contactInfo.email}</li>
                      <li>Hours: {contactInfo.hours}</li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="contactPhone"
                      value={contactInfo.phone}
                      onChange={(e) => handleContactInfoChange('phone', e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={contactInfo.email}
                      onChange={(e) => handleContactInfoChange('email', e.target.value)}
                      placeholder="support@repairhub.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contactHours" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Business Hours
                    </Label>
                    <Input
                      id="contactHours"
                      value={contactInfo.hours}
                      onChange={(e) => handleContactInfoChange('hours', e.target.value)}
                      placeholder="Mon-Sat 9AM-6PM"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        {/* Features Settings Tab */}
        <TabsContent value="features">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Feature Management
                </CardTitle>
                <CardDescription>
                  Enable or disable features in your application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Core Features</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Product Shop</p>
                          <p className="text-sm text-muted-foreground">Enable the product shopping section</p>
                        </div>
                      </div>
                      <Switch
                        checked={featureSettings.enableShop}
                        onCheckedChange={(checked) => handleFeatureSettingsChange('enableShop', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Wrench className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Repair Tracking</p>
                          <p className="text-sm text-muted-foreground">Enable the ticket tracking system</p>
                        </div>
                      </div>
                      <Switch
                        checked={featureSettings.enableTracking}
                        onCheckedChange={(checked) => handleFeatureSettingsChange('enableTracking', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Recycle className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Second-Hand Products</p>
                          <p className="text-sm text-muted-foreground">Enable the second-hand product marketplace</p>
                        </div>
                      </div>
                      <Switch
                        checked={featureSettings.enableSecondHandProducts}
                        onCheckedChange={(checked) => handleFeatureSettingsChange('enableSecondHandProducts', checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        {/* Appearance Settings Tab */}
        <TabsContent value="appearance">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Appearance Settings
                </CardTitle>
                <CardDescription>
                  Customize the look and feel of your application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Theme</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="theme" className="flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Color Theme
                      </Label>
                      <Select 
                        value={appearanceSettings.theme} 
                        onValueChange={(value: 'light' | 'dark' | 'system') => 
                          handleAppearanceSettingsChange('theme', value)
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Colors</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor" className="flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Primary Color
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="primaryColor"
                          type="color"
                          value={appearanceSettings.primaryColor}
                          onChange={(e) => handleAppearanceSettingsChange('primaryColor', e.target.value)}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={appearanceSettings.primaryColor}
                          onChange={(e) => handleAppearanceSettingsChange('primaryColor', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="secondaryColor" className="flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Secondary Color
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="secondaryColor"
                          type="color"
                          value={appearanceSettings.secondaryColor}
                          onChange={(e) => handleAppearanceSettingsChange('secondaryColor', e.target.value)}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={appearanceSettings.secondaryColor}
                          onChange={(e) => handleAppearanceSettingsChange('secondaryColor', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Layout Options</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Building className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Compact Layout</p>
                          <p className="text-sm text-muted-foreground">Use a more compact layout for admin panels</p>
                        </div>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}