import { useDataInitializer } from './DataInitializer';
import AppSkeleton from './AppSkeleton';

export const AppLoader = () => {
  const { isInitialized, error } = useDataInitializer();

  if (isInitialized) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <AppSkeleton />
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <p className="text-sm">
            {error}
          </p>
        </div>
      )}
    </div>
  );
}; 