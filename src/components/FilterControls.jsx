import { useState, useEffect } from 'react';

const FilterControls = ({ hooks, onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [niches, setNiches] = useState([]);
  const [tones, setTones] = useState([]);
  const [lengths, setLengths] = useState([]);
  const [selectedNiche, setSelectedNiche] = useState('all');
  const [selectedTone, setSelectedTone] = useState('all');
  const [selectedLength, setSelectedLength] = useState('all');

  // Extract unique niches, tones, and lengths from hooks
  useEffect(() => {
    if (hooks && hooks.length) {
      const uniqueNiches = [...new Set(hooks.map(hook => hook.niche))];
      const uniqueTones = [...new Set(hooks.map(hook => hook.tone))];
      const uniqueLengths = [...new Set(hooks.map(hook => hook.length))];
      
      setNiches(uniqueNiches);
      setTones(uniqueTones);
      setLengths(uniqueLengths);
    }
  }, [hooks]);

  // Handle filter changes
  useEffect(() => {
    onFilterChange({
      searchTerm,
      niche: selectedNiche,
      tone: selectedTone,
      length: selectedLength
    });
  }, [searchTerm, selectedNiche, selectedTone, selectedLength]);

  return (
    <div className="filter-controls">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search hooks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      
      <div className="filter-selects">
        <div className="filter-group">
          <label htmlFor="niche-filter">Niche:</label>
          <select
            id="niche-filter"
            value={selectedNiche}
            onChange={(e) => setSelectedNiche(e.target.value)}
          >
            <option value="all">All Niches</option>
            {niches.map(niche => (
              <option key={niche} value={niche}>{niche.charAt(0).toUpperCase() + niche.slice(1)}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="tone-filter">Tone:</label>
          <select
            id="tone-filter"
            value={selectedTone}
            onChange={(e) => setSelectedTone(e.target.value)}
          >
            <option value="all">All Tones</option>
            {tones.map(tone => (
              <option key={tone} value={tone}>{tone.charAt(0).toUpperCase() + tone.slice(1)}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="length-filter">Length:</label>
          <select
            id="length-filter"
            value={selectedLength}
            onChange={(e) => setSelectedLength(e.target.value)}
          >
            <option value="all">All Lengths</option>
            {lengths.map(length => (
              <option key={length} value={length}>{length.charAt(0).toUpperCase() + length.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterControls; 