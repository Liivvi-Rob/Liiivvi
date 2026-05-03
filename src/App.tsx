import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Listings from './pages/Listings'
import PropertyDetail from './pages/PropertyDetail'
import CreateListing from './pages/CreateListing'
import Admin from './pages/Admin'
import Messages from './pages/Messages'
import Schedule from './pages/Schedule'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/listing/:id" element={<PropertyDetail />} />
        <Route path="/create-listing" element={<CreateListing />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/schedule/:id" element={<Schedule />} />
      </Routes>
    </Layout>
  )
}

export default App
