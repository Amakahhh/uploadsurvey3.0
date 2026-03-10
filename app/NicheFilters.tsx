'use client';
import React, { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import Select from 'react-select';
import { useNicheFilters } from './contexts/NicheFiltersContext';

const customStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    borderColor: state.isFocused ? '#B3935E' : '#E5E7EB',
    boxShadow: state.isFocused ? '0 0 0 2px #B3935E33' : 'none',
    borderRadius: '5px',
    minHeight: '40px',
    backgroundColor: '#fff',
    '&:hover': {
      borderColor: '#B3935E',
      backgroundColor: '#F5F5F5',
    },
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? '#F5E9D6'
      : state.isFocused
      ? '#F5F5F5'
      : '#fff',
    color: '#2E2F32',
    cursor: 'pointer',
    borderRadius: '0px',
    padding: '10px 16px',
  }),
  menu: (provided: any) => ({
    ...provided,
    borderRadius: '5px',
    marginTop: 2,
    boxShadow: '0 2px 8px 0 #B3935E22',
    border: '1px solid #B3935E',
    backgroundColor: '#fff',
    zIndex: 20,
  }),
  input: (provided: any) => ({
    ...provided,
    color: '#2E2F32',
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: '#2E2F32',
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: '#B3935E',
    fontWeight: 400,
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  dropdownIndicator: (provided: any, state: any) => ({
    ...provided,
    color: '#B3935E',
    '&:hover': {
      color: '#B3935E',
    },
  }),
};

export interface NicheFilter {
  schoolId?: string;
  collegeId?: string;
  departmentId?: string;
  courseId?: string;
  gender?: number;
  personType?: number;
}

interface NicheFiltersProps {
  onFiltersChange?: (filters: NicheFilter[]) => void;
}

export default function NicheFiltersNew({ onFiltersChange }: NicheFiltersProps) {
  const {
    schools,
    colleges,
    departments,
    courses,
    genders,
    personTypes,
    selectedFilters,
    loadingSchools,
    loadingColleges,
    loadingDepartments,
    loadingCourses,
    loadingEnums,
    loadCollegesBySchool,
    loadDepartmentsByCollege,
    loadCoursesByDepartment,
    updateFilter,
    addFilter,
    removeFilter,
    resetFilters,
  } = useNicheFilters();

  const [useFilters, setUseFilters] = useState(false);

  // Update parent when filters change
  useEffect(() => {
    onFiltersChange?.(selectedFilters);
  }, [selectedFilters, onFiltersChange]);

  // Handle school selection to load colleges
  const handleSchoolChange = async (index: number, schoolId: string) => {
    const newFilter = { ...selectedFilters[index], schoolId: schoolId || '' };
    
    // Reset dependent fields
    newFilter.collegeId = '';
    newFilter.departmentId = '';
    newFilter.courseId = '';
    
    updateFilter(index, newFilter);
    
    if (schoolId) {
      await loadCollegesBySchool(schoolId);
    }
  };

  // Handle college selection to load departments
  const handleCollegeChange = async (index: number, collegeId: string) => {
    const newFilter = { ...selectedFilters[index], collegeId: collegeId || '' };
    
    // Reset dependent fields
    newFilter.departmentId = '';
    newFilter.courseId = '';
    
    updateFilter(index, newFilter);
    
    if (collegeId) {
      await loadDepartmentsByCollege(collegeId);
    }
  };

  // Handle department selection to load courses
  const handleDepartmentChange = async (index: number, departmentId: string) => {
    const newFilter = { ...selectedFilters[index], departmentId: departmentId || '' };
    
    // Reset course field
    newFilter.courseId = '';
    
    updateFilter(index, newFilter);
    
    if (departmentId) {
      await loadCoursesByDepartment(departmentId);
    }
  };

  const handleToggleFilters = () => {
    setUseFilters(!useFilters);
    if (!useFilters) {
      // When turning off filters, reset
      resetFilters();
    }
  };

  return (
    <div className="mt-4 w-full px-4 mx-auto max-w-3xl">
      <div className="bg-white border border-[#B3935E] p-6 rounded-xl text-sm mb-4 mt-4 w-full">
        {/* Switch Row */}
        <div className="flex items-center gap-4 mb-4">
          <label className="text-[#2E2F32] font-medium">Niche selection:</label>
          <span className={!useFilters ? "text-[#B3935E] font-semibold" : "text-gray-400"}>
            Everyone on SurveyHustler
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={useFilters}
              onChange={handleToggleFilters}
              className="sr-only peer"
            />
            <div
              className={`w-11 h-6 rounded-full transition-all duration-200 ${
                useFilters ? "bg-[#B3935E]" : "bg-gray-200"
              } peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#B3935E]`}
            >
            </div>
            <div
              className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all duration-200 ${
                useFilters ? "translate-x-5" : ""
              }`}
            ></div>
          </label>
          <span className={useFilters ? "text-[#B3935E] font-semibold" : "text-gray-400"}>
            Apply filter
          </span>
        </div>

        {/* Only show filters if switch is ON */}
        {useFilters && (
          <>
            {selectedFilters.map((filter, i) => {
              // Get available options for this filter based on selection
              const availableColleges = filter.schoolId
                ? colleges.filter((c) => c.schoolId === filter.schoolId)
                : [];
              
              const availableDepartments = filter.collegeId
                ? departments.filter((d) => d.collegeId === filter.collegeId)
                : [];
              
              const availableCourses = filter.departmentId
                ? courses.filter((c) => c.departmentId === filter.departmentId)
                : [];

              return (
                <div
                  key={i}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start mb-4 w-full rounded-lg bg-[#B3935E1A] p-3"
                >
                  <div>
                    <span className="inline-block text-[#2E2F3266] text-lg px-3 py-0 rounded mb-2">
                      FILTER {i + 1}
                    </span>
                    
                    <div className="mb-2">
                      <label className="block mb-1 text-[#2E2F32] font-medium">
                        Institution:
                      </label>
                      <Select
                        styles={customStyles}
                        isLoading={loadingSchools}
                        options={[
                          { value: '', label: 'Select option' },
                          ...schools.map((s) => ({ value: s.id, label: s.name })),
                        ]}
                        value={
                          filter.schoolId
                            ? {
                                value: filter.schoolId,
                                label:
                                  schools.find((s) => s.id === filter.schoolId)?.name ||
                                  'Select option',
                              }
                            : null
                        }
                        onChange={(e) => handleSchoolChange(i, e?.value || '')}
                        isSearchable={true}
                      />
                    </div>

                    <div className="mb-2">
                      <label className="block mb-1 text-[#2E2F32] font-medium">
                        Gender:
                      </label>
                      <Select
                        styles={customStyles}
                        isLoading={loadingEnums}
                        options={[
                          { value: '', label: 'Select option' },
                          ...genders.map((g) => ({ value: String(g.id), label: g.name })),
                        ]}
                        value={
                          filter.gender
                            ? {
                                value: String(filter.gender),
                                label:
                                  genders.find((g) => g.id === filter.gender)?.name ||
                                  'Select option',
                              }
                            : null
                        }
                        onChange={(e) =>
                          updateFilter(i, { ...filter, gender: e?.value ? Number(e.value) : undefined })
                        }
                        isSearchable={true}
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-[#2E2F32] font-medium">
                        Role (Person Type):
                      </label>
                      <Select
                        styles={customStyles}
                        isLoading={loadingEnums}
                        options={[
                          { value: '', label: 'Select option' },
                          ...personTypes.map((p) => ({ value: String(p.id), label: p.name })),
                        ]}
                        value={
                          filter.personType
                            ? {
                                value: String(filter.personType),
                                label:
                                  personTypes.find((p) => p.id === filter.personType)?.name ||
                                  'Select option',
                              }
                            : null
                        }
                        onChange={(e) =>
                          updateFilter(i, { ...filter, personType: e?.value ? Number(e.value) : undefined })
                        }
                        isSearchable={true}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2">
                      <label className="block mb-1 text-[#2E2F32] font-medium">
                        College:
                      </label>
                      <Select
                        styles={customStyles}
                        isLoading={loadingColleges}
                        isDisabled={!filter.schoolId}
                        options={[
                          { value: '', label: 'Select option' },
                          ...availableColleges.map((c) => ({
                            value: c.id,
                            label: c.name,
                          })),
                        ]}
                        value={
                          filter.collegeId
                            ? {
                                value: filter.collegeId,
                                label:
                                  availableColleges.find((c) => c.id === filter.collegeId)
                                    ?.name || 'Select option',
                              }
                            : null
                        }
                        onChange={(e) => handleCollegeChange(i, e?.value || '')}
                        isSearchable={true}
                      />
                    </div>

                    <div className="mb-2">
                      <label className="block mb-1 text-[#2E2F32] font-medium">
                        Department:
                      </label>
                      <Select
                        styles={customStyles}
                        isLoading={loadingDepartments}
                        isDisabled={!filter.collegeId}
                        options={[
                          { value: '', label: 'Select option' },
                          ...availableDepartments.map((d) => ({
                            value: d.id,
                            label: d.name,
                          })),
                        ]}
                        value={
                          filter.departmentId
                            ? {
                                value: filter.departmentId,
                                label:
                                  availableDepartments.find((d) => d.id === filter.departmentId)
                                    ?.name || 'Select option',
                              }
                            : null
                        }
                        onChange={(e) => handleDepartmentChange(i, e?.value || '')}
                        isSearchable={true}
                      />
                    </div>

                    <div className="mb-2">
                      <label className="block mb-1 text-[#2E2F32] font-medium">
                        Course:
                      </label>
                      <Select
                        styles={customStyles}
                        isLoading={loadingCourses}
                        isDisabled={!filter.departmentId}
                        options={[
                          { value: '', label: 'Select option' },
                          ...availableCourses.map((c) => ({
                            value: c.id,
                            label: c.name,
                          })),
                        ]}
                        value={
                          filter.courseId
                            ? {
                                value: filter.courseId,
                                label:
                                  availableCourses.find((c) => c.id === filter.courseId)?.name ||
                                  'Select option',
                              }
                            : null
                        }
                        onChange={(e) =>
                          updateFilter(i, { ...filter, courseId: e?.value || '' })
                        }
                        isSearchable={true}
                      />
                    </div>

                    {selectedFilters.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFilter(i)}
                        className="text-[#2E2F32] text-lg self-end mb-2 float-right hover:text-red-500"
                      >
                        <IoClose />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              onClick={addFilter}
              className="flex items-center gap-1 text-[#B3935E] text-sm mt-2 hover:text-[#A08549]"
            >
              Add filter +
            </button>
          </>
        )}
      </div>
    </div>
  );
}
