export async function registerUser(formData) {
  const data = new FormData();
  for (const key in formData) {
    data.append(key, formData[key]);
  }

  const res = await fetch("/api/register", {
    method: "POST",
    body: data,
  });

  const result = await res.json();
  return { ok: res.ok, data: result };
}

//--------------------------------------------------------------------------

export async function loginUser(credentials) {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const result = await res.json();
  return { ok: res.ok, data: result };
}