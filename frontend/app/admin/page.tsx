"use client"; // This page needs client-side state and effects

import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AdminLogin } from "@/components/admin-login";
import { AdminCatalogManager } from "@/components/admin-catalog-manager";
import { AdminMaterialManager } from "@/components/admin-material-manager";
import { AdminPricingManager } from "@/components/admin-pricing-manager";
import { AdminColorManager } from "@/components/admin-color-manager"; // Assuming this exists
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Check auth state on load

  // Check authentication status on component mount
  useEffect(() => {
    const authString = sessionStorage.getItem("adminAuth");
    if (authString) {
      // Basic check: Does the string exist?
      // A more robust check would involve making an authenticated API call
      // to verify the stored credentials are still valid.
      setIsAuthenticated(true);
    }
    setIsLoading(false); // Finished checking
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth"); // Clear credentials
    setIsAuthenticated(false);
    console.log("Admin logged out, credentials cleared.");
  };

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
    );
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
    );
  }

  // If authenticated, show the admin dashboard
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <div className="container py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <Button variant="outline" onClick={() => setIsAuthenticated(false)}>
              Logout
            </Button>
          </div>

          <Tabs defaultValue="colors">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="materials">Materials</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="catalog">Catalog</TabsTrigger>
            </TabsList>

            <TabsContent value="colors">
              <Card>
                <CardHeader>
                  <CardTitle>Color Management</CardTitle>
                  <CardDescription>Add, edit, or remove colors available for 3D printing</CardDescription>
                </CardHeader>
                <CardContent>
                  <AdminColorManager />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="materials">
              <Card>
                <CardHeader>
                  <CardTitle>Material Management</CardTitle>
                  <CardDescription>Manage available materials and their compatible colors</CardDescription>
                </CardHeader>
                <CardContent>
                  <AdminMaterialManager />
                </CardContent>
              </Card>
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

