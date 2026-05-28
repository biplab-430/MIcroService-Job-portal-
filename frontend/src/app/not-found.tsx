import Link from "next/link";
import { AlertCircle } from "lucide-react"; // Assuming you are still using lucide-react

 function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-black text-gray-900 dark:text-gray-100 p-4">
      <div className="flex flex-col items-center text-center max-w-md">
        
        {/* Icon */}
        <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full mb-6">
          <AlertCircle className="w-12 h-12 text-red-500 dark:text-red-400" />
        </div>

        {/* Text content */}
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">
          404 - Page Not Found
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Oops! The page you are looking for doesn't exist, has been moved, or you don't have access to it.
        </p>

        {/* Action Button */}
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white transition-all bg-blue-600 rounded-xl hover:bg-blue-700 active:scale-95 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
export default NotFound