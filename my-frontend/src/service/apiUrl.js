const API_BASE_URL = "http://localhost:7285/api";
const OPEN_CAGE_API_BASE_URL = "https://api.opencagedata.com/geocode/v1/json";
const OPEN_CAGE_API = "7f83ca25f80f40b6b8aacd66203fb05b";

export const PERSON_SEARCH_URL = `${API_BASE_URL}/person/search?query=`;
export const PERSON_PATCH_URL = `${API_BASE_URL}/person`;
export const PERSON_INSERT_URL = `${API_BASE_URL}/PersonInsert`;
export const PERSON_DELETE_URL = `${API_BASE_URL}/person/`;
export const PERSON_GET_LIST_URL = `${API_BASE_URL}/PersonGetList`;
export const PERSON_CLEAR_ALL_URL = `${API_BASE_URL}/person/clearall`;
export const PERSON_EXPORT_JSON_URL = `${API_BASE_URL}/person/exportJSON`;
export const PERSON_EXPORT_CSV_URL = `${API_BASE_URL}/person/exportCSV`;
export const TINYMCE_API_KEY =
  "mpxkgfe2pwchdufwdpceqiyxppynn6cpzsvj9abrlmyp4xy7";
export const OPEN_METEO_API_URL = "https://api.open-meteo.com/v1/forecast";
export const OPEN_CAGE_API_KEY = OPEN_CAGE_API;
export const OPEN_CAGE_API_URL = OPEN_CAGE_API_BASE_URL;

export default {
  PERSON_SEARCH_URL,
  PERSON_PATCH_URL,
  PERSON_INSERT_URL,
  PERSON_DELETE_URL,
  PERSON_GET_LIST_URL,
  PERSON_CLEAR_ALL_URL,
  PERSON_EXPORT_JSON_URL,
  PERSON_EXPORT_CSV_URL,
  TINYMCE_API_KEY,
  OPEN_METEO_API_URL,
  OPEN_CAGE_API_URL,
  OPEN_CAGE_API_KEY,
};
