'use client';
import React, { useState } from 'react';

const collegeOptions = ['CST', 'CMSS', 'COE', 'CLDS'];

const CollegeFilter = () => {
  const [selected, setSelected] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectAll, setSelectAll] = useState(false);

  const filteredOptions = collegeOptions.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelect = (option: string) => {
    if (selected.includes(option)) {
      setSelected(selected.filter(item => item !== option));
    } else {
      setSelected([...selected, option]);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelected([]);
    } else {
      setSelected(collegeOptions);
    }
    setSelectAll(!selectAll);
  };

  return (
    <div className="w-full h-fit md:w-1/3 bg-white border border-[#E7DFC6] rounded-xl shadow-md p-4">
      <h2 className="text-sm font-medium mb-2">Options: <span className="font-bold">College</span></h2>

      <input
        type="text"
        placeholder="Search"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="w-full mb-2 px-3 py-2 text-sm border border-[#E7DFC6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#B3935E]"
      />

      <label className="flex items-center mb-2 cursor-pointer">
        <input
          type="checkbox"
          checked={selectAll}
          onChange={handleSelectAll}
          className="peer appearance-none w-5 h-5 border border-[#B3935E] rounded-md checked:bg-[#B3935E] checked:border-[#B3935E] mr-2 relative"
          style={{
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            appearance: 'none'
          }}
        />
        <svg
          className="absolute ml-[2px] w-4 h-4 pointer-events-none opacity-0 peer-checked:opacity-100"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="M6 10.8L9.2 14L14 7"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Select all options
      </label>

      <div className="space-y-2 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#B3935E] scrollbar-track-transparent">
        {filteredOptions.length > 0 ? (
          filteredOptions.map(option => (
            <button
              key={option}
              onClick={() => toggleSelect(option)}
              className={`w-full text-left px-4 py-2 rounded-lg border transition-colors ${
                selected.includes(option)
                  ? 'bg-[#B3935E] text-white border-[#B3935E]'
                  : 'bg-[#F2F2F2] text-black border-transparent hover:border-[#B3935E]'
              }`}
            >
              {option}
            </button>
          ))
        ) : (
          <p className="text-sm text-gray-500">No results found.</p>
        )}
      </div>
    </div>
  );
};

export default CollegeFilter;
