const API_BASE = "http://localhost:7071/api";

export async function fetchPeople() {
  const res = await fetch(`${API_BASE}/PersonGetList`);
  if (!res.ok) throw new Error("Failed to fetch people");
  return await res.json();
}

export async function insertPerson(person) {
  const res = await fetch(`${API_BASE}/PersonInsert`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(person),
  });
  if (!res.ok) throw new Error("Failed to insert person");
  return await res.text();
}

export async function updatePerson(id, person) {
  const res = await fetch(`${API_BASE}/person/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(person),
  });
  if (!res.ok) throw new Error("Failed to update person");
  return await res.text();
}

export async function deletePerson(email) {
  const res = await fetch(`${API_BASE}/person/${encodeURIComponent(email)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete person");
  return await res.text();
}