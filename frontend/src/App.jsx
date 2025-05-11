import { useState } from 'react'
import './App.css'
import GanttChart from './components/GanttChart'
import SearchBar from './components/SearchBar'

function App() {
  const [highlightedOrderCode, setHighlightedOrderCode] = useState(null)

  const handleSearchResult = (orderCode) => {
    setHighlightedOrderCode(orderCode)
  }

  return (
    <div className="app-container">
      <header>
        <h1>Üretim Gantt Chart Sistemi</h1>
      </header>
      
      <main>
        <div className="content-wrapper horizontal">
          <div className="search-section">
            <h2>İş Emri Arama</h2>
            <SearchBar onSearchResult={handleSearchResult} />
          </div>
          
          <div className="chart-section">
            <GanttChart highlightedOrderCode={highlightedOrderCode} />
          </div>
        </div>
      </main>
      
      <footer>
        <p>© 2024 Üretim Takip Sistemi</p>
      </footer>
    </div>
  )
}

export default App
