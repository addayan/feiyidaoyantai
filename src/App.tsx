import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Create from './pages/Create';
import Director from './pages/Director';
import Cases from './pages/Cases';
import MyProjects from './pages/MyProjects';
import TechRoadmap from './pages/TechRoadmap';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <ErrorBoundary>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<Create />} />
            <Route path="/director/:projectId" element={<Director />} />
            <Route path="/cases" element={<Cases />} />
            <Route path="/my-projects" element={<MyProjects />} />
            <Route path="/tech-roadmap" element={<TechRoadmap />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}
