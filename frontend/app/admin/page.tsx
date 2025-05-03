"use client" // This page needs client-side state and effects

import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { AdminLogin } from "@/components/admin-login"
import { AdminCatalogManager } from "@/components/admin-catalog-manager"
import { AdminPricingManager } from "@/components/admin-pricing-manager"
import { AdminOrderTracker } from "@/components/admin-order-tracker" // Import the new component
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { LogOut, Palette, DollarSign, ShoppingBag, ClipboardList } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminFilamentsManager } from "@/components/admin-filaments-manager"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true) // Check auth state on load

  // Check authentication status on component mount
  useEffect(() => {
    const authString = sessionStorage.getItem("adminAuth")
    if (authString) {
      // Basic check: Does the string exist?
      // A more robust check would involve making an authenticated API call
      // to verify the stored credentials are still valid.
      setIsAuthenticated(true)
    }
    setIsLoading(false) // Finished checking
  }, [])

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth") // Clear credentials
    setIsAuthenticated(false)
    console.log("Admin logged out, credentials cleared.")
  }

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1 container py-12 text-center">
          <p>Checking authentication...</p>
        </main>
        <SiteFooter />
      </div>
    )
  }

  // If not authenticated, show the login component
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1 container py-12">
          <AdminLogin onLoginSuccess={handleLoginSuccess} />
        </main>
        <SiteFooter />
      </div>
    )
  }

  // If authenticated, show the admin dashboard
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          <Tabs defaultValue="orders">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                <span>Orders</span>
              </TabsTrigger>
              <TabsTrigger value="filaments" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <span>Filaments</span>
              </TabsTrigger>
              <TabsTrigger value="pricing" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span>Pricing</span>
              </TabsTrigger>
              <TabsTrigger value="catalog" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                <span>Catalog</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Order Management</CardTitle>
                  <CardDescription>Track and manage customer orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <AdminOrderTracker />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="filaments">
              <AdminFilamentsManager />
            </TabsContent>

            <TabsContent value="pricing">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing Management</CardTitle>
                  <CardDescription>Configure base pricing and modifiers for materials and colors</CardDescription>
                </CardHeader>
                <CardContent>
                  <AdminPricingManager />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="catalog">
              <AdminCatalogManager />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
