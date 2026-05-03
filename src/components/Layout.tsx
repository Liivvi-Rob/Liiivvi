import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold text-blue-600">Liivvi</Link>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search properties..."
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <nav className="hidden md:flex space-x-6">
                <Link to="/listings" className="text-gray-700 hover:text-blue-600">Buy</Link>
                <Link to="/create-listing" className="text-gray-700 hover:text-blue-600">Sell</Link>
                <Link to="/get-cma" className="text-gray-700 hover:text-blue-600">Get CMA</Link>
                <Link to="/messages" className="text-gray-700 hover:text-blue-600">Messages</Link>
                <Link to="/admin" className="text-gray-700 hover:text-blue-600">Admin</Link>
              </nav>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2026 Liivvi. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout