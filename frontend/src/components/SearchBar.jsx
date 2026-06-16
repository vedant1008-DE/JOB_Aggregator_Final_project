import { useState, useEffect, useRef } from 'react';
import { MdSearch, MdLocationOn, MdKeyboardArrowDown } from 'react-icons/md';
import { fetchLocations } from '../services/api';
import './SearchBar.css';

function SearchBar({ onSearch, onClear }) {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [locations, setLocations] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchLocations()
      .then(setLocations)
      .catch((err) => console.error('Failed to fetch locations:', err));

    function handleOutsideClick(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const filters = {};
    if (keyword) filters.keyword = keyword;
    if (location) filters.location = location;
    onSearch(filters);
  }

  function handleReset() {
    setKeyword('');
    setLocation('');
    onClear();
  }

  return (
    <div className={`search-bar glass fade-in ${isOpen ? 'dropdown-open' : ''}`}>
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-section">
          <MdSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Job title, keywords, or company"
          />
        </div>

        <div className="search-divider"></div>

        <div className="search-section" ref={dropdownRef}>
          <MdLocationOn className="search-icon" />
          <div className="custom-select-wrapper">
            <div className="custom-select-trigger" onClick={() => setIsOpen(!isOpen)}>
              <span className={location ? 'selected-value' : 'placeholder'}>
                {location || 'Select location or "remote"'}
              </span>
              <MdKeyboardArrowDown className={`arrow-icon ${isOpen ? 'open' : ''}`} />
            </div>
            {isOpen && (
              <ul className="custom-select-options glass fade-in-dropdown">
                <li
                  className={`custom-select-option ${location === '' ? 'active' : ''}`}
                  onClick={() => {
                    setLocation('');
                    setIsOpen(false);
                  }}
                >
                  Select location or "remote"
                </li>
                {locations.map((loc) => (
                  <li
                    key={loc}
                    className={`custom-select-option ${location === loc ? 'active' : ''}`}
                    onClick={() => {
                      setLocation(loc);
                      setIsOpen(false);
                    }}
                  >
                    {loc}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="search-actions">
          {keyword || location ? (
            <button type="button" className="search-reset-btn" onClick={handleReset}>
              Reset
            </button>
          ) : null}
          <button type="submit" className="search-submit-btn">
            Find jobs
          </button>
        </div>
      </form>
    </div>
  );
}

export default SearchBar;
