'use client';
import React, { useState } from 'react';
import Select from 'react-select';

const options = {
  institution: [
    { value: 'Covenant University', label: 'Covenant University' },
    { value: 'Other University', label: 'Other University' }
  ],
  gender: [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' }
  ],
  role: [
    { value: 'Student', label: 'Student' },
    { value: 'Lecturer', label: 'Lecturer' }
  ],
  college: [
    { value: 'CST', label: 'CST' },
    { value: 'CMSS', label: 'CMSS' },
    { value: 'COE', label: 'COE' },
    { value: 'CLDS', label: 'CLDS' }
  ],
  level: [
    { value: '100', label: '100' },
    { value: '200', label: '200' },
    { value: '300', label: '300' },
    { value: '400', label: '400' },
    { value: '500', label: '500' }
  ]
};

import type { StylesConfig } from 'react-select';

import type { CSSObject } from '@emotion/react';

const customStyles: StylesConfig<OptionType, true> = {
  control: (provided: CSSObject) => ({
    ...provided,
    minHeight: '40px',
    borderColor: '#E7DFC6',
    boxShadow: 'none',
    '&:hover': { borderColor: '#B3935E' }
  }),
  multiValue: (provided: CSSObject) => ({
    ...provided,
    backgroundColor: '#B3935E',
    color: 'white'
  }),
  multiValueLabel: (provided: CSSObject) => ({
    ...provided,
    color: 'white'
  }),
  multiValueRemove: (provided: CSSObject) => ({
    ...provided,
    color: 'white',
    ':hover': {
      backgroundColor: '#8d734c',
      color: 'white'
    }
  })
};

type OptionType = { value: string; label: string };

const MultiSelectForm = () => {
  const [institution, setInstitution] = useState<readonly OptionType[]>([]);
  const [gender, setGender] = useState<readonly OptionType[]>([]);
  const [role, setRole] = useState<readonly OptionType[]>([]);
  const [college, setCollege] = useState<readonly OptionType[]>([]);
  const [level, setLevel] = useState<readonly OptionType[]>([]);

  return (
    <div className="w-full md:w-1/2 bg-white shadow-md rounded-xl border border-[#E7DFC6] p-6 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#B3935E] scrollbar-track-transparent scrollbar-thumb-rounded-full">
      <div className="mb-4">
        <label className="block mb-1">Institution:</label>
        <Select
          isMulti
          options={options.institution}
          value={institution}
          onChange={setInstitution}
          styles={customStyles}
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Gender:</label>
        <Select
          isMulti
          options={options.gender}
          value={gender}
          onChange={setGender}
          styles={customStyles}
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Role:</label>
        <Select
          isMulti
          options={options.role}
          value={role}
          onChange={setRole}
          styles={customStyles}
        />
      </div>
      <div className='flex'>
        <label className="block mb-2">Filter respondents by:</label>
        <div className="flex gap-4 mt-[-10px]">
          {['College', 'Department', 'Course'].map((option) => (
            <label key={option} className="flex items-center cursor-pointer select-none">
              <div className="relative inline-block w-5 h-5">
  <input
    type="checkbox"
    className="peer appearance-none w-5 h-5 border border-[#B3935E] rounded-md checked:bg-[#B3935E] checked:border-[#B3935E] focus:outline-none transition-colors"
    style={{
      WebkitAppearance: 'none',
      MozAppearance: 'none',
      appearance: 'none',
    }}
  />
  <svg
    className="absolute top-0 left-0 w-5 h-5 pointer-events-none opacity-0 peer-checked:opacity-100"
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
</div>

              <span className="ml-2">{option}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block mb-1">College:</label>
        <Select
          isMulti
          options={options.college}
          value={college}
          onChange={setCollege}
          styles={customStyles}
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Level:</label>
        <Select
          isMulti
          options={options.level}
          value={level}
          onChange={setLevel}
          styles={customStyles}
        />
      </div>
    </div>
  );
};

export default MultiSelectForm;
