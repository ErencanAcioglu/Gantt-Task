import { useState } from 'react'
import './App.css'
import GanttChart from './components/GanttChart'
import SearchBar from './components/SearchBar'

function App() {
  const [highlightedOrderCode, setHighlightedOrderCode] = useState(null)
  const [selectedWorkOrders, setSelectedWorkOrders] = useState([])

  const handleSearchResult = (orderCode) => {
    if (orderCode) {
      setHighlightedOrderCode(orderCode)
      // Eğer zaten seçilmemişse, seçilen iş emirlerine ekle
      if (!selectedWorkOrders.includes(orderCode)) {
        setSelectedWorkOrders(prev => [...prev, orderCode])
      }
    }
  }

  return (
    <div className="app-container">
      <header>
        <h1>Üretim Gantt Chart Sistemi</h1>
      </header>
      
      <main className="fullscreen-main">
        <div className="content-wrapper horizontal">
          <div className="search-section">
            <h2>İş Emri Arama</h2>
            <SearchBar onSearchResult={handleSearchResult} />
            
            {selectedWorkOrders.length > 0 && (
              <div className="selected-work-orders">
                <h3>Seçilen İş Emirleri</h3>
                <ul>
                  {selectedWorkOrders.map((order, index) => (
                    <li key={index}>
                      <span className="work-order-item">{order}</span>
                      <button 
                        className="remove-btn"
                        onClick={() => {
                          setSelectedWorkOrders(selectedWorkOrders.filter(o => o !== order))
                        }}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
