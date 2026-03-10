'use client';

import { useEffect, useRef, useState } from 'react';
import countryData, { type CountryData } from 'country-telephone-data';
import 'flag-icons/css/flag-icons.min.css';
import { createPortal } from 'react-dom';

type PasswordStrength = 'empty' | 'too_short' | 'weak' | 'medium' | 'strong';

function evaluatePassword(pwd: string): {
  strength: PasswordStrength;
  segmentsFilled: number;
  label: string;
  colorText: string;
  colorBar: string;
  colorBorder: string;
} {
  if (!pwd) return { strength: 'empty', segmentsFilled: 0, label: '', colorText: 'text-gray-500', colorBar: 'bg-gray-300', colorBorder: 'border-[#0c0b09]' };
  if (pwd.length < 8) return { strength: 'too_short', segmentsFilled: 1, label: 'Too short!', colorText: 'text-red-600', colorBar: 'bg-red-500', colorBorder: 'border-red-500' };
  let score = 0;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^a-zA-Z0-9\s]/.test(pwd)) score++;
  if (score <= 1) return { strength: 'weak', segmentsFilled: 1, label: 'Weak', colorText: 'text-red-600', colorBar: 'bg-red-500', colorBorder: 'border-red-500' };
  if (score <= 2) return { strength: 'medium', segmentsFilled: 3, label: 'Almost there', colorText: 'text-yellow-600', colorBar: 'bg-yellow-500', colorBorder: 'border-yellow-500' };
  return { strength: 'strong', segmentsFilled: 4, label: 'Strong', colorText: 'text-green-700', colorBar: 'bg-green-600', colorBorder: 'border-green-600' };
}

type Props = {
  email: string;
  setEmail: (value: string) => void;
  onNext: () => void;
  setProgress: (value: number) => void;
  firstName: string;
  setFirstName: (value: string) => void;
  onAccountData: (payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => void;
};

export default function SignupStepOne({ email, setEmail, onNext, setProgress, firstName, setFirstName, onAccountData }: Props) {
  const [lastName, setLastName] = useState('');
  const [telegramNumber, setTelegramNumber] = useState('');
  const [gender, setGender] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordValidationErrors, setPasswordValidationErrors] = useState<string[]>([]);
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [telegramNumberError, setTelegramNumberError] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryData | undefined>(
    countryData.allCountries.find((c: CountryData) => c.iso2 === 'ng')
  );
  const [showCountryList, setShowCountryList] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const genderDropdownRef = useRef<HTMLDivElement>(null);
  const genderButtonWrapperRef = useRef<HTMLDivElement>(null);
  const genderMenuContainerRef = useRef<HTMLDivElement>(null);
  const [showGenderList, setShowGenderList] = useState(false);
  const [genderMenuPos, setGenderMenuPos] = useState<{left:number; top:number; width:number}>({left:0, top:0, width:0});

  const genderOptions = [
    { name: 'Male', value: 1 },
    { name: 'Female', value: 2 },
  ];

  const passwordMeta = evaluatePassword(password);

  const validatePassword = (pwd: string) => {
    const errors: string[] = [];
    if (pwd.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(pwd)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(pwd)) errors.push('One lowercase letter');
    if (!/[0-9]/.test(pwd)) errors.push('One number');
    return errors;
  };

  const isFormValid = () => {
    return !!firstName && !!lastName && !!email && !!telegramNumber && !telegramNumberError && !!gender && !!password && !!confirmPassword && password === confirmPassword && passwordValidationErrors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordValidationErrors(validatePassword(password));
    if (isFormValid()) {
      onAccountData({
        firstName,
        lastName,
        email,
        password,
      });
      onNext?.();
    }
  };

  const expectedLengthsByIso2: Record<string, number> = {
    ng: 10, gh: 9, ke: 9, za: 9, us: 10, gb: 10, ca: 10,
  };

  const getExpectedLength = (): number | undefined => expectedLengthsByIso2[selectedCountry?.iso2?.toLowerCase() || ''];

  const handleNumberChange = (value: string) => {
    const onlyNumbers = value.replace(/\D/g, '');
    const expected = getExpectedLength();
    const trimmed = onlyNumbers.slice(0, expected ?? 15);
    setTelegramNumber(trimmed);
    if (expected !== undefined) {
      setTelegramNumberError(trimmed.length > 0 && trimmed.length !== expected ? `Expected ${expected} digits` : '');
    } else {
      setTelegramNumberError('');
    }
  };

  useEffect(() => { if (passwordTouched) setPasswordValidationErrors(validatePassword(password)); }, [password, passwordTouched]);
  useEffect(() => { setConfirmPasswordError(confirmPassword && password !== confirmPassword ? 'Passwords do not match' : ''); }, [password, confirmPassword]);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowCountryList(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!genderDropdownRef.current?.contains(e.target as Node) && !genderMenuContainerRef.current?.contains(e.target as Node)) setShowGenderList(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  useEffect(() => {
    if (showGenderList && genderButtonWrapperRef.current) {
      const rect = genderButtonWrapperRef.current.getBoundingClientRect();
      setGenderMenuPos({ left: rect.left, top: rect.bottom + 6, width: rect.width });
    }
  }, [showGenderList]);
  useEffect(() => {
    const total = 8;
    const filled = [firstName, lastName, email, telegramNumber, gender, password, confirmPassword && password === confirmPassword ? confirmPassword : '', passwordValidationErrors.length === 0 && passwordTouched ? 'ok' : ''].filter(Boolean).length;
    setProgress?.(Math.min(1, filled / total));
  }, [firstName, lastName, email, telegramNumber, gender, password, confirmPassword, passwordValidationErrors, passwordTouched, setProgress]);

  return (
    <div className="w-full h-full overflow-y-auto flex justify-center pt-2 pb-20 md:pt-8 md:pb-12">
      <div className="w-full max-w-[560px] px-4 md:px-0">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-6 text-[#B3935E] text-center md:text-left mt-10 md:mt-0">Hey There!</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-y-4 md:gap-y-6 md:gap-x-6">
          <div className="md:col-span-1">
            <p className="text-black text-sm md:text-base mb-1.5 md:mb-2">First name:</p>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="border border-[#0c0b09] text-black rounded w-full h-11 px-3 text-sm md:text-base" required />
          </div>
          <div className="md:col-span-1">
            <p className="text-black text-sm md:text-base mb-1.5 md:mb-2">Last name:</p>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="border border-[#0c0b09] text-black rounded w-full h-11 px-3 text-sm md:text-base" required />
          </div>
          <div className="md:col-span-2">
            <p className="text-black text-sm md:text-base mb-1.5 md:mb-2">School email:</p>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="border border-[#0c0b09] text-black rounded w-full h-11 px-3 text-sm md:text-base" required />
          </div>

          <div className="md:col-span-1" ref={dropdownRef}>
            <p className="text-black text-sm md:text-base mb-1.5 md:mb-2">Telegram number:</p>
            <div className="flex border border-[#0c0b09] text-black rounded overflow-hidden">
              <div className="flex items-center px-2 cursor-pointer bg-white border-r text-black border-[#0c0b09]" onClick={() => setShowCountryList(!showCountryList)}>
                <span className={`fi fi-${selectedCountry?.iso2}`} />
                <span className="ml-2 text-black font-medium">+{selectedCountry?.dialCode}</span>
              </div>
              <input type="tel" value={telegramNumber} onChange={(e) => handleNumberChange(e.target.value)} className="flex-1 h-11 px-3 text-black bg-white outline-none" placeholder="Phone number" maxLength={getExpectedLength() ?? 15} required />
            </div>
            {telegramNumberError && <div className="text-red-500 text-xs mt-1">{telegramNumberError}</div>}
            {showCountryList && (
              <div className="absolute mt-1 text-black bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto w-64 z-50">
                <input type="text" value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)} placeholder="Search country" className="w-full px-3 py-2 border-b border-gray-200 text-black outline-none" />
                {countryData.allCountries.filter((c: CountryData) => c.name.toLowerCase().includes(countrySearch.toLowerCase()) || c.dialCode.includes(countrySearch)).map((country: CountryData, index: number) => (
                  <div key={index} className="flex items-center px-3 py-2 hover:bg-gray-100 text-black cursor-pointer" onClick={() => { setSelectedCountry(country); setShowCountryList(false); }}>
                    <span className={`fi fi-${country.iso2}`} />
                    <span className="ml-2">{country.name}</span>
                    <span className="ml-auto">+{country.dialCode}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-1 relative z-50" ref={genderDropdownRef}>
            <p className="text-black text-sm md:text-base mb-1.5 md:mb-2">Gender:</p>
            <div className="relative" ref={genderButtonWrapperRef}>
              <button type="button" onClick={() => setShowGenderList((s) => !s)} className="border border-[#0c0b09] text-black rounded w-full h-11 px-3 text-sm md:text-base bg-white text-left flex items-center justify-between">
                <span>{genderOptions.find((g) => String(g.value) === gender)?.name || 'Gender'}</span>
                <svg className="w-4 h-4 ml-2 text-[#0c0b09]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd"/></svg>
              </button>
              {showGenderList && typeof window !== 'undefined' && createPortal(
                <div ref={genderMenuContainerRef} style={{ position: 'fixed', left: genderMenuPos.left, top: genderMenuPos.top, width: genderMenuPos.width }} className="bg-white text-black border border-gray-300 rounded shadow-2xl z-[10000] max-h-60 overflow-y-auto">
                  {genderOptions.map((option) => (
                    <div key={option.value} className="px-3 py-2 hover:bg-gray-100 cursor-pointer" onClick={() => { setGender(String(option.value)); setShowGenderList(false); }}>{option.name}</div>
                  ))}
                </div>,
                document.body
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <p className="text-black text-sm md:text-base mb-1.5 md:mb-2">Password:</p>
            {password && (
              <div className="-mt-1 mb-1">
                <div className="flex items-center gap-3">
                  <span className={`text-xs md:text-sm font-medium ${passwordMeta.colorText}`}>{passwordMeta.label}</span>
                  <div className="flex items-center gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <span key={i} className={`h-1.5 w-6 rounded-full ${i < passwordMeta.segmentsFilled ? passwordMeta.colorBar : 'bg-gray-200'}`} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setPasswordTouched(true); }} className={`border ${passwordMeta.strength === 'empty' ? 'border-[#0c0b09]' : passwordMeta.colorBorder} text-black rounded w-full h-11 px-3 text-sm md:text-base`} required />
          </div>

          <div className="md:col-span-2">
            <p className="text-black text-sm md:text-base mb-1.5 md:mb-2">Confirm Password:</p>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`border ${confirmPasswordError ? 'border-red-500' : 'border-[#0c0b09]'} text-black rounded w-full h-11 px-3 text-sm md:text-base`} required />
            {confirmPasswordError && <div className="text-red-500 text-xs mt-1">{confirmPasswordError}</div>}
          </div>

          <div className="md:col-span-2">
            <button type="submit" disabled={!isFormValid()} className={`w-full py-2 px-4 rounded text-white text-sm md:text-base bg-[#B3935E] ${!isFormValid() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#9B7D4E] transition-colors'}`}>Next</button>
          </div>
        </form>
      </div>
    </div>
  );
}
