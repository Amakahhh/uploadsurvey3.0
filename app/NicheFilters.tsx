import React, { useState } from 'react';
import { IoClose } from 'react-icons/io5';
import Select from 'react-select';

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    borderColor: state.isFocused ? '#B3935E' : '#E5E7EB',
    boxShadow: state.isFocused ? '0 0 0 2px #B3935E33' : 'none',
    borderRadius: '5px',
    minHeight: '40px',
    backgroundColor: '#fff',
    '&:hover': {
      borderColor: '#B3935E',
      backgroundColor: '#F5F5F5', // Add grey background on hover
    },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? '#F5E9D6'
      : state.isFocused
      ? '#F5F5F5' // Grey background on hover
      : '#fff',
    color: '#2E2F32',
    cursor: 'pointer',
    borderRadius: '0px',
    padding: '10px 16px',
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '5px',
    marginTop: 2,
    boxShadow: '0 2px 8px 0 #B3935E22',
    border: '1px solid #B3935E',
    backgroundColor: '#fff',
    zIndex: 20,
  }),
  input: (provided) => ({
    ...provided,
    color: '#2E2F32',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#2E2F32',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#B3935E',
    fontWeight: 400,
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    color: '#B3935E',
    '&:hover': {
      color: '#B3935E',
    },
  }),
};

const filterOptions = {
  College: ['CST', 'CMSS', 'COE', 'CLDS'],
  Department: ['NACOS', 'NUESA', 'NIMechE', 'NUESS'],
  Course: ['Mathematics', 'Computer Science', 'Estate Management', 'Building Tech'],
};

const getLevels = (option: string) => {
  const fiveLevel = ['100L', '200L', '300L', '400L', '500L'];
  const fourLevel = ['100L', '200L', '300L', '400L'];
  if ([ 'Estate Management', 'Building Tech', 'COE'].includes(option)) return fiveLevel;
  return fourLevel;
};

type Filter = {
  institution?: string;
  gender?: string;
  role?: string;
  type?: keyof typeof filterOptions;
  option?: string;
  level?: string[];
};

export default function NicheFilters() {
  const [useFilters, setUseFilters] = useState(false);
  const [filters, setFilters] = useState<Filter[]>([{}]);
  const [base, setBase] = useState<Filter>({
    institution: '',
    gender: '',
    role: '',
  });

  const handleAdd = () => setFilters([...filters, {}]);
  const handleRemove = (index: number) => setFilters(filters.filter((_, i) => i !== index));
  const updateFilter = (index: number, key: keyof Filter, value: any) => {
    const newFilters = [...filters];
    newFilters[index][key] = value;
    if (key === 'option') newFilters[index]['level'] = [];
    setFilters(newFilters);
  };

  return (
    <div className="mt-4 w-full px-4 mx-auto max-w-3xl">
      <div className="bg-white border border-[#B3935E] p-6 rounded-xl text-sm mb-4 mt-4 w-full">
        {/* Switch Row */}
        <div className="flex items-center gap-4 mb-0">
          <label className="text-[#2E2F32] font-medium">Niche selection:</label>
          <span className={!useFilters ? "text-[#B3935E] font-semibold" : "text-gray-400"}>
            Everyone on SurveyHustler
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={useFilters}
              onChange={() => setUseFilters(!useFilters)}
              className="sr-only peer"
            />
            <div className={`w-11 h-6 rounded-full transition-all duration-200
              ${useFilters ? "bg-[#B3935E]" : "bg-gray-200"}
              peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#B3935E]`}>
            </div>
            <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all duration-200
              ${useFilters ? "translate-x-5" : ""}
            `}></div>
          </label>
          <span className={useFilters ? "text-[#B3935E] font-semibold" : "text-gray-400"}>
            Apply filter
          </span>
        </div>

        {/* Only show filters if switch is ON */}
        {useFilters && (
          <>
            {filters.map((filter, i) => (
              <div
                key={i}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start mb-4 w-full rounded-lg bg-[#B3935E1A] p-3"
              >
                <div>
                  <span className="inline-block text-[#2E2F3266] text-lg px-3 py-0 rounded mb-2">
                    FILTER {i + 1}
                  </span>
                  <div className="mb-2">
                    <label className="block mb-1 text-[#2E2F32] font-medium" htmlFor={`institution-${i}`}>
                      Institution:
                    </label>
                    <Select
                      id={`institution-${i}`}
                      styles={customStyles}
                      options={[{ value: '', label: 'Select option' }, { value: 'Covenant University', label: 'Covenant University' }]}
                      value={filter.institution ? { value: filter.institution, label: filter.institution } : null}
                      onChange={e => updateFilter(i, 'institution', e?.value || '')}
                      isSearchable={false}
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block mb-1 text-[#2E2F32] font-medium" htmlFor={`gender-${i}`}>
                      Gender:
                    </label>
                    <Select
                      id={`gender-${i}`}
                      styles={customStyles}
                      options={[
                        { value: '', label: 'Select option' },
                        { value: 'Both', label: 'Both' },
                        { value: 'Male', label: 'Male' },
                        { value: 'Female', label: 'Female' },
                      ]}
                      value={filter.gender ? { value: filter.gender, label: filter.gender } : null}
                      onChange={e => updateFilter(i, 'gender', e?.value || '')}
                      isSearchable={true}
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-[#2E2F32] font-medium" htmlFor={`role-${i}`}>
                      Role:
                    </label>
                    <Select
                      id={`role-${i}`}
                      styles={customStyles}
                      options={[
                        { value: '', label: 'Select option' },
                        { value: 'Student', label: 'Student' },
                        { value: 'Lecturer', label: 'Lecturer' },
                      ]}
                      value={filter.role ? { value: filter.role, label: filter.role } : null}
                      onChange={e => updateFilter(i, 'role', e?.value || '')}
                      isSearchable={true}
                      required
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-2">
                    <label className="block mb-1 text-[#2E2F32] font-medium" htmlFor={`filter-by-${i}`}>
                      Filter by:
                    </label>
                    <Select
                      id={`filter-by-${i}`}
                      styles={customStyles}
                      options={[
                        { value: '', label: 'Select option' },
                        ...Object.keys(filterOptions).map(opt => ({ value: opt, label: opt })),
                      ]}
                      value={filter.type ? { value: filter.type, label: filter.type } : null}
                      onChange={e => updateFilter(i, 'type', e?.value || '')}
                      isSearchable={true}
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block mb-1 text-[#2E2F32] font-medium" htmlFor={`option-${i}`}>
                      Option:
                    </label>
                    <Select
                      id={`option-${i}`}
                      styles={customStyles}
                      options={[
                        { value: '', label: 'Select option' },
                        ...(filter.type ? filterOptions[filter.type].map(opt => ({ value: opt, label: opt })) : []),
                      ]}
                      value={filter.option ? { value: filter.option, label: filter.option } : null}
                      onChange={e => updateFilter(i, 'option', e?.value || '')}
                      isSearchable={true}
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block mb-1 text-[#2E2F32] font-medium" htmlFor={`level-${i}`}>
                      Level:
                    </label>
                    <Select
                      id={`level-${i}`}
                      styles={customStyles}
                      options={[
                        { value: '', label: 'Select option' },
                        ...(filter.option ? getLevels(filter.option).map(level => ({ value: level, label: level })) : []),
                      ]}
                      value={filter.level ? filter.level.map(level => ({ value: level, label: level })) : []}
                      onChange={e => {
                        const selected = e.map(option => option.value);
                        updateFilter(i, 'level', selected);
                      }}
                      isMulti
                      isSearchable={true}
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(i)}
                    className="text-[#2E2F32] text-lg self-end mb-2 float-right"
                  >
                    <IoClose />
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAdd}
              className="flex items-center gap-1 text-[#B3935E] text-sm mt-2"
            >
              Add filter <img src="/plus.svg" className="w-4 h-4" alt="add" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}