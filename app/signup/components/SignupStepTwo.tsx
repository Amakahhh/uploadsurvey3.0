'use client';

import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';

type Props = {
  onNext?: () => void;
  onBack?: () => void;
  setProgress?: (p: number) => void;
};

export default function SignupStepTwo({ onNext, onBack, setProgress }: Props) {
  const [institution, setInstitution] = useState('');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('');
  const [course, setCourse] = useState('');
  const [level, setLevel] = useState('');

  const [schoolOptions, setSchoolOptions] = useState<{ id: string; name: string }[]>([]);
  const [collegeOptions, setCollegeOptions] = useState<{ id: string; name: string }[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<{ id: string; name: string }[]>([]);
  const [courseOptions, setCourseOptions] = useState<{ id: string; name: string }[]>([]);

  const levelOptions = ['100', '200', '300', '400', '500'];

  const HARDCODED_INSTITUTIONS = [
    "Covenant University",
    "Babcock University",
    "Afe Babalola University (ABUAD)",
    "Redeemer's University",
    "Landmark University",
    "Bells University of Technology",
    "University of Lagos (UNILAG)",
    "University of Ibadan",
    "University of Benin",
    "University of Nigeria"
  ];

  const HARDCODED_COLLEGES = [
    "CST (College of Science and Technology)",
    "COE (College of Engineering)",
    "CMSS (College of Management and Social Studies)",
    "CLDS (College of Leadership and Development Studies)"
  ];

  const HARDCODED_DEPARTMENTS: Record<string, string[]> = {
    "CST (College of Science and Technology)": ["Computer Science", "Biological Sciences", "Chemistry", "Physics", "Mathematics"],
    "COE (College of Engineering)": ["Mechanical Engineering", "Civil Engineering", "Electrical Engineering", "Chemical Engineering", "Petroleum Engineering"],
    "CMSS (College of Management and Social Studies)": ["Business Administration", "Economics", "Accounting", "Mass Communication", "Sociology"],
    "CLDS (College of Leadership and Development Studies)": ["Political Science", "International Relations", "Languages", "Psychology"]
  };

  const HARDCODED_COURSES: Record<string, string[]> = {
    "Computer Science": ["BSc. Computer Science", "BSc. Management Information Systems"],
    "Biological Sciences": ["BSc. Biology", "BSc. Biochemistry", "BSc. Microbiology"],
    "Chemistry": ["BSc. Industrial Chemistry", "BSc. Pure Chemistry"],
    "Physics": ["BSc. Industrial Physics"],
    "Mathematics": ["BSc. Mathematics"],
    "Mechanical Engineering": ["BEng. Mechanical Engineering"],
    "Civil Engineering": ["BEng. Civil Engineering"],
    "Electrical Engineering": ["BEng. Electrical & Electronics Engineering", "BEng. Info & Comm Engineering"],
    "Chemical Engineering": ["BEng. Chemical Engineering"],
    "Petroleum Engineering": ["BEng. Petroleum Engineering"],
    "Business Administration": ["BSc. Business Administration", "BSc. Marketing"],
    "Economics": ["BSc. Economics"],
    "Accounting": ["BSc. Accounting", "BSc. Banking and Finance"],
    "Mass Communication": ["BSc. Mass Communication"],
    "Sociology": ["BSc. Sociology"],
    "Political Science": ["BSc. Political Science"],
    "International Relations": ["BSc. International Relations"],
    "Languages": ["B.A. English"],
    "Psychology": ["BSc. Psychology"]
  };

  // Initialize schools
  useEffect(() => {
    setSchoolOptions(HARDCODED_INSTITUTIONS.map(name => ({ id: name, name })));
  }, []);

  // Update colleges when institution changes
  useEffect(() => {
    if (institution) {
      setCollegeOptions(HARDCODED_COLLEGES.map(name => ({ id: name, name })));
      setCollege(''); setDepartment(''); setCourse('');
      setDepartmentOptions([]); setCourseOptions([]);
    } else {
      setCollegeOptions([]); setCollege(''); setDepartment(''); setCourse('');
    }
  }, [institution]);

  // Update departments when college changes
  useEffect(() => {
    if (college && HARDCODED_DEPARTMENTS[college]) {
      setDepartmentOptions(HARDCODED_DEPARTMENTS[college].map(name => ({ id: name, name })));
      setDepartment(''); setCourse(''); setCourseOptions([]);
    } else {
      setDepartmentOptions([]); setDepartment(''); setCourse('');
    }
  }, [college]);

  // Update courses when department changes
  useEffect(() => {
    if (department && HARDCODED_COURSES[department]) {
      setCourseOptions(HARDCODED_COURSES[department].map(name => ({ id: name, name })));
      setCourse('');
    } else {
      // Fallback if course not detailed specifically in dictionary
      if (department) {
        setCourseOptions([{ id: `BSc. ${department}`, name: `BSc. ${department}`}]);
      } else {
        setCourseOptions([]); 
      }
      setCourse('');
    }
  }, [department]);

  // Update progress
  useEffect(() => {
    const total = 5;
    const filled = [institution, college, department, course, level].filter(Boolean).length;
    setProgress?.(filled / total);
  }, [institution, college, department, course, level, setProgress]);

  const isFormValid = () => !!institution && !!college && !!department && !!course && !!level;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext?.();
  };

  return (
    <div className="w-full h-full overflow-y-auto flex justify-center pt-2 pb-20 md:pt-8 md:pb-12">
      <div className="w-full max-w-[560px] px-4 md:px-0">
        <h1 className="text-xl md:text-2xl font-extrabold mb-6 text-[#B3935E]">Almost there...</h1>

        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          <div>
            <label className="text-black text-sm md:text-base block mb-1">Name of Institution:</label>
            <select className="border border-[#0c0b09] text-black rounded w-full py-2 px-3 bg-white" value={institution} onChange={(e) => setInstitution(e.target.value)}>
              <option value="">Select institution</option>
              {schoolOptions.map((school) => (<option key={school.id} value={school.id}>{school.name}</option>))}
            </select>
          </div>

          <div>
            <label className="text-black text-sm md:text-base block mb-1">College:</label>
            <select className="border border-[#0c0b09] text-black rounded w-full py-2 px-3 bg-white" value={college} onChange={(e) => setCollege(e.target.value)} disabled={!institution}>
              <option value="">Select College</option>
              {collegeOptions.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>

          <div>
            <label className="text-black text-sm md:text-base block mb-1">Department:</label>
            <select className="border border-[#0c0b09] text-black rounded w-full py-2 px-3 bg-white" value={department} onChange={(e) => setDepartment(e.target.value)} disabled={!college}>
              <option value="">Select Department</option>
              {departmentOptions.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
            </select>
          </div>

          <div>
            <label className="text-black text-sm md:text-base block mb-1">Course:</label>
            <select className="border border-[#0c0b09] text-black rounded w-full py-2 px-3 bg-white" value={course} onChange={(e) => setCourse(e.target.value)} disabled={!department}>
              <option value="">Select Course</option>
              {courseOptions.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>

          <div>
            <label className="text-black text-sm md:text-base block mb-1">Level:</label>
            <select className="border border-[#0c0b09] text-black rounded w-full py-2 px-3 bg-white" value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value="">Select Level</option>
              {levelOptions.map((l) => (<option key={l} value={l}>{l} Level</option>))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" onClick={() => onBack?.()} className="border border-[#0c0b09] text-black py-2 px-4 rounded flex-1 hover:bg-gray-50 transition-colors">Back</button>
            <button type="submit" disabled={!isFormValid()} className={`bg-[#B3935E] text-white py-2 px-4 rounded flex-1 ${!isFormValid() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#9B7D4E] transition-colors'}`}>Next</button>
          </div>
        </form>
      </div>
    </div>
  );
}
