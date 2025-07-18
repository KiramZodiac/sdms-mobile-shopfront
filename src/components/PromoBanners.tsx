import React from 'react'
import { Button } from '@/components/ui/button'

function PromoBanners() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Special Promotions</h2>
      
      {/* Promo Banners */}

<div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-lg relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Large Selection</h3>
              <p className="text-sm mb-4">Of Custom Wheels</p>
              <Button variant="secondary" size="sm">Shop Now</Button>
            </div>
            <div className="absolute right-0 top-0 h-full w-1/2 bg-black/10"></div>
          </div>
          
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-6 rounded-lg relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Book Store</h3>
              <p className="text-sm mb-4">For You & Everyone</p>
              <Button variant="secondary" size="sm">Shop Now</Button>
            </div>
            <div className="absolute right-0 top-0 h-full w-1/2 bg-black/10"></div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">The New</h3>
              <p className="text-sm mb-4">Armchair</p>
              <Button variant="secondary" size="sm">Shop Now</Button>
            </div>
            <div className="absolute right-0 top-0 h-full w-1/2 bg-black/10"></div>
          </div>
        </div>



    </div>
  )
}

export default PromoBanners