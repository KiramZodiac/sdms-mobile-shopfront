import { Card, CardContent } from '@/components/ui/card';
import { memo } from 'react';

export const SpecificationsCard = memo(({ specifications }: { specifications: Record<string, any> }) => (
  <Card className="mt-8">
    <CardContent className="p-6">
      <h3 className="text-xl font-semibold mb-4">Specifications</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(specifications).map(([key, value]) => (
          <div key={key} className="flex justify-between border-b pb-2 last:border-b-0">
            <span className="font-medium text-gray-900 capitalize">{key.replace(/_/g, ' ')}:</span>
            <span className="text-gray-600">{String(value)}</span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
));