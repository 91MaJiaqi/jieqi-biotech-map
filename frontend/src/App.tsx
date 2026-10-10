import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import GraphPage from './pages/GraphPage'
import TermDetailPage from './pages/TermDetailPage'
import TechDetailPage from './pages/TechDetailPage'
import EntityDetailPage from './pages/EntityDetailPage'
import RegionPage from './pages/RegionPage'
import AdvicePage from './pages/AdvicePage'
import ClimatePage from './pages/ClimatePage'
import AboutPage from './pages/AboutPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/graph" element={<GraphPage />} />
        <Route path="/term/:id" element={<TermDetailPage />} />
        <Route path="/tech/:id" element={<TechDetailPage />} />
        <Route path="/organism/:id" element={<EntityDetailPage kind="organism" />} />
        <Route path="/gene/:id" element={<EntityDetailPage kind="gene" />} />
        <Route path="/env/:id" element={<EntityDetailPage kind="environment" />} />
        <Route path="/region" element={<RegionPage />} />
        <Route path="/advice" element={<AdvicePage />} />
        <Route path="/climate" element={<ClimatePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  )
}
