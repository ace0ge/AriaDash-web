import { HashRouter, Routes, Route } from 'react-router-dom'
import { Aria2Provider } from './context/Aria2Context'
import { I18nProvider } from './i18n'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Settings } from './pages/Settings'
import { TaskDetail } from './pages/TaskDetail'

export function App() {
  return (
    <I18nProvider>
      <Aria2Provider>
        <HashRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/task/:gid" element={<TaskDetail />} />
            </Routes>
          </Layout>
        </HashRouter>
      </Aria2Provider>
    </I18nProvider>
  )
}
