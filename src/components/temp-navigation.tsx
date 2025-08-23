import { Link, useLocation } from "react-router-dom";

export function TempNavigation() {
  const location = useLocation();
  const isOnCMS = location.pathname === "/admin/cms";

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3">
      {isOnCMS ? (
        <Link
          to="/"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all hover:scale-105 flex items-center gap-2"
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
            />
          </svg>
          Go to Home
        </Link>
      ) : (
        <Link
          to="/admin/cms"
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-all hover:scale-105 flex items-center gap-2"
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" 
            />
          </svg>
          Go to CMS
        </Link>
      )}
      
      <div className="text-xs text-center bg-gray-800 text-gray-300 px-3 py-1 rounded-full">
        {isOnCMS ? "Currently in CMS" : "Currently on Home"}
      </div>
    </div>
  );
}
