import { genrateApiAccessToken } from "@/app/lib/auth.js";
async function getRequest(url) {
  const Token = await genrateApiAccessToken()
  const config = {
    cache: 'no-store',
    headers: {
      'Authorization': `Bearer ${Token}`
    },
  };
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`, config);

    if (!res.ok) return null
    return await res.json()
  } catch (error) {
    return null
  }
}
async function getRequestStatic(url) {
  const Token = await genrateApiAccessToken()
  const config = {
    cache: 'no-store',
    headers: {
      'Authorization': `Bearer ${Token}`
    },
  };
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${url}`, config);

    if (!res.ok) return null
    return await res.json()
  } catch (error) {

    return null
  }
}

const fetcher = (...args) => fetch(...args).then(res => {

  if (!res.json()) {
    return null
  }

  return res.json()
})
export { getRequest, fetcher, getRequestStatic }