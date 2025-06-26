import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';

const filterOptions = {
  College: ['CST', 'CMSS', 'COE', 'CLDS'],
  Department: ['NACOS', 'NUESA', 'NIMechE', 'NUESS'],
  Course: ['Mathematics', 'Computer Science', 'Estate Management', 'Building Tech'],
};

const getLevels = (option: string) => {
  const fiveLevel = ['100L', '200L', '300L', '400L', '500L'];
  const fourLevel = ['100L', '200L', '300L', '400L'];
  if (['CST', 'Estate Management', 'Building Tech', 'COE'].includes(option)) return fiveLevel;
  return fourLevel;
};

type Filter = {
  type?: keyof typeof filterOptions;
  option?: string;
  level?: string[];
};

export default function NicheFilters() {
  const [filters, setFilters] = useState<Filter[]>([{}]);
  const [useFilters, setUseFilters] = useState(false);

  const handleAdd = () => setFilters([...filters, {}]);
  const handleRemove = (index: number) => setFilters(filters.filter((_, i) => i !== index));
  const updateFilter = (index: number, key: keyof Filter, value: any) => {
    const newFilters = [...filters];
    newFilters[index][key] = value;
    if (key === 'option') newFilters[index]['level'] = [];
    setFilters(newFilters);
  };

  return (
    <div className="mt-4">
      <p className='ml-52'>Niche Information:</p>
      <div className="bg-white border border-[#B3935E] p-6 rounded-xl text-sm mb-4 mt-4 w-7/12 ml-52">
        <div className="flex items-center gap-2 mb-2">
          <div className="mb-4 w-full">
            <div className="mb-2">
              <label className="block mb-1 text-[#2E2F32] font-medium" htmlFor="university">
                Institution:
              </label>
              <select id="university" className="border p-2 w-full rounded-[5px]">
                <option>Covenant University</option>
              </select>
            </div>
            <div className="mb-2">
              <label className="block mb-1 text-[#2E2F32] font-medium" htmlFor="gender">
                Gender:
              </label>
              <select id="gender" className="border p-2 w-full rounded-[5px]">
                <option>Both</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 text-[#2E2F32] font-medium" htmlFor="status">
                Role:
              </label>
              <select id="status" className="border p-2 w-full rounded-[5px]">
                <option>Student</option>
                <option>Lecturer</option>
              </select>
              
              <div className="flex items-center gap-4 mt-5">
                <label className="text-[#2E2F32] text-xl mb-0">Niche selection:</label>
                <span className={useFilters ? "text-gray-400" : "text-[#B3935E] font-semibold"}>
                  Everyone
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useFilters}
                    onChange={() => setUseFilters(!useFilters)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#B3935E] rounded-full peer peer-checked:bg-[#B3935E] transition-all duration-200"></div>
                  <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all duration-200 peer-checked:translate-x-5"></div>
                </label>
                <span className={useFilters ? "text-[#B3935E] font-semibold" : "text-gray-400"}>
                  Apply filter
                </span>
              </div>
            </div>
          </div>
        </div>

        {useFilters &&
          filters.map((filter, i) => (
            <div key={i} className="flex flex-wrap gap-2 items-center mb-2 w-full rounded-lg bg-[#B3935E1A] p-3">
              {/* Add the FILTER label here */}
              <div className="w-full mb-0">
                <span className="inline-block  text-[#2E2F3266] text-lg  px-3 py-0 rounded">
                  FILTER {i + 1}
                </span>
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block mb-1 text-[#2E2F32] font-medium" htmlFor="status">
                  Filter by:
                </label>
                <select
                  onChange={(e) => updateFilter(i, 'type', e.target.value)}
                  className="border p-2 w-full rounded-[5px] text-[#2E2F32]"
                  value={filter.type || ''}
                >
                  <option value="">Filter by</option>
                  {Object.keys(filterOptions).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[150px]">
                <label className="block mb-1 text-[#2E2F32] font-medium" htmlFor="status">
                  Option:
                </label>
                <select
                  onChange={(e) => updateFilter(i, 'option', e.target.value)}
                  className="border p-2 w-full rounded-[5px] text-[#2E2F32]"
                  value={filter.option || ''}
                >
                  <option value="">Select option</option>
                  {(filter.type && filterOptions[filter.type] || []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[150px]">
                <label className="block mb-1 text-[#2E2F32] font-medium" htmlFor="status">
                  Level:
                </label>
                <select
                  multiple
                  className="border p-2 w-full rounded-[5px] text-[#2E2F32] max-h-32 overflow-y-auto focus:border-[#B3935E] focus:ring-2 focus:ring-[#B3935E]"
                  value={filter.level || []}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                    updateFilter(i, 'level', selected);
                  }}
                >
                  {(filter.option && getLevels(filter.option) || []).map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              <button type="button" onClick={() => handleRemove(i)} className="text-[#2E2F32] text-lg">
                <IoClose />
              </button>
            </div>
          ))}

        {useFilters && (
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-1 text-[#B3935E] text-sm mt-2"
          >
            Add filter<img src="/plus.svg" className="w-4 h-4" alt="add" /> 
          </button>
        )}
      </div>
    </div>
  );
}
