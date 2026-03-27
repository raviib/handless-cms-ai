import axios from "axios";


export const axiosInstance = axios.create({
  withCredentials: true,
  baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}`,
});

export const FILE_LOCATION = `${process.env.NEXT_PUBLIC_IMAGE_URL}`