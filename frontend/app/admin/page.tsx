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
      <main className="flex-1 container py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>

        <Tabs defaultValue="catalog" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6"> {/* Adjust grid-cols based on your tabs */}
            <TabsTrigger value="catalog">Catalog</TabsTrigger>
            <TabsTrigger value="materials">Materials & Colors</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            {/* Add more triggers as needed */}
          </TabsList>

          <TabsContent value="catalog">
            <AdminCatalogManager />
          </TabsContent>

          <TabsContent value="materials">
             {/* Combine Material and Color managers or keep separate */}
             <div className="space-y-6">
                <AdminMaterialManager />
                {/* <AdminColorManager /> */} {/* Uncomment if you have this component */}
             </div>
          </TabsContent>

          <TabsContent value="pricing">
            <AdminPricingManager />
          </TabsContent>
          {/* Add more TabsContent as needed */}

        </Tabs>
      </main>
      <SiteFooter />
    </div>
  );
}

