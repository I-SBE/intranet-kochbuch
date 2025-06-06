export async function registerUser(formData) {
  const data = new FormData();
  for (const key in formData) {
    data.append(key, formData[key]);
  }

  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/Register`, {
    method: "POST",
    body: data,
  });

  const result = await res.json();
  return { ok: res.ok, data: result };
}

//--------------------------------------------------------------------------

export async function loginUser(credentials) {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/Login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const result = await res.json();
  return { ok: res.ok, data: result };
}

//--------------------------------------------------------------------------

export async function fetchUserProfile() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await res.json();
  return { ok: res.ok, data: result };
}
