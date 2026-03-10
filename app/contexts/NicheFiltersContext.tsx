'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, School, College, Department, Course, Gender, PersonType } from '../services/api';

export interface NicheFilter {
  schoolId?: string;
  collegeId?: string;
  departmentId?: string;
  courseId?: string;
  gender?: number;
  personType?: number;
}

interface NicheFiltersContextType {
  // Data
  schools: School[];
  colleges: College[];
  departments: Department[];
  courses: Course[];
  genders: Gender[];
  personTypes: PersonType[];
  
  // Loading states
  loadingSchools: boolean;
  loadingColleges: boolean;
  loadingDepartments: boolean;
  loadingCourses: boolean;
  loadingEnums: boolean;
  
  // Selected values
  selectedFilters: NicheFilter[];
  
  // Actions
  loadSchools: () => Promise<void>;
  loadCollegesBySchool: (schoolId: string) => Promise<void>;
  loadDepartmentsByCollege: (collegeId: string) => Promise<void>;
  loadCoursesByDepartment: (departmentId: string) => Promise<void>;
  loadEnums: () => Promise<void>;
  
  // Filter management
  setSelectedFilters: (filters: NicheFilter[]) => void;
  updateFilter: (index: number, filter: NicheFilter) => void;
  addFilter: () => void;
  removeFilter: (index: number) => void;
  resetFilters: () => void;
}

const NicheFiltersContext = createContext<NicheFiltersContextType | undefined>(undefined);

export const useNicheFilters = () => {
  const context = useContext(NicheFiltersContext);
  if (context === undefined) {
    throw new Error('useNicheFilters must be used within a NicheFiltersProvider');
  }
  return context;
};

interface NicheFiltersProviderProps {
  children: ReactNode;
}

export const NicheFiltersProvider: React.FC<NicheFiltersProviderProps> = ({ children }) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [genders, setGenders] = useState<Gender[]>([]);
  const [personTypes, setPersonTypes] = useState<PersonType[]>([]);
  
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [loadingColleges, setLoadingColleges] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingEnums, setLoadingEnums] = useState(false);
  
  const [selectedFilters, setSelectedFilters] = useState<NicheFilter[]>([{}]);

  // Load schools on mount
  useEffect(() => {
    loadSchools();
    loadEnums();
  }, []);

  const loadSchools = async () => {
    try {
      setLoadingSchools(true);
      const data = await apiService.getSchools();
      setSchools(data || []);
    } catch (error) {
      console.error('Error loading schools:', error);
      setSchools([]);
    } finally {
      setLoadingSchools(false);
    }
  };

  const loadCollegesBySchool = async (schoolId: string) => {
    if (!schoolId) {
      setColleges([]);
      return;
    }
    
    try {
      setLoadingColleges(true);
      const data = await apiService.getCollegesBySchool(schoolId);
      setColleges(data || []);
    } catch (error) {
      console.error('Error loading colleges:', error);
      setColleges([]);
    } finally {
      setLoadingColleges(false);
    }
  };

  const loadDepartmentsByCollege = async (collegeId: string) => {
    if (!collegeId) {
      setDepartments([]);
      return;
    }
    
    try {
      setLoadingDepartments(true);
      const data = await apiService.getDepartmentsByCollege(collegeId);
      setDepartments(data || []);
    } catch (error) {
      console.error('Error loading departments:', error);
      setDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const loadCoursesByDepartment = async (departmentId: string) => {
    if (!departmentId) {
      setCourses([]);
      return;
    }
    
    try {
      setLoadingCourses(true);
      const data = await apiService.getCoursesByDepartment(departmentId);
      setCourses(data || []);
    } catch (error) {
      console.error('Error loading courses:', error);
      setCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  const loadEnums = async () => {
    try {
      setLoadingEnums(true);
      const [gendersData, personTypesData] = await Promise.all([
        apiService.getGenders(),
        apiService.getPersonTypes(),
      ]);
      setGenders(gendersData || []);
      setPersonTypes(personTypesData || []);
    } catch (error) {
      console.error('Error loading enums:', error);
      setGenders([]);
      setPersonTypes([]);
    } finally {
      setLoadingEnums(false);
    }
  };

  const updateFilter = (index: number, filter: NicheFilter) => {
    const newFilters = [...selectedFilters];
    newFilters[index] = filter;
    setSelectedFilters(newFilters);
  };

  const addFilter = () => {
    setSelectedFilters([...selectedFilters, {}]);
  };

  const removeFilter = (index: number) => {
    setSelectedFilters(selectedFilters.filter((_, i) => i !== index));
  };

  const resetFilters = () => {
    setSelectedFilters([{}]);
  };

  const value: NicheFiltersContextType = {
    schools,
    colleges,
    departments,
    courses,
    genders,
    personTypes,
    loadingSchools,
    loadingColleges,
    loadingDepartments,
    loadingCourses,
    loadingEnums,
    selectedFilters,
    loadSchools,
    loadCollegesBySchool,
    loadDepartmentsByCollege,
    loadCoursesByDepartment,
    loadEnums,
    setSelectedFilters,
    updateFilter,
    addFilter,
    removeFilter,
    resetFilters,
  };

  return (
    <NicheFiltersContext.Provider value={value}>
      {children}
    </NicheFiltersContext.Provider>
  );
};
