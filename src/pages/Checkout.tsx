
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Phone } from 'lucide-react';

interface ShippingRate {
  id: string;
  name: string;
  description: string;
  rate: number;
}

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [customerData, setCustomerData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    district: '',
  });
  
  const [selectedShipping, setSelectedShipping] = useState('');
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('whatsapp');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/products');
      return;
    }

    fetchShippingRates();
  }, [items.length, navigate]);

  const fetchShippingRates = async () => {
    try {
      const { data, error } = await supabase
        .from('shipping_rates')
        .select('*')
        .order('rate');

      if (error) throw error;
      setShippingRates(data || []);
      
      // Select first shipping option by default
      if (data && data.length > 0) {
        setSelectedShipping(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching shipping rates:', error);
      toast({
        title: "Error",
        description: "Failed to load shipping options",
        variant: "destructive",
      });
    }
  };

  const selectedShippingRate = shippingRates.find(rate => rate.id === selectedShipping);
  const shippingFee = selectedShippingRate?.rate || 0;
  const orderTotal = total + shippingFee;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create customer
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert({
          first_name: customerData.firstName,
          last_name: customerData.lastName,
          phone: customerData.phone,
          email: customerData.email || null,
          address: customerData.address,
          city: customerData.city,
          district: customerData.district,
        })
        .select()
        .single();

      if (customerError) throw customerError;

      // Generate order number
      const { data: orderNumber } = await supabase.rpc('generate_order_number');

      // Create WhatsApp message
      const whatsappMessage = generateWhatsAppMessage();
      const whatsappUrl = `https://wa.me/256701234567?text=${encodeURIComponent(whatsappMessage)}`;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_id: customer.id,
          subtotal: total,
          shipping_fee: shippingFee,
          total: orderTotal,
          status: 'pending',
          payment_method: paymentMethod as any,
          notes,
          whatsapp_chat_url: whatsappUrl,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      clearCart();

      toast({
        title: "Order placed successfully!",
        description: "You'll be redirected to WhatsApp to complete your order.",
      });

      // Redirect to WhatsApp
      window.open(whatsappUrl, '_blank');
      navigate('/');

    } catch (error: any) {
      console.error('Order creation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateWhatsAppMessage = () => {
    const orderSummary = items.map(item => 
      `${item.name} x${item.quantity} - ${formatPrice(item.price * item.quantity)}`
    ).join('\n');

    return `Hi! I'd like to place an order:

*Customer Details:*
Name: ${customerData.firstName} ${customerData.lastName}
Phone: ${customerData.phone}
${customerData.email ? `Email: ${customerData.email}` : ''}
Address: ${customerData.address}, ${customerData.city}, ${customerData.district}

*Order Items:*
${orderSummary}

*Order Summary:*
Subtotal: ${formatPrice(total)}
Shipping (${selectedShippingRate?.name}): ${formatPrice(shippingFee)}
Total: ${formatPrice(orderTotal)}

${notes ? `Notes: ${notes}` : ''}

Please confirm this order. Thank you!`;
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-3">
                  <img
                    src={item.images[0] || '/placeholder.svg'}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{formatPrice(shippingFee)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(orderTotal)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Checkout Form */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={customerData.firstName}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={customerData.lastName}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="256701234567"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerData.email}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    value={customerData.address}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, address: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={customerData.city}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, city: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="district">District *</Label>
                    <Input
                      id="district"
                      value={customerData.district}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, district: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Options */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Options</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedShipping} onValueChange={setSelectedShipping}>
                  {shippingRates.map((rate) => (
                    <div key={rate.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value={rate.id} id={rate.id} />
                      <Label htmlFor={rate.id} className="flex-1 cursor-pointer">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{rate.name}</p>
                            <p className="text-sm text-gray-500">{rate.description}</p>
                          </div>
                          <span className="font-semibold">{formatPrice(rate.rate)}</span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="whatsapp" id="whatsapp" />
                    <Label htmlFor="whatsapp" className="flex-1 cursor-pointer">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-green-600" />
                        <span>WhatsApp Order (Recommended)</span>
                        <Badge variant="secondary">Most Popular</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Complete your order via WhatsApp for fastest processing
                      </p>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-3 border rounded-lg opacity-50">
                    <RadioGroupItem value="cash_on_delivery" id="cash_on_delivery" disabled />
                    <Label htmlFor="cash_on_delivery" className="flex-1">
                      <span>Cash on Delivery</span>
                      <Badge variant="outline" className="ml-2">Coming Soon</Badge>
                      <p className="text-sm text-gray-500 mt-1">
                        Pay when your order is delivered
                      </p>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Order Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Order Notes (Optional)</CardTitle>
                <CardDescription>
                  Any special instructions for your order
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special delivery instructions, color preferences, etc."
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Processing...' : `Place Order - ${formatPrice(orderTotal)}`}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
