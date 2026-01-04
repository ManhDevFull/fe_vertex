declare module 'sub-vn' {
  export interface Province {
    code: string | number;
    name: string;
    unit?: string;
  }
  export interface District {
    code: string | number;
    name: string;
    unit?: string;
    province_code?: string | number;
    province_name?: string;
    full_name?: string;
  }
  export interface Ward {
    code: string | number;
    name: string;
    unit?: string;
    district_code?: string | number;
    district_name?: string;
    province_code?: string | number;
    province_name?: string;
    full_name?: string;
  }
  export function getProvinces(): Province[];
  export function getDistricts(): District[];
  export function getWards(): Ward[];
  export function getProvincesWithDetail(): unknown[];
  export function getDistrictsByProvinceCode(
    provinceCode: string | number
  ): District[];
  export function getWardsByDistrictCode(
    districtCode: string | number
  ): Ward[];
  export function getWardsByProvinceCode(
    provinceCode: string | number
  ): Ward[];
}
