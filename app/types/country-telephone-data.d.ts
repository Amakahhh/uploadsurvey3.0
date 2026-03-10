declare module 'country-telephone-data' {
  interface CountryData {
    name: string;
    iso2: string;
    dialCode: string;
    format?: string;
    priority?: number;
    areaCodes?: string[];
    hasAreaCodes?: boolean;
  }

  const allCountries: CountryData[];
  const iso2Lookup: Record<string, CountryData>;

  export { CountryData };
  export default { allCountries, iso2Lookup };
}
