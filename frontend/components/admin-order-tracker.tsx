"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Eye, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { format } from "date-fns"

// Order status types and colors
const ORDER_STATUS = {
  PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" },
  PROCESSING: { label: "Processing", color: "bg-blue-100 text-blue-800 hover:bg-blue-200" },
  PRINTING: { label: "Printing", color: "bg-purple-100 text-purple-800 hover:bg-purple-200" },
  SHIPPED: { label: "Shipped", color: "bg-green-100 text-green-800 hover:bg-green-200" },
  DELIVERED: { label: "Delivered", color: "bg-green-100 text-green-800 hover:bg-green-200" },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-800 hover:bg-red-200" },
}

export function AdminOrderTracker() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false)

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders()
  }, [])

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`)
      if (!response.ok) throw new Error("Failed to fetch orders")

      const data = await response.json()
      setOrders(data)
    } catch (error) {
      setError("Failed to load orders. Please try again.")
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  // Update order status
  const updateOrderStatus = async (orderId, status) => {
    try {
      setStatusUpdateLoading(true)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) throw new Error("Failed to update order status")

      // Update local state
      setOrders(orders.map((order) => (order.id === orderId ? { ...order, status } : order)))

      // Update selected order if it's the one being viewed
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status })
      }
    } catch (error) {
      setError("Failed to update order status. Please try again.")
      console.error("Error updating order status:", error)
    } finally {
      setStatusUpdateLoading(false)
    }
  }

  // Format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a")
    } catch (error) {
      return "Invalid date"
    }
  }

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = ORDER_STATUS[status] || ORDER_STATUS.PENDING

    return <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Order Tracker</CardTitle>
          <CardDescription>Track and manage customer orders</CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={fetchOrders}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id.slice(0, 8)}</TableCell>
                      <TableCell>{order.customer.name}</TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>${order.total.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Order #{order.id.slice(0, 8)}</DialogTitle>
                              <DialogDescription>Placed on {formatDate(order.createdAt)}</DialogDescription>
                            </DialogHeader>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                              <div>
                                <h3 className="font-medium mb-2">Customer Information</h3>
                                <div className="space-y-1 text-sm">
                                  <p>
                                    <span className="font-medium">Name:</span> {order.customer.name}
                                  </p>
                                  <p>
                                    <span className="font-medium">Email:</span> {order.customer.email}
                                  </p>
                                  <p>
                                    <span className="font-medium">Phone:</span> {order.customer.phone || "N/A"}
                                  </p>
                                </div>

                                <h3 className="font-medium mt-4 mb-2">Shipping Address</h3>
                                <div className="space-y-1 text-sm">
                                  <p>{order.shippingAddress.street}</p>
                                  {order.shippingAddress.street2 && <p>{order.shippingAddress.street2}</p>}
                                  <p>
                                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                                    {order.shippingAddress.zip}
                                  </p>
                                  <p>{order.shippingAddress.country}</p>
                                </div>

                                <h3 className="font-medium mt-4 mb-2">Order Status</h3>
                                <div className="flex items-center space-x-2">
                                  <Select
                                    value={selectedOrder?.status}
                                    onValueChange={(value) => updateOrderStatus(order.id, value)}
                                    disabled={statusUpdateLoading}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Object.entries(ORDER_STATUS).map(([value, { label }]) => (
                                        <SelectItem key={value} value={value}>
                                          {label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div>
                                <h3 className="font-medium mb-2">Order Details</h3>
                                <div className="border rounded-md">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead className="text-right">Price</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {order.items.map((item, index) => (
                                        <TableRow key={index}>
                                          <TableCell>
                                            <div>
                                              <p className="font-medium">{item.name}</p>
                                              <p className="text-sm text-muted-foreground">{item.details}</p>
                                            </div>
                                          </TableCell>
                                          <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                                        </TableRow>
                                      ))}
                                      <TableRow>
                                        <TableCell className="font-medium">Subtotal</TableCell>
                                        <TableCell className="text-right">${order.subtotal.toFixed(2)}</TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell className="font-medium">Shipping</TableCell>
                                        <TableCell className="text-right">${order.shipping.toFixed(2)}</TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell className="font-medium">Tax</TableCell>
                                        <TableCell className="text-right">${order.tax.toFixed(2)}</TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell className="font-medium">Total</TableCell>
                                        <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-end space-x-2">
                              <DialogTrigger asChild>
                                <Button variant="outline">Close</Button>
                              </DialogTrigger>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
