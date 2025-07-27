import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

const searchTerms = ['матрас Sakina', 'кровать Sakina', 'подушка Sakina'];

const SearchBar = () => {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [text, setText] = useState('');
  const [delta, setDelta] = useState(200 - Math.random() * 100);

  useEffect(() => {
    let ticker = setInterval(() => {
      tick();
    }, delta);

    return () => clearInterval(ticker);
  }, [text, isDeleting, placeholderIndex]);

  const tick = () => {
    let currentTerm = searchTerms[placeholderIndex];
    let updatedText = isDeleting
      ? text.substring(0, text.length - 1)
      : currentTerm.substring(0, text.length + 1);

    setText(updatedText);

    if (isDeleting) {
      setDelta(100);
    }

    if (!isDeleting && updatedText === currentTerm) {
      setIsDeleting(true);
      setDelta(2000);
    } else if (isDeleting && updatedText === '') {
      setIsDeleting(false);
      setPlaceholderIndex((prev) => (prev + 1) % searchTerms.length);
      setDelta(500);
    }
  };

  return (
    <div className="flex-1 max-w-2xl mx-8">
      <div className="relative">
        <input
          type="text"
          placeholder={text || 'Поиск'}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-turquoise"
        />
        <Search
          className="absolute left-3 top-2.5 text-gray-400"
          size={20}
        />
      </div>
    </div>
  );
};

export default SearchBar;