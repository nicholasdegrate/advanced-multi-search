import { useEffect, useState } from "react";

export function useFetch<T>(fetchFunction: () => Promise<T[]>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchFunction();
        setData(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch options", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchFunction]);

  return { data, loading };
}
