import { Leaf } from "lucide-react";

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Leaf className="w-9 h-9 text-white" />
        </div>
        <p className="text-gray-500 text-sm font-medium">Loading AgriVision AI...</p>
      </div>
    </div>
  );
}
