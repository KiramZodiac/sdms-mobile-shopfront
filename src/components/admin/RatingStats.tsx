import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, BarChart3, RefreshCw, Trash2 } from 'lucide-react';
import { getRatingStats, clearAllRatings } from '@/lib/ratingUtils';
import { useToast } from '@/hooks/use-toast';

const RatingStats = () => {
  const [stats, setStats] = useState({ totalProducts: 0, averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadStats = () => {
    const currentStats = getRatingStats();
    setStats(currentStats);
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      loadStats();
      setLoading(false);
      toast({
        title: "Stats Refreshed",
        description: "Rating statistics have been updated",
      });
    }, 500);
  };

  const handleClearRatings = () => {
    if (window.confirm('Are you sure you want to clear all product ratings? This action cannot be undone.')) {
      clearAllRatings();
      loadStats();
      toast({
        title: "Ratings Cleared",
        description: "All product ratings have been cleared",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-orange-500" />
          <h3 className="text-lg font-semibold">Rating Statistics</h3>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearRatings}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalProducts}</div>
            <p className="text-xs text-gray-500">with ratings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-gray-900">{stats.averageRating}</div>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(stats.averageRating)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500">out of 5 stars</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalReviews.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">across all products</p>
          </CardContent>
        </Card>
      </div>

      {stats.totalProducts === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Ratings Yet</h4>
            <p className="text-gray-500 mb-4">
              Product ratings will appear here once customers start viewing products.
            </p>
            <Badge variant="secondary">Ratings are generated automatically</Badge>
          </CardContent>
        </Card>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">How Ratings Work</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Ratings are automatically generated for featured products</li>
          <li>• Ratings persist across browser sessions using localStorage</li>
          <li>• Higher ratings (4.0-5.0) are more common (70% chance)</li>
          <li>• Review counts correlate with rating quality</li>
          <li>• Ratings are consistent - same product gets same rating</li>
        </ul>
      </div>
    </div>
  );
};

export default RatingStats; 