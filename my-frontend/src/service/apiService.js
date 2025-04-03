import apiUrls from "./apiUrl";

const searchPerson = async (email) => {
  const response = await fetch(`${apiUrls.PERSON_SEARCH_URL}${email}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error("Failed to search for person");
  }
  return response.json();
};

const updatePerson = async (personData) => {
  const response = await fetch(apiUrls.PERSON_PATCH_URL, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(personData),
  });

  if (!response.ok) throw new Error("Failed to update person");
  return response.json();
};

const addPerson = async (personData) => {
  const response = await fetch(apiUrls.PERSON_INSERT_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify([personData]),
  });

  if (!response.ok) throw new Error("Failed to add person");
  return response.text();
};

const deletePerson = async (email) => {
  const response = await fetch(`${apiUrls.PERSON_DELETE_URL}${email}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete person");
  return response.text();
};

const fetchPeople = async () => {
  const response = await fetch(apiUrls.PERSON_GET_LIST_URL);
  if (!response.ok) throw new Error("Failed to fetch people");
  return response.json();
};

const searchPeople = async (query) => {
  const response = await fetch(
    `${apiUrls.PERSON_SEARCH_URL}${encodeURIComponent(query)}`,
  );
  if (!response.ok) throw new Error("Failed to search people");
  return response.json();
};

const deleteAllPeople = async () => {
  const response = await fetch(apiUrls.PERSON_CLEAR_ALL_URL, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete all people");
  return response.text();
};

const exportData = async (format) => {
  const url =
    format === "json"
      ? apiUrls.PERSON_EXPORT_JSON_URL
      : apiUrls.PERSON_EXPORT_CSV_URL;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to export data");
  return response.blob();
};

export {
  searchPerson,
  updatePerson,
  addPerson,
  deletePerson,
  fetchPeople,
  searchPeople,
  deleteAllPeople,
  exportData,
};
