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