'use client';
import React, { useState, useEffect } from 'react';
import { apiService, School, College, Department, Course } from './services/api';

const CollegeFilter = () => {
  const [selected, setSelected] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [selectedCollege, setSelectedCollege] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [filterType, setFilterType] = useState<'school' | 'college' | 'department' | 'course'>('college');

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load colleges when school changes
  useEffect(() => {
    if (selectedSchool) {
      loadCollegesBySchool(selectedSchool);
      setSelectedCollege('');
      setSelectedDepartment('');
      setColleges([]);
      setDepartments([]);
      setCourses([]);
    }
  }, [selectedSchool]);

  // Load departments when college changes
  useEffect(() => {
    if (selectedCollege) {
      loadDepartmentsByCollege(selectedCollege);
      setSelectedDepartment('');
      setDepartments([]);
      setCourses([]);
    }
  }, [selectedCollege]);

  // Load courses when department changes
  useEffect(() => {
    if (selectedDepartment) {
      loadCoursesByDepartment(selectedDepartment);
      setCourses([]);
    }
  }, [selectedDepartment]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [schoolsData, collegesData] = await Promise.all([
        apiService.getSchools(),
        apiService.getCollegesBySchool('') // Load all colleges initially
      ]);
      setSchools(schoolsData);
      setColleges(collegesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadCollegesBySchool = async (schoolId: string) => {
    try {
      const collegesData = await apiService.getCollegesBySchool(schoolId);
      setColleges(collegesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load colleges');
    }
  };

  const loadDepartmentsByCollege = async (collegeId: string) => {
    try {
      const departmentsData = await apiService.getDepartmentsByCollege(collegeId);
      setDepartments(departmentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load departments');
    }
  };

  const loadCoursesByDepartment = async (departmentId: string) => {
    try {
      const coursesData = await apiService.getCoursesByDepartment(departmentId);
      setCourses(coursesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load courses');
    }
  };

  const getCurrentOptions = () => {
    switch (filterType) {
      case 'school':
        return schools;
      case 'college':
        return colleges;
      case 'department':
        return departments;
      case 'course':
        return courses;
      default:
        return colleges;
    }
  };

  const filteredOptions = getCurrentOptions().filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelect = (optionId: string) => {
    if (selected.includes(optionId)) {
      setSelected(selected.filter(item => item !== optionId));
    } else {
      setSelected([...selected, optionId]);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelected([]);
    } else {
      setSelected(filteredOptions.map(option => option.id));
    }
    setSelectAll(!selectAll);
  };

  const getFilterTypeLabel = () => {
    switch (filterType) {
      case 'school': return 'School';
      case 'college': return 'College';
      case 'department': return 'Department';
      case 'course': return 'Course';
      default: return 'College';
    }
  };

  if (loading) {
    return (
      <div className="w-full h-fit md:w-1/3 bg-white border border-[#E7DFC6] rounded-xl shadow-md p-4">
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-[#B3935E] border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-sm text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-fit md:w-1/3 bg-white border border-[#E7DFC6] rounded-xl shadow-md p-4">
        <div className="text-center text-red-600 text-sm">
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
            <p>{error}</p>
          </div>
          <button 
            onClick={loadInitialData}
            className="mt-2 text-[#B3935E] hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-fit md:w-1/3 bg-white border border-[#E7DFC6] rounded-xl shadow-md p-4">
      <h2 className="text-sm font-medium mb-2">
        Options: <span className="font-bold">{getFilterTypeLabel()}</span>
      </h2>

      {/* Filter Type Selector */}
      <div className="mb-3">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="w-full px-2 py-1 text-xs border border-[#E7DFC6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#B3935E]"
        >
          <option value="school">School</option>
          <option value="college">College</option>
          <option value="department">Department</option>
          <option value="course">Course</option>
        </select>
      </div>

      {/* School Selector (for filtering colleges) */}
      {filterType === 'college' && (
        <div className="mb-3">
          <select
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            className="w-full px-2 py-1 text-xs border border-[#E7DFC6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#B3935E]"
          >
            <option value="">All Schools</option>
            {schools.map(school => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* College Selector (for filtering departments) */}
      {filterType === 'department' && (
        <div className="mb-3">
          <select
            value={selectedCollege}
            onChange={(e) => setSelectedCollege(e.target.value)}
            className="w-full px-2 py-1 text-xs border border-[#E7DFC6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#B3935E]"
          >
            <option value="">Select College</option>
            {colleges.map(college => (
              <option key={college.id} value={college.id}>
                {college.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Department Selector (for filtering courses) */}
      {filterType === 'course' && (
        <div className="mb-3">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full px-2 py-1 text-xs border border-[#E7DFC6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#B3935E]"
          >
            <option value="">Select Department</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      )}

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
              key={option.id}
              onClick={() => toggleSelect(option.id)}
              className={`w-full text-left px-4 py-2 rounded-lg border transition-colors ${
                selected.includes(option.id)
                  ? 'bg-[#B3935E] text-white border-[#B3935E]'
                  : 'bg-[#F2F2F2] text-black border-transparent hover:border-[#B3935E]'
              }`}
            >
              {option.name}
            </button>
          ))
        ) : (
          <p className="text-sm text-gray-500">
            {filteredOptions.length === 0 && getCurrentOptions().length === 0 
              ? `No ${getFilterTypeLabel().toLowerCase()}s available`
              : 'No results found.'}
          </p>
        )}
      </div>

      {/* Selected Count */}
      {selected.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            {selected.length} {getFilterTypeLabel().toLowerCase()}{selected.length !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}
    </div>
  );
};

export default CollegeFilter;
