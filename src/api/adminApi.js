import axiosInstance from './axios';

//통합관리자

//시설유형(get)
export const getFacilityTypes = () => {
  return axiosInstance.get('/admin/facility-type');
};

//시설유형별 항목(get)
export const getFacilityItems = (facilityTypeId) => {
  return axiosInstance.get(`/admin/add-item?facilityTypeId=${facilityTypeId}`);
};

//시설유형별 점검유형(get)
export const getInspectionTypes = (facilityTypeId) => {
  return axiosInstance.get(`/admin/check-type?facilityTypeId=${facilityTypeId}`);
};

//시설유형별 점검항목(get)
export const getInspectionItems = (facilityTypeId) => {
  return axiosInstance.get(`/admin/check-item?facilityTypeId=${facilityTypeId}`);
};

//시설유형(delete)
export const deleteFacilityType = (facilityTypeId) => {
  return axiosInstance.get(`/admin/facility-type/${facilityTypeId}`);
};