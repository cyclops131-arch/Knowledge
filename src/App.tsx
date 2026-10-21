import { MotionConfig } from 'framer-motion'
import { Link, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { chapters } from './content'
import { ChapterPage } from './pages/ChapterPage'
import { GlossaryPage } from './pages/GlossaryPage'

export function App() {
  return (
    // Respect the OS "reduce motion" setting for every animation.
    <MotionConfig reducedMotion="user">
      <Routes>
        {chapters.map((c) => (
          <Route key={c.id} path={c.path} element={<ChapterPage chapter={c} />} />
        ))}
        <Route path="/glossary" element={<GlossaryPage />} />
        <Route
          path="*"
          element={
            <Layout>
              <h1 className="text-2xl font-bold">Packet lost 📭</h1>
              <p className="mt-2">
                No page lives at this address. <Link to="/" className="font-semibold text-sky-700 underline dark:text-sky-400">Back to the start</Link>
              </p>
            </Layout>
          }
        />
      </Routes>
    </MotionConfig>
  )
}
