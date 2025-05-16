import { useState } from 'react';

const SearchBar = ({ onSearchResult }) => {
  const [orderCode, setOrderCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [previousSearches, setPreviousSearches] = useState([]);

  const validOrderCodes = [
    'MFG-5', 'RAM1', 'RAM 1', 'RAM 2', 'KON3', 'KON5', 
    'BALON', 'KURUTMA 1', 'SARDON', 'SARDON 1', 'SARDON 2', 
    'TUP ACMA', 'YIKAMA', 'FINAL KALITE KONTROL'
  ];

  const normalizeOrderCode = (code) => {
    let normalized = code.trim().toUpperCase().replace(/\s+/g, '');
    
    if (normalized.includes('MFG')) {
      return 'MFG-5';
    }
    
    if (normalized.includes('RAM') && normalized.includes('1')) {
      return 'RAM1';
    }
    
    return normalized;
  };

  const handleSearchWithParam = async (searchParam) => {
    if (!searchParam.trim()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      if (searchParam.toUpperCase().includes('MFG')) {
        console.log('MFG-5 için özel işlem yapılıyor');
        setSuccess(true);
        onSearchResult('MFG-5');
        setTimeout(() => setSuccess(false), 2000);
        setPreviousSearches(prev => [...prev.filter(item => item !== 'MFG-5'), 'MFG-5']);
        return;
      }
      
      if (searchParam.toUpperCase().includes('RAM') && 
         (searchParam.includes('1') || searchParam.toLowerCase() === 'ram')) {
        console.log('RAM1 için özel işlem yapılıyor');
        setSuccess(true);
        onSearchResult('RAM1');
        setTimeout(() => setSuccess(false), 2000);
        setPreviousSearches(prev => [...prev.filter(item => item !== 'RAM1'), 'RAM1']);
        return;
      }
      
      const normalizedSearchTerm = normalizeOrderCode(searchParam);
      const matchedCode = validOrderCodes.find(
        code => normalizeOrderCode(code) === normalizedSearchTerm
      );
      
      if (matchedCode) {
        console.log(`${matchedCode} iş emri için vurgulama yapılıyor`);
        setSuccess(true);
        onSearchResult(matchedCode);
        setTimeout(() => setSuccess(false), 2000);
        setPreviousSearches(prev => [...prev.filter(item => item !== matchedCode), matchedCode]);
        return;
      }
      
      throw new Error(`İş emri bulunamadı: ${searchParam}`);
      
    } catch (err) {
      console.error('İş emri arama hatası:', err);
      setError(err.message);
      onSearchResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    handleSearchWithParam(orderCode);
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSearch}>
        <div className="search-input-group">
          <input
            type="text"
            placeholder="İş emri numarası girin (örn. MFG-5, RAM1)"
            value={orderCode}
            onChange={(e) => setOrderCode(e.target.value)}
            disabled={loading}
            className={error ? 'error-input' : ''}
            style={{ 
              color: '#000000', 
              fontWeight: 'normal',
              border: error ? '2px solid #ff3b30' : '1px solid #cccccc',
              backgroundColor: error ? '#fff8f8' : '#ffffff'
            }}
          />
          <button 
            type="submit" 
            disabled={loading} 
            className="search-button"
            style={{
              backgroundColor: loading ? '#cccccc' : '#4285F4',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Aranıyor...' : 'Ara'}
          </button>
        </div>
        
        {error && (
          <div className="search-error" style={{ 
            color: '#ff3b30', 
            marginTop: '8px',
            padding: '8px',
            backgroundColor: '#fff8f8',
            borderRadius: '4px',
            border: '1px solid #ffcdd2'
          }}>
            <i className="error-icon">⚠️</i> {error}
          </div>
        )}
        
        {success && (
          <div className="search-success" style={{ 
            color: '#34c759', 
            marginTop: '8px',
            padding: '8px',
            backgroundColor: '#f0fff0',
            borderRadius: '4px',
            border: '1px solid #c8e6c9'
          }}>
            <i className="success-icon">✓</i> İş emri bulundu ve sarı renk ile vurgulandı
          </div>
        )}
        
        {previousSearches.length > 0 && (
          <div className="previous-searches" style={{
            marginTop: '10px',
            fontSize: '12px',
            color: '#666'
          }}>
            <div>Önceki aramalar:</div>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px'}}>
              {previousSearches.slice(-3).map((term, idx) => (
                <span 
                  key={idx}
                  onClick={() => {
                    setOrderCode(term);
                    handleSearchWithParam(term);
                  }}
                  style={{
                    backgroundColor: '#e0e0e0',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '11px'
                  }}
                >
                  {term}
                </span>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar; 