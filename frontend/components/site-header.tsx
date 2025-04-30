"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Menu, X, ChevronDown, PrinterIcon as Printer3d } from "lucide-react"
import { CartIcon } from "@/components/cart-icon"
import { ThemeToggle } from "@/components/theme-toggle"
import { motion } from "framer-motion"

export function SiteHeader() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const routes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
    },
    {
      href: "#",
      label: "Services",
      active: pathname === "/services" || pathname.startsWith("/services/"),
      dropdown: true,
      items: [
        {
          href: "/services/3d-printing",
          label: "3D Printing",
        },
        {
          href: "/services/print-on-demand",
          label: "Print on Demand",
        },
        {
          href: "/services/3d-modeling",
          label: "3D Modeling & Design",
        },
      ],
    },
    {
      href: "/catalog",
      label: "Catalog",
      active: pathname === "/catalog" || pathname.startsWith("/catalog/"),
    },
    {
      href: "/about",
      label: "About",
      active: pathname === "/about",
    },
    {
      href: "/contact",
      label: "Contact",
      active: pathname === "/contact",
    },
  ]

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-200",
        scrolled ? "bg-background/80 backdrop-blur-md border-b shadow-sm" : "bg-background border-b",
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl group">
          <span className="bg-primary text-primary-foreground p-1 rounded flex items-center justify-center group-hover:scale-110 transition-transform">
            <Printer3d className="h-5 w-5" />
          </span>
          <span className="text-primary group-hover:text-primary/80 transition-colors">Print3D</span>
          <span className="group-hover:text-primary transition-colors">Ottawa</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <nav className="flex gap-6 mr-4">
            {routes.map((route) => {
              if (route.dropdown) {
                return (
                  <DropdownMenu key={route.label}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="link"
                        className={cn(
                          "text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 p-0 h-auto",
                          route.active ? "text-primary" : "text-foreground",
                        )}
                      >
                        {route.label}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {route.items?.map((item) => (
                        <DropdownMenuItem key={item.href} asChild>
                          <Link href={item.href}>{item.label}</Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )
              }

              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary relative group",
                    route.active ? "text-primary" : "text-foreground",
                  )}
                >
                  {route.label}
                  <span
                    className={cn(
                      "absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full",
                      route.active ? "w-full" : "w-0",
                    )}
                  ></span>
                </Link>
              )
            })}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <CartIcon />
          </div>
        </div>

        {/* Mobile Menu Button and Cart Icon */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <CartIcon />
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <motion.div
          className="md:hidden border-t"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="container py-4 space-y-4">
            {routes.map((route) => {
              if (route.dropdown) {
                return (
                  <div key={route.label} className="space-y-2">
                    <div className="font-medium">{route.label}</div>
                    <div className="pl-4 space-y-2 border-l-2 border-primary/20">
                      {route.items?.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="block text-sm text-muted-foreground hover:text-primary"
                          onClick={toggleMobileMenu}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              }

              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "block text-sm font-medium transition-colors hover:text-primary",
                    route.active ? "text-primary" : "text-foreground",
                  )}
                  onClick={toggleMobileMenu}
                >
                  {route.label}
                </Link>
              )
            })}
          </div>
        </motion.div>
      )}
    </header>
  )
}

