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
import { getAllOrders, updateOrderStatus as apiUpdateOrderStatus, Order } from "@/services/api" // Import API functions and Order type
import { useToast } from "@/hooks/use-toast" // Import useToast
import { useRouter } from 'next/navigation';

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
  const router = useRouter(); // Add router
  const [orders, setOrders] = useState<Order[]>([]) // Use Order type
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null) // Allow null for no error
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null) // Use Order type
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false)
  const { toast } = useToast() // Initialize toast

  // Fetch orders on component mount
  useEffect(() => {
    const authToken = sessionStorage.getItem('adminAuth');
    if (!authToken) {
      // Redirect to admin login if not authenticated
      router.push('/admin/login');
      return;
    }
    fetchOrders();
  }, [router]);

  // Fetch orders from API using api.ts
  const fetchOrders = async () => {
    setLoading(true)
    setError(null)
    const authToken = sessionStorage.getItem('adminAuth'); // Get auth token

    if (!authToken) {
      setError("Authentication required. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const data = await getAllOrders(authToken); // Use imported function
      setOrders(data);
    } catch (err: any) {
      setError(err.message || "Failed to load orders. Please try again.")
      console.error("Error fetching orders:", err)
      toast({ title: "Error Fetching Orders", description: err.message || "Could not load orders.", variant: "destructive" });
    } finally {
      setLoading(false)
    }
  }

  // Update order status using api.ts
  const updateOrderStatus = async (orderId: string, status: string) => {
    setStatusUpdateLoading(true)
    setError(null)
    const authToken = sessionStorage.getItem('adminAuth'); // Get auth token

    if (!authToken) {
      setError("Authentication required. Please log in.");
      setStatusUpdateLoading(false);
      toast({ title: "Authentication Error", description: "Please log in again to update orders.", variant: "destructive" });
      return;
    }

    try {
      const result = await apiUpdateOrderStatus(orderId, status, authToken); // Use imported function

      if (result.success) {
        // Update local state
        setOrders(orders.map((order) => (order.id === orderId ? { ...order, status, updatedAt: result.order.updatedAt } : order)))

        // Update selected order if it's the one being viewed
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status, updatedAt: result.order.updatedAt })
        }
        toast({ title: "Status Updated", description: `Order ${orderId.slice(0, 8)} status set to ${status}.` });
      } else {
        throw new Error(result.message || "Failed to update status from API");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update order status. Please try again.")
      console.error("Error updating order status:", err)
      toast({ title: "Error Updating Status", description: err.message || "Could not update order status.", variant: "destructive" });
    } finally {
      setStatusUpdateLoading(false)
    }
  }

  // Format date
  const formatDate = (dateString: string | undefined) => { // Add type for dateString
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a")
    } catch (error) {
      return "Invalid date"
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => { // Add type for status
    const statusKey = status.toUpperCase() as keyof typeof ORDER_STATUS;
    const statusConfig = ORDER_STATUS[statusKey] || ORDER_STATUS.PENDING

    return <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
  }

  // Helper to safely access nested properties
  const getSafe = (obj: any, path: string, defaultValue: any = "N/A") => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj) ?? defaultValue;
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
                      <TableCell>{getSafe(order, 'customer.name')}</TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>${order.total?.toFixed(2) ?? '0.00'}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right">
                        <Dialog onOpenChange={(open) => !open && setSelectedOrder(null)}> {/* Reset selectedOrder on close */}
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          {selectedOrder && selectedOrder.id === order.id && ( // Render content only if this order is selected
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>Order #{selectedOrder.id.slice(0, 8)}</DialogTitle>
                                <DialogDescription>
                                  Placed on {formatDate(selectedOrder.createdAt)} | Last Updated: {formatDate(selectedOrder.updatedAt)}
                                </DialogDescription>
                              </DialogHeader>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 max-h-[70vh] overflow-y-auto pr-2">
                                <div>
                                  <h3 className="font-medium mb-2">Customer Information</h3>
                                  <div className="space-y-1 text-sm">
                                    <p><span className="font-medium">Name:</span> {getSafe(selectedOrder, 'customer.name')}</p>
                                    <p><span className="font-medium">Email:</span> {getSafe(selectedOrder, 'customer.email')}</p>
                                    <p><span className="font-medium">Phone:</span> {getSafe(selectedOrder, 'customer.phone')}</p>
                                  </div>

                                  <h3 className="font-medium mt-4 mb-2">Delivery Method</h3>
                                  <p className="text-sm capitalize">{selectedOrder.delivery_method}</p>

                                  {selectedOrder.delivery_method === 'shipping' && selectedOrder.shippingAddress && (
                                    <>
                                      <h3 className="font-medium mt-4 mb-2">Shipping Address</h3>
                                      <div className="space-y-1 text-sm">
                                        <p>{getSafe(selectedOrder, 'shippingAddress.street')}</p>
                                        {selectedOrder.shippingAddress.street2 && <p>{selectedOrder.shippingAddress.street2}</p>}
                                        <p>
                                          {getSafe(selectedOrder, 'shippingAddress.city')}, {getSafe(selectedOrder, 'shippingAddress.province')}{" "}
                                          {getSafe(selectedOrder, 'shippingAddress.postal_code')}
                                        </p>
                                        <p>{getSafe(selectedOrder, 'shippingAddress.country')}</p>
                                      </div>
                                    </>
                                  )}

                                  <h3 className="font-medium mt-4 mb-2">Order Status</h3>
                                  <div className="flex items-center space-x-2">
                                    <Select
                                      value={selectedOrder.status} // Use selectedOrder directly
                                      onValueChange={(value) => updateOrderStatus(selectedOrder.id, value)}
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
                                    {statusUpdateLoading && <RefreshCw className="h-4 w-4 animate-spin" />} {/* Show spinner */}
                                  </div>

                                  {selectedOrder.notes && (
                                      <>
                                        <h3 className="font-medium mt-4 mb-2">Notes</h3>
                                        <p className="text-sm whitespace-pre-wrap">{selectedOrder.notes}</p>
                                      </>
                                  )}
                                </div>

                                <div>
                                  <h3 className="font-medium mb-2">Order Items</h3>
                                  <div className="border rounded-md">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Item</TableHead>
                                          <TableHead>Qty</TableHead>
                                          <TableHead className="text-right">Price</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {selectedOrder.items?.map((item, index) => (
                                          <TableRow key={index}>
                                            <TableCell>
                                              <div>
                                                <p className="font-medium">{item.name}</p>
                                                {/* Optionally display more item details */}
                                                <p className="text-xs text-muted-foreground">
                                                  {item.details?.material_id} / {item.details?.color_id} / {item.details?.quality_id}
                                                </p>
                                                {item.details?.is_multi_color && <p className="text-xs text-muted-foreground">Multi-Color</p>}
                                                {item.details?.special_filament && <p className="text-xs text-muted-foreground">Special: {item.details.special_filament}</p>}
                                              </div>
                                            </TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell className="text-right">${item.price?.toFixed(2) ?? '0.00'}</TableCell>
                                          </TableRow>
                                        ))}
                                        <TableRow>
                                          <TableCell className="font-medium">Subtotal</TableCell>
                                          <TableCell className="text-right">${selectedOrder.subtotal?.toFixed(2) ?? '0.00'}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                          <TableCell className="font-medium">Shipping</TableCell>
                                          <TableCell className="text-right">${selectedOrder.shipping?.toFixed(2) ?? '0.00'}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                          <TableCell className="font-medium">Tax</TableCell>
                                          <TableCell className="text-right">${selectedOrder.tax?.toFixed(2) ?? '0.00'}</TableCell>
                                        </TableRow>
                                        <TableRow>
                                          <TableCell className="font-medium">Total</TableCell>
                                          <TableCell className="text-right">${selectedOrder.total?.toFixed(2) ?? '0.00'}</TableCell>
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
                          )}
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
