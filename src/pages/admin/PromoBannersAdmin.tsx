import React from 'react';
import { PromoBannerList } from '@/components/admin/PromoBannerList';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const PromoBannersAdmin: React.FC = () => {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <PromoBannerList />
      </div>
    </ProtectedRoute>
  );
};

export default PromoBannersAdmin; 