import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Create from './pages/Create';
import Director from './pages/Director';
import Cases from './pages/Cases';
import MyProjects from './pages/MyProjects';
import TechRoadmap from './pages/TechRoadmap';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<Create />} />
        <Route path="/director/:projectId" element={<Director />} />
        <Route path="/cases" element={<Cases />} />
        <Route path="/my-projects" element={<MyProjects />} />
        <Route path="/tech-roadmap" element={<TechRoadmap />} />
      </Routes>
    </>
  );
}