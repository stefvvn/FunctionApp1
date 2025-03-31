const API_BASE_URL = 'http://localhost:7285/api';

export const PERSON_SEARCH_URL = `${API_BASE_URL}/person/search?query=`;
export const PERSON_PATCH_URL = `${API_BASE_URL}/person`;
export const PERSON_INSERT_URL = `${API_BASE_URL}/PersonInsert`;
export const PERSON_DELETE_URL = `${API_BASE_URL}/person/`;
export const PERSON_GET_LIST_URL = `${API_BASE_URL}/PersonGetList`;
export const PERSON_CLEAR_ALL_URL = `${API_BASE_URL}/person/clearall`;
export const PERSON_EXPORT_JSON_URL = `${API_BASE_URL}/person/exportJSON`;
export const PERSON_EXPORT_CSV_URL = `${API_BASE_URL}/person/exportCSV`;

export default {
  PERSON_SEARCH_URL,
  PERSON_PATCH_URL,
  PERSON_INSERT_URL,
  PERSON_DELETE_URL,
  PERSON_GET_LIST_URL,
  PERSON_CLEAR_ALL_URL,
  PERSON_EXPORT_JSON_URL,
  PERSON_EXPORT_CSV_URL,
};
