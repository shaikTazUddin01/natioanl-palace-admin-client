import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600">404</h1>
        <p className="text-gray-600 mb-4">
          Page Not Found
        </p>

        <Link
          href="/"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
