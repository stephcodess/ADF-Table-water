import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { firestore } from "../utils/firebase/firebaseSetup";
import { useSetRecoilState } from "recoil";
import {
  machineryErrorState,
  machineryLoadingState,
  machinerySuccessState,
} from "./state";
import {
  getResponseFromCache,
  saveResponseToCache,
  deleteResponseFromCache,
} from "../utils/firebase/indexDbcache";

export interface Machinery {
  id: string;
  model: string;
  category: string;
  capacity: string;
}

const machineriesCollection = collection(firestore, "Machineries");

export const useGetAllMachines = (): {
  machines: Machinery[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
} => {
  const [machines, setMachines] = useState<Machinery[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      // Check cache first
      const cacheKey = `machineries_all`;
      const cachedMachines = await getResponseFromCache(cacheKey);

      if (cachedMachines) {
        setMachines(cachedMachines);
      } else {
        const querySnapshot = await getDocs(machineriesCollection);
        const fetchedMachines = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Machinery[];
        setMachines(fetchedMachines);

        // Save to cache
        await saveResponseToCache(cacheKey, fetchedMachines);
      }
    } catch (e: any) {
      console.error("Error fetching machines:", e);
      setError(e.message || "An error occurred while fetching machines");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { machines, loading, error, refetch: fetchData };
};

export function useGetAllMachineriesByCategory(category: string): {
  machineries: Machinery[] | null;
  refetch: () => void;
} {
  const [machineries, setMachineries] = useState<Machinery[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
      setLoading(true);

      try {
          const cacheKey = `machineries_category_${category}`;
          const cachedMachineries = await getResponseFromCache(cacheKey);

          if (cachedMachineries) {
              setMachineries(cachedMachineries);
          } else {
              const querySnapshot = await getDocs(
                  query(machineriesCollection, where("category", "==", category))
              );
              const fetchedMachineries = querySnapshot.docs.map((doc) => ({
                  ...doc.data(),
                  id: doc.id,
              })) as Machinery[];
              setMachineries(fetchedMachineries);

              // Save to cache
              await saveResponseToCache(cacheKey, fetchedMachineries);
          }
      } catch (e: any) {
          console.error("Error fetching machineries:", e);
          setError(e.message || "An error occurred while fetching machineries");
      } finally {
          setLoading(false);
      }
  }, [category]);

  useEffect(() => {
      fetchData();
  }, [fetchData]);

  return { machineries, refetch: fetchData };
}

export const useAddMachinery = (): [
  (machinery: Machinery) => Promise<string>,
  boolean,
  string | null,
] => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const addMachinery = async (machinery: Machinery): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      const docRef = await addDoc(machineriesCollection, machinery);

      // Invalidate cache
      await deleteResponseFromCache(`machineries_all`);
      await deleteResponseFromCache(`machineries_category_${machinery.category}`);

      setLoading(false);
      return docRef.id;
    } catch (e: any) {
      console.error("Error adding machinery:", e);
      setLoading(false);
      setError(e.message || "An error occurred");
      throw e;
    }
  };

  return [addMachinery, loading, error];
};

export const useDeleteMachinery = (): [
  (id: string) => Promise<void>,
  boolean,
  Error | undefined,
] => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const deleteMachinery = async (id: string): Promise<void> => {
    setLoading(true);

    try {
      if (!id) {
        throw new Error("Document ID is empty");
      }
      const docRef = doc(machineriesCollection, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error("Machinery not found");
      }

      const data = docSnap.data() as Machinery;
      await deleteDoc(docRef);

      // Invalidate cache
      await deleteResponseFromCache(`machineries_all`);
      await deleteResponseFromCache(`machineries_category_${data.category}`);
    } catch (e: any) {
      console.error("Error deleting machinery:", e);
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return [deleteMachinery, loading, error];
};

export const updateMachinery = async (
  id: string,
  updatedData: Partial<Machinery>
): Promise<void> => {
  try {
    const docRef = doc(machineriesCollection, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("Machinery not found");
    }

    await updateDoc(docRef, updatedData);

    // Invalidate cache
    const data = docSnap.data() as Machinery;
    await deleteResponseFromCache(`machineries_all`);
    await deleteResponseFromCache(`machineries_category_${data.category}`);
  } catch (e: any) {
    console.error("Error updating machinery:", e);
    throw e;
  }
};

export const useGetMachineryById = (
  id: string
): [Machinery | undefined, boolean, Error | undefined] => {
  const [machinery, setMachinery] = useState<Machinery | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    const fetchMachinery = async () => {
      setLoading(true);

      try {
        // Check cache first
        const cachedMachinery = await getResponseFromCache(id);

        if (cachedMachinery) {
          setMachinery(cachedMachinery);
        } else {
          const docRef = doc(machineriesCollection, id);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const machineryData = docSnap.data() as Machinery;
            setMachinery(machineryData);

            // Save to cache
            await saveResponseToCache(id, machineryData);
          } else {
            throw new Error("Machinery not found");
          }
        }
      } catch (e: any) {
        console.error("Error getting machinery:", e);
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchMachinery();
  }, [id]);

  return [machinery, loading, error];
};
