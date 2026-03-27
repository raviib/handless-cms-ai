"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { axiosInstance } from "../config/axiosInstance";
import { TostError, TostSuccess } from "@/app/utils/tost/Tost";
import { useRouter } from "next/navigation";
import { generateApiAccessToken } from "@/app/lib/auth.improved.js";

/* -------------------------------------------------------
     GET API HOOK
------------------------------------------------------- */
const useGetApi = (initialUrl = null, showMessage = true) => {
  const [url, setUrl] = useState(initialUrl);
  const [data, setData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!url) return;

    setIsLoading(true);

    try {
      const Token = await generateApiAccessToken();
      const config = {
        headers: { Authorization: `Bearer ${Token}` },
      };

      const { data } = await axiosInstance.get(url, config);

      if (data.success) setData(data);
    } catch (error) {
      setError(error);
      if (showMessage) TostError(error?.response?.data?.message);
    }

    setIsLoading(false);
  }, [url, showMessage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const doFetch = useCallback(
    async (newUrl) => {
      if (newUrl) setUrl(newUrl);
      else fetchData();
    },
    [fetchData]
  );

  return { data, isLoading, error, doFetch, setData };
};

/* -------------------------------------------------------
     POST API HOOK
------------------------------------------------------- */
const usePostApi = (initialUrl) => {
  const [url, setUrl] = useState(initialUrl);
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const resetState = () => {
    setError(null);
    setSuccess(false);
    setData({});
  };

  const doPost = useCallback(
    async (postData, cb = () => { }) => {
      resetState();
      setIsLoading(true);

      try {
        const Token = await generateApiAccessToken();
        const config = {
          headers: { Authorization: `Bearer ${Token}` },
        };

        const { data } = await axiosInstance.post(url, postData, config);

        if (data.success) {
          TostSuccess(data.message);
          cb();
        }

        setData(data);
        setSuccess(true);
      } catch (error) {
        setError(error);
        TostError(error?.response?.data?.message);
      }

      setIsLoading(false);
    },
    [url]
  );

  const doPostRedirect = useCallback(
    async (postData, redirectUrl, showMessage = true, cb = () => { }) => {
      resetState();
      setIsLoading(true);

      try {
        const Token = await generateApiAccessToken();
        const config = {
          headers: { Authorization: `Bearer ${Token}` },
        };

        const { data } = await axiosInstance.post(url, postData, config);

        if (data.success) {
          if (showMessage) TostSuccess(data.message);
          if (redirectUrl) router.push(redirectUrl);
          cb(data);
        }

        setData(data);
        setSuccess(true);
      } catch (error) {

        if (showMessage) TostError(error?.response?.data?.message);
        setError(error?.response?.data?.message ?? "Bad Request");
      }

      setIsLoading(false);
    },
    [url, router]
  );

  const doPostWithFormdata = useCallback(
    async (postData, redirectUrl) => {
      resetState();
      setIsLoading(true);

      try {
        const Token = await generateApiAccessToken();
        const config = {
          headers: {
            Authorization: `Bearer ${Token}`,
            "Content-Type": "multipart/form-data",
          },
        };

        const { data } = await axiosInstance.post(url, postData, config);

        if (data.success) {
          TostSuccess(data.message);
          if (redirectUrl) router.push(redirectUrl);
        }
      } catch (error) {
        setError(error);
        TostError(error?.response?.data?.message);
      }

      setIsLoading(false);
    },
    [url, router]
  );

  return { data, isLoading, doPost, setUrl, success, error, doPostWithFormdata, doPostRedirect };
};

/* -------------------------------------------------------
     PUT API HOOK
------------------------------------------------------- */
const usePutApi = (initialUrl, initialData = null) => {
  const [url, setUrl] = useState(initialUrl);
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const doPut = useCallback(
    async (putData) => {
      setIsLoading(true);
      setSuccess(false);

      try {
        const Token = await generateApiAccessToken();
        const config = {
          headers: { Authorization: `Bearer ${Token}` },
        };

        const { data } = await axiosInstance.put(url, putData, config);

        setData(data);
        if (data.success) {
          setSuccess(true);
          TostSuccess(data.message);
        }
      } catch (error) {
        setError(error);
        TostError(error?.response?.data?.message);
      }

      setIsLoading(false);
    },
    [url]
  );

  const doPutRedirect = useCallback(
    async (putData, isForm = false, redirectUrl) => {
      setIsLoading(true);
      setSuccess(false);

      try {
        const Token = await generateApiAccessToken();
        const config = {
          headers: {
            Authorization: `Bearer ${Token}`,
            ...(isForm ? { "Content-Type": "multipart/form-data" } : {}),
          },
        };

        const { data } = await axiosInstance.put(url, putData, config);

        setData(data);

        if (data.success) {
          setSuccess(true);
          TostSuccess(data.message);
          if (redirectUrl) router.push(redirectUrl);
        }
      } catch (error) {
        setError(error);
        TostError(error?.response?.data?.message);
      }

      setIsLoading(false);
    },
    [url, router]
  );

  return { data, isLoading, error, success, doPut, doPutRedirect, setUrl };
};

/* -------------------------------------------------------
     DELETE API HOOK
------------------------------------------------------- */
const useDeleteApi = (initialUrl, initialData = null) => {
  const [url, setUrl] = useState(initialUrl);
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const doDelete = useCallback(async (newUrl, deleteData = {}, cb = () => { }, showMessage = true) => {
    setIsLoading(true);
    setError(null);

    try {
      const Token = await generateApiAccessToken();
      const config = {
        headers: { Authorization: `Bearer ${Token}` },
        data: deleteData
      };

      const { data } = await axiosInstance.delete(newUrl || url, config);

      if (data.success) {
        setData(data.message);
        if (showMessage) {

          TostSuccess(data.message);
        }
        cb();
      }
    } catch (error) {
      setError(error);
      TostError(error?.response?.data?.message);
    }

    setIsLoading(false);
  }, [url]);

  return { data, isLoading, error, doDelete, setUrl };
};

/* -------------------------------------------------------
     DEBOUNCE API HOOK
------------------------------------------------------- */
const useDebounceApi = (initialUrl = "", searchTerm, delay = 600) => {
  const [data, setData] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!searchTerm) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const source = axios.CancelToken.source();

    const timer = setTimeout(async () => {
      try {
        const Token = await generateApiAccessToken();

        const response = await axiosInstance.get(initialUrl, {
          cancelToken: source.token,
          headers: { Authorization: `Bearer ${Token}` },
        });

        setData(response.data);
      } catch (error) {
        if (!axios.isCancel(error)) setError(error);
      }
      setIsLoading(false);
    }, delay);

    return () => {
      clearTimeout(timer);
      source.cancel();
    };
  }, [searchTerm, initialUrl, delay]);

  return { data, isLoading, error };
};

export { useGetApi, usePostApi, usePutApi, useDeleteApi, useDebounceApi };