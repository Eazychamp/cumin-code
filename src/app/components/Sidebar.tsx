export function Sidebar() {
  return (
    <aside className="w-64 bg-gray-100 dark:bg-gray-800 p-4 border-r border-gray-200 dark:border-gray-700">
      <nav className="space-y-4">
        <a href="#" className="block text-gray-800 dark:text-gray-200 hover:text-blue-500">
          Home
        </a>
        <a href="#" className="block text-gray-800 dark:text-gray-200 hover:text-blue-500">
          Examples
        </a>
        <a href="#" className="block text-gray-800 dark:text-gray-200 hover:text-blue-500">
          Documentation
        </a>
      </nav>
    </aside>
  );
}