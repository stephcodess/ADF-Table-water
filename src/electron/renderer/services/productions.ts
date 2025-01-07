import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { firestore } from "../utils/firebase/firebaseSetup";
import { useSetRecoilState } from "recoil";
import {
  productionErrorState,
  productionLoadingState,
  productionSuccessState,
} from "./state";
import {
  getResponseFromCache,
  saveResponseToCache,
  deleteResponseFromCache,
} from "../utils/firebase/indexDbcache";


/**
 * Production data model
 */
export interface Production {
  id: string;
  data: {
    machine: string;
    operator: string;
    quantity: number;
    kg_used: number;
    packing_bags_used: number;
  }[];
  date: Timestamp;
}

const productionsCollection = collection(firestore, "Productions");

/**
 * Custom hook to fetch the current month's production data
 * @returns {Object} - The productions, loading state, and error message
 */
export const useGetCurrentMonthProductions = () => {
  const [productions, setProductions] = useState<Production[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const currentDate = new Date();
        const startOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
        const endOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        );

        const cacheKey = `productions_${startOfMonth.toISOString()}_${endOfMonth.toISOString()}`;
        const cachedProductions = await getResponseFromCache(cacheKey);

        if (cachedProductions) {
          const convertedProductions = cachedProductions.map((production: Production) => ({
            ...production,
            date: new Timestamp(production.date.seconds, production.date.nanoseconds)
          }));
          setProductions(convertedProductions);
          return;
        }

        const q = query(
          productionsCollection,
          where("date", ">=", Timestamp.fromDate(startOfMonth)),
          where("date", "<=", Timestamp.fromDate(endOfMonth))
        );

        const querySnapshot = await getDocs(q);
        const fetchedProductions = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data().data,
          date: doc.data().date,
        })) as Production[];

        await saveResponseToCache(cacheKey, fetchedProductions);

        setProductions(fetchedProductions);
      } catch (e: any) {
        console.error("Error fetching productions:", e);
        setError(e.message || "An error occurred while fetching productions");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { productions, loading, error };
};


/**
 * Custom hook to fetch production data by specific month
 * @param {string} year - The year to fetch data for
 * @param {string} month - The month to fetch data for
 * @returns {Object} - Productions data, loading state, error message, and refetch function
 */
export const useGetProductionsByMonth = (year: string, month: string) => {
  const [productions, setProductions] = useState<Production[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const startOfMonth = new Date(Number(year), Number(month) - 1, 1);
      const endOfMonth = new Date(Number(year), Number(month), 0);

      const cacheKey = `productions_${year}_${month}`;
      const cachedProductions = await getResponseFromCache(cacheKey);

      if (cachedProductions) {
        const convertedProductions = cachedProductions.map((production: Production) => ({
          ...production,
          date: new Timestamp(production.date.seconds, production.date.nanoseconds)
        }));
        setProductions(convertedProductions);
        return;
      }

      const q = query(
        productionsCollection,
        where("date", ">=", Timestamp.fromDate(startOfMonth)),
        where("date", "<=", Timestamp.fromDate(endOfMonth))
      );

      const querySnapshot = await getDocs(q);
      const fetchedProductions = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        data: doc.data().data,
        date: doc.data().date,
      })) as Production[];

      await saveResponseToCache(cacheKey, fetchedProductions);

      setProductions(fetchedProductions);
    } catch (e: any) {
      console.error("Error fetching productions:", e);
      setError(e.message || "An error occurred while fetching productions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [year, month]);

  const refetch = () => {
    fetchData();
  };

  return { productions, loading, error, refetch };
};

// useGetAllProductions hook
export const useGetAllProductions = (): {
  productions: Production[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
} => {
  const [productions, setProductions] = useState<Production[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);

      const cacheKey = `productions_all`;
      const cachedProductions = await getResponseFromCache(cacheKey);

      if (cachedProductions) {
        const convertedProductions = cachedProductions.map((production: Production) => ({
          ...production,
          date: new Timestamp(production.date.seconds, production.date.nanoseconds)
        }));
        setProductions(convertedProductions);
        return;
      }

      const querySnapshot = await getDocs(productionsCollection);
      const fetchedProductions = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        data: doc.data().data,
        date: doc.data().date,
      })) as Production[];

      await saveResponseToCache(cacheKey, fetchedProductions);

      setProductions(fetchedProductions);
    } catch (e: any) {
      console.error("Error fetching productions:", e);
      setError(e.message || "An error occurred while fetching productions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refetch = () => {
    fetchData();
  };

  return { productions, loading, error, refetch };
};

// useGetProductionsByCategory hook
export function useGetProductionsByCategory(category: string): {
  productions: Production[] | null;
  refetch: () => void;
} {
  const setLoading = useSetRecoilState(productionLoadingState);
  const setError = useSetRecoilState(productionErrorState);
  const setSuccess = useSetRecoilState(productionSuccessState);
  const [productions, setProductions] = useState<Production[] | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);

      const cacheKey = `productions_category_${category}`;
      const cachedProductions = await getResponseFromCache(cacheKey);

      if (cachedProductions) {
        const convertedProductions = cachedProductions.map((production: Production) => ({
          ...production,
          date: new Timestamp(production.date.seconds, production.date.nanoseconds)
        }));
        setProductions(convertedProductions);
        setSuccess(true);
        return;
      }

      const querySnapshot = await getDocs(
        query(productionsCollection, where("data.category", "==", category))
      );
      const fetchedProductions = querySnapshot.docs.map((doc) => {
        const data = doc.data().data as Production["data"];
        return { id: doc.id, data, date: doc.data().date };
      });

      await saveResponseToCache(cacheKey, fetchedProductions);

      setProductions(fetchedProductions);
      setSuccess(true);
    } catch (error: any) {
      console.error("Error fetching productions:", error);
      setError(error.message || "An error occurred while fetching productions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [category]); // Refetch when the category changes

  const refetch = () => {
    fetchData();
  };

  return { productions, refetch };
}

// useAddProduction hook
export const useAddProduction = (): [
  (production: Production) => Promise<string>,
  boolean,
  string | null,
] => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const addProduction = async (production: Production): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      const docRef = await addDoc(productionsCollection, production);

      const date = production.date.toDate();
      const cacheKey = `productions_${date.getFullYear()}_${date.getMonth() + 1}`;
      await deleteResponseFromCache(cacheKey);
      await deleteResponseFromCache("productions_all");

      setLoading(false);
      return docRef.id;
    } catch (e: any) {
      console.error("Error adding production:", e);
      setLoading(false);
      setError(e.message || "An error occurred");
      throw e;
    }
  };

  return [addProduction, loading, error];
};

// useDeleteProduction hook
export const useDeleteProduction = (): [
  (id: string) => Promise<void>,
  boolean,
  Error | undefined,
] => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const deleteProduction = async (id: string): Promise<void> => {
    try {
      if (!id) {
        throw new Error("Document ID is empty");
      }
      setLoading(true);
      const docRef = doc(firestore, "Productions", id);
      await deleteDoc(docRef);

      const productionDoc = await getDoc(docRef);
      const productionData = productionDoc.data();
      if (productionData) {
        const date = productionData.date.toDate();
        const cacheKey = `productions_${date.getFullYear()}_${date.getMonth() + 1}`;
        await deleteResponseFromCache(cacheKey);
        await deleteResponseFromCache("productions_all");
      }
    } catch (e: any) {
      console.error("Error deleting production:", e);
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return [deleteProduction, loading, error];
};

// useUpdateProduction hook
export const useUpdateProduction = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProduction = async (
    id: string,
    updatedData: any
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(firestore, "Productions", id);
      await updateDoc(docRef, updatedData);

      const productionDoc = await getDoc(docRef);
      const productionData = productionDoc.data();
      if (productionData) {
        const date = productionData.date.toDate();
        const cacheKey = `productions_${date.getFullYear()}_${date.getMonth() + 1}`;
        await deleteResponseFromCache(cacheKey);
        await deleteResponseFromCache("productions_all");
      }
    } catch (e: any) {
      console.error("Error updating production:", e);
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateProduction,
    loading,
    error,
  };
};

// useGetProductionById hook
export const useGetProductionById = (
  id: string
): [Production | undefined, boolean, Error | undefined] => {
  const [production, setProduction] = useState<Production | undefined>(
    undefined
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    const fetchProduction = async () => {
      try {
        const docRef = doc(productionsCollection, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const productionData = {
            id: docSnap.id,
            data: docSnap.data().data,
            date: docSnap.data().date,
          };

          setProduction(productionData);

          const date = docSnap.data().date.toDate();
          const cacheKey = `productions_${date.getFullYear()}_${date.getMonth() + 1}`;
          await saveResponseToCache(cacheKey, [productionData]);
        } else {
          throw new Error("Production not found");
        }
      } catch (e: any) {
        console.error("Error getting production:", e);
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchProduction();
  }, [id]);

  return [production, loading, error];
};
