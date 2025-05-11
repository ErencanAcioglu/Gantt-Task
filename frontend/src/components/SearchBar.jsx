import { useState } from 'react';
import { getTasksByOrderCode } from '../services/supabase';

const SearchBar = ({ onSearchResult }) => {
  const [orderCode, setOrderCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!orderCode.trim()) {
      setError('Lütfen bir iş emri numarası girin');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const tasks = await getTasksByOrderCode(orderCode);
      
      if (tasks.length === 0) {
        setError(`"${orderCode}" numaralı iş emri bulunamadı`);
        onSearchResult(null); // Ana bileşene iş emri bulunamadığını bildir
      } else {
        setError('');
        onSearchResult(orderCode); // Bulunan iş emri kodunu ana bileşene bildir
      }
    } catch (err) {
      console.error('Arama hatası:', err);
      setError('Arama sırasında bir hata oluştu');
      onSearchResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSearch} className="compact-form">
        <div className="search-input-group">
          <input
            type="text"
            value={orderCode}
            onChange={(e) => setOrderCode(e.target.value)}
            placeholder="İş emri numarası girin (örn. MFG-5)"
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Aranıyor...' : 'Ara'}
          </button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
};

export default SearchBar; 