// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Textarea } from "@/components/ui/textarea";
// import { useCart } from "@/hooks/useCart";
// import { CartItems } from "@/components/CartItems";
// import { useToast } from "@/hooks/use-toast";
// import { supabase } from "@/integrations/supabase/client";


// declare global {
//   interface Window {
//     FlutterwaveCheckout: any;
//   }
// }

// type PaymentMethod = 'whatsapp' | 'flutterwave';

// const Checkout = () => {
//   const { items, total, clearCart } = useCart();
//   const { toast } = useToast();
//   const [loading, setLoading] = useState(false);
//   const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('whatsapp');
//   const [customerData, setCustomerData] = useState({
//     firstName: "",
//     lastName: "",
//     phone: "",
//     email: "",
//     address: "",
//     city: "",
//     district: "",
//     notes: ""
//   });

//   const formatPrice = (price: number) => {
//     return new Intl.NumberFormat('en-UG', {
//       style: 'currency',
//       currency: 'UGX',
//       minimumFractionDigits: 0
//     }).format(price);
//   };

//   const handleInputChange = (field: string, value: string) => {
//     setCustomerData(prev => ({ ...prev, [field]: value }));
//   };

//   const validateForm = () => {
//     if (items.length === 0) {
//       toast({
//         title: "Cart Empty",
//         description: "Please add items to your cart before checking out",
//         variant: "destructive",
//       });
//       return false;
//     }

//     if (!customerData.firstName || !customerData.lastName || !customerData.phone) {
//       toast({
//         title: "Missing Information",
//         description: "Please fill in all required fields",
//         variant: "destructive",
//       });
//       return false;
//     }

//     if (paymentMethod === 'flutterwave' && !customerData.email) {
//       toast({
//         title: "Email Required",
//         description: "Email is required for Flutterwave payment",
//         variant: "destructive",
//       });
//       return false;
//     }

//     return true;
//   };

//   const createCustomerAndOrder = async () => {
//     // Create customer
//     const { data: customer, error: customerError } = await supabase
//       .from('customers')
//       .insert([{
//         first_name: customerData.firstName,
//         last_name: customerData.lastName,
//         phone: customerData.phone,
//         email: customerData.email || null,
//         address: customerData.address || null,
//         city: customerData.city || null,
//         district: customerData.district || null,
//       }])
//       .select()
//       .single();

//     if (customerError) throw customerError;

//     // Generate order number
//     const { data: orderNumber, error: orderNumberError } = await supabase
//       .rpc('generate_order_number');

//     if (orderNumberError) throw orderNumberError;

//     // Create order
//     const shippingFee = 10000; // 10,000 UGX shipping fee
//     const orderTotal = total + shippingFee;

//     // Map payment method to match database enum
//     const dbPaymentMethod = paymentMethod === 'flutterwave' ? 'mobile_money' : 'whatsapp';

//     const { data: order, error: orderError } = await supabase
//       .from('orders')
//       .insert({
//         customer_id: customer.id,
//         order_number: orderNumber,
//         subtotal: total,
//         shipping_fee: shippingFee,
//         total: orderTotal,
//         payment_method: dbPaymentMethod as 'whatsapp' | 'cash_on_delivery' | 'mobile_money' | 'bank_transfer',
//         status: 'pending' as 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
//         notes: customerData.notes || null,
//       })
//       .select()
//       .single();

//     if (orderError) throw orderError;

//     // Create order items
//     const orderItems = items.map(item => ({
//       order_id: order.id,
//       product_id: item.id,
//       quantity: item.quantity,
//       unit_price: item.price,
//       total_price: item.price * item.quantity,
//     }));

//     const { error: itemsError } = await supabase
//       .from('order_items')
//       .insert(orderItems);

//     if (itemsError) throw itemsError;

//     return { customer, order, orderTotal };
//   };

//   // Separate function to update order status
//   const updateOrderStatus = async (orderId: string, transactionData: any) => {
//     console.log('Updating order status for:', orderId, transactionData);
    
//     try {
//       // Convert transaction_id to string if it's a number
//       const transactionReference = String(transactionData.transaction_id);
//       const txRef = String(transactionData.tx_ref);
      
//       console.log('Converted values:', { transactionReference, txRef });
      
//       // First, let's check if the order exists
//       const { data: existingOrder, error: checkError } = await supabase
//         .from('orders')
//         .select('*')
//         .eq('id', orderId)
//         .single();
      
//       if (checkError) {
//         console.error('Error checking if order exists:', checkError);
//         throw new Error(`Order not found: ${checkError.message}`);
//       }
      
//       console.log('Existing order found:', existingOrder);
      
//       // Now try to update
//       const { data, error } = await supabase
//         .from('orders')
//         .update({ 
//           status: 'confirmed' as 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
//           transaction_reference: transactionReference,
//           flutterwave_tx_ref: txRef,
//         })
//         .eq('id', orderId)
//         .select();

//       if (error) {
//         console.error('Supabase update error:', error);
//         console.error('Error details:', JSON.stringify(error, null, 2));
//         throw error;
//       }

//       if (!data || data.length === 0) {
//         console.error('Update returned no rows - possible RLS policy issue');
//         throw new Error('Update failed - no rows affected. This might be due to Row Level Security policies.');
//       }

//       console.log('Order updated successfully:', data);
//       return data;
//     } catch (error) {
//       console.error('Error updating order status:', error);
//       throw error;
//     }
//   };

//   const handleFlutterwavePayment = async (orderData: any) => {
//     const { order, orderTotal } = orderData;

//     return new Promise((resolve, reject) => {
//       window.FlutterwaveCheckout({
//         public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_TEST-your-public-key-here',
//         tx_ref: order.order_number,
//         amount: orderTotal,
//         currency: 'UGX',
//         payment_options: 'mobilemoneyuganda',
//         customer: {
//           email: customerData.email,
//           phone_number: customerData.phone,
//           name: `${customerData.firstName} ${customerData.lastName}`,
//         },
//         callback: async (data: any) => {
//           console.log('Flutterwave callback received:', data);
//           console.log('Order ID to update:', order.id);
          
//           try {
//             if (data.status === 'successful') {
//               console.log('Payment successful, updating order...');
              
//               // Add a small delay to ensure the transaction is fully processed
//               await new Promise(resolve => setTimeout(resolve, 1000));
              
//               // Update order status with better error handling
//               const updatedOrder = await updateOrderStatus(order.id, data);
//               console.log('Database update result:', updatedOrder);

//               toast({
//                 title: "Payment Successful!",
//                 description: `Your order ${order.order_number} has been paid successfully. Transaction ID: ${data.transaction_id}`,
//               });

//               clearCart();
//               resolve(data);
//             } else {
//               console.log('Payment not successful:', data.status);
//               toast({
//                 title: "Payment Failed",
//                 description: `Payment status: ${data.status}. Please try again.`,
//                 variant: "destructive",
//               });
//               reject(new Error(`Payment failed with status: ${data.status}`));
//             }
//           } catch (error) {
//             console.error('Error in payment callback:', error);
            
//             // Still show success to user since payment went through
//             if (data.status === 'successful') {
//               toast({
//                 title: "Payment Successful!",
//                 description: `Payment completed but order status update failed. Please contact support with Transaction ID: ${data.transaction_id}`,
//                 variant: "destructive",
//               });
//               clearCart();
//               resolve(data);
//             } else {
//               toast({
//                 title: "Payment Processing Error",
//                 description: "An error occurred while processing your payment. Please contact support.",
//                 variant: "destructive",
//               });
//               reject(error);
//             }
//           }
//         },
//         onclose: () => {
//           console.log('Flutterwave checkout closed');
//           // Optional: Add logic here if user closes without paying
//         },
//         customizations: {
//           title: 'Order Payment',
//           description: `Payment for order ${order.order_number}`,
//           logo: '', // Add your logo URL here
//         },
//       });
//     });
//   };

//   const handleWhatsAppOrder = async (orderData: any) => {
//     const { order, orderTotal } = orderData;

//     // Generate WhatsApp message
//     const itemsList = items.map(item => 
//       `${item.name} - Qty: ${item.quantity} - ${formatPrice(item.price * item.quantity)}`
//     ).join('\n');

//     const message = `New Order: ${order.order_number}

// Customer Details:
// Name: ${customerData.firstName} ${customerData.lastName}
// Phone: ${customerData.phone}
// ${customerData.email ? `Email: ${customerData.email}` : ''}
// ${customerData.address ? `Address: ${customerData.address}` : ''}
// ${customerData.city ? `City: ${customerData.city}` : ''}
// ${customerData.district ? `District: ${customerData.district}` : ''}

// Order Details:
// ${itemsList}

// Subtotal: ${formatPrice(total)}
// Shipping: ${formatPrice(10000)}
// Total: ${formatPrice(orderTotal)}

// ${customerData.notes ? `Notes: ${customerData.notes}` : ''}`;

//     const whatsappUrl = `https://wa.me/+256755869853?text=${encodeURIComponent(message)}`;

//     // Update order with WhatsApp URL
//     await supabase
//       .from('orders')
//       .update({ whatsapp_chat_url: whatsappUrl })
//       .eq('id', order.id);

//     // Clear cart and redirect to WhatsApp
//     clearCart();
//     window.open(whatsappUrl, '_blank');

//     toast({
//       title: "Order Placed!",
//       description: "Your order has been submitted. You'll be redirected to WhatsApp to complete the payment.",
//     });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!validateForm()) return;

//     setLoading(true);

//     try {
//       const orderData = await createCustomerAndOrder();

//       if (paymentMethod === 'flutterwave') {
//         await handleFlutterwavePayment(orderData);
//       } else {
//         await handleWhatsAppOrder(orderData);
//       }

//     } catch (error) {
//       console.error('Checkout error:', error);
//       toast({
//         title: "Error",
//         description: "Failed to place order. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
      
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//         {/* Cart Items */}
//         <div>
//           <h2 className="text-xl font-semibold mb-4">Your Order</h2>
//           <CartItems />
//         </div>

//         {/* Customer Details Form */}
//         <div>
//           <Card>
//             <CardHeader>
//               <CardTitle>Customer Details</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <Label htmlFor="firstName">First Name *</Label>
//                     <Input
//                       id="firstName"
//                       value={customerData.firstName}
//                       onChange={(e) => handleInputChange('firstName', e.target.value)}
//                       required
//                     />
//                   </div>
//                   <div>
//                     <Label htmlFor="lastName">Last Name *</Label>
//                     <Input
//                       id="lastName"
//                       value={customerData.lastName}
//                       onChange={(e) => handleInputChange('lastName', e.target.value)}
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <Label htmlFor="phone">Phone Number *</Label>
//                   <Input
//                     id="phone"
//                     type="tel"
//                     value={customerData.phone}
//                     onChange={(e) => handleInputChange('phone', e.target.value)}
//                     placeholder="e.g., +256700000000"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <Label htmlFor="email">
//                     Email {paymentMethod === 'flutterwave' ? '*' : '(Optional)'}
//                   </Label>
//                   <Input
//                     id="email"
//                     type="email"
//                     value={customerData.email}
//                     onChange={(e) => handleInputChange('email', e.target.value)}
//                     required={paymentMethod === 'flutterwave'}
//                   />
//                 </div>

//                 <div>
//                   <Label htmlFor="address">Address (Optional)</Label>
//                   <Input
//                     id="address"
//                     value={customerData.address}
//                     onChange={(e) => handleInputChange('address', e.target.value)}
//                   />
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <Label htmlFor="city">City (Optional)</Label>
//                     <Input
//                       id="city"
//                       value={customerData.city}
//                       onChange={(e) => handleInputChange('city', e.target.value)}
//                     />
//                   </div>
//                   <div>
//                     <Label htmlFor="district">District (Optional)</Label>
//                     <Input
//                       id="district"
//                       value={customerData.district}
//                       onChange={(e) => handleInputChange('district', e.target.value)}
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <Label htmlFor="notes">Order Notes (Optional)</Label>
//                   <Textarea
//                     id="notes"
//                     value={customerData.notes}
//                     onChange={(e) => handleInputChange('notes', e.target.value)}
//                     placeholder="Any special instructions..."
//                   />
//                 </div>

//                 {/* Payment Method Selection */}
//                 <div>
//                   <Label htmlFor="paymentMethod">Payment Method *</Label>
//                   <Select 
//                     value={paymentMethod} 
//                     onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select payment method" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="whatsapp">WhatsApp Order (Pay Later)</SelectItem>
//                       <SelectItem value="flutterwave">Mobile Money (Pay Now)</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="pt-4 border-t">
//                   <div className="flex justify-between items-center mb-2">
//                     <span>Subtotal:</span>
//                     <span>{formatPrice(total)}</span>
//                   </div>
//                   <div className="flex justify-between items-center mb-2">
//                     <span>Shipping:</span>
//                     <span>{formatPrice(10000)}</span>
//                   </div>
//                   <div className="flex justify-between items-center text-lg font-semibold border-t pt-2">
//                     <span>Total:</span>
//                     <span>{formatPrice(total + 10000)}</span>
//                   </div>
//                 </div>

//                 <Button 
//                   type="submit" 
//                   className={`w-full text-white ${
//                     paymentMethod === 'flutterwave' 
//                       ? 'bg-blue-600 hover:bg-blue-700' 
//                       : 'bg-orange-500 hover:bg-orange-600'
//                   }`}
//                   disabled={loading || items.length === 0}
//                 >
//                   {loading 
//                     ? 'Processing...' 
//                     : paymentMethod === 'flutterwave'
//                       ? 'Pay with Mobile Money'
//                       : 'Place Order via WhatsApp'
//                   }
//                 </Button>

//                 {paymentMethod === 'flutterwave' && (
//                   <p className="text-sm text-gray-600 text-center">
//                     You will be redirected to Flutterwave to complete your mobile money payment
//                   </p>
//                 )}
//               </form>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Checkout;