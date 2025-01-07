import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  orderBy,
  Query,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { firestore } from "../utils/firebase/firebaseSetup";
import { useSetRecoilState } from "recoil";
import {
  incomesErrorState,
  incomesLoadingState,
  incomesSuccessState,
} from "./state";
import {
  getResponseFromCache,
  saveResponseToCache,
  deleteResponseFromCache,
} from "../utils/firebase/indexDbcache";

export interface Income {
  id: string;
  date: Timestamp;
  driver?: string;
  no_of_bags: number;
  rate: number;
  total: number;
  truck?: string;
  bags_by_truck?: { truck: string; bags: number }[];
  type: "internal" | "external";
}

const incomesCollection = collection(firestore, "sales");

export function useGetAllIncomesByType(
  type?: "internal" | "external",
  year?: string,
  month?: string
): {
  incomes: Income[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
} {
  const setLoading = useSetRecoilState(incomesLoadingState);
  const setError = useSetRecoilState(incomesErrorState);
  const setSuccess = useSetRecoilState(incomesSuccessState);
  const [incomes, setIncomes] = useState<Income[] | null>(null);
  const [loading, setLoadingState] = useState<boolean>(false);
  const [error, setErrorState] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setLoadingState(true);

      const cacheKey = `incomes_${type || "all"}_${year || "any"}_${month || "any"}`;
      const cachedIncomes = await getResponseFromCache(cacheKey);

      if (cachedIncomes) {
        const convertedIncomes = cachedIncomes.map((income: Income) => ({
          ...income,
          date: new Timestamp(income.date.seconds, income.date.nanoseconds)
        }));
        setIncomes(convertedIncomes);
        setSuccess(true);
        return;
      }

      let q: Query<DocumentData> = query(incomesCollection);

      if (year) {
        const startOfMonth = new Date(Number(year), Number(month ?? 1) - 1, 1);
        const endOfMonth = new Date(
          Number(year),
          Number(month ?? 12),
          0,
          23,
          59,
          59,
          999
        );
        q = query(
          q,
          where("date", ">=", Timestamp.fromDate(startOfMonth)),
          where("date", "<=", Timestamp.fromDate(endOfMonth))
        );
      }

      if (type) {
        q = query(q, where("type", "==", type));
      }

      const querySnapshot = await getDocs(q);
      const fetchedIncomes = querySnapshot.docs.map((doc) => {
        const data = doc.data() as Income;
        return { ...data, id: doc.id };
      });

      await saveResponseToCache(cacheKey, fetchedIncomes);

      setIncomes(fetchedIncomes);
      setSuccess(true);
    } catch (e: any) {
      console.error("Error fetching incomes:", e);
      setError(e);
      setErrorState(e.message || "An error occurred while fetching incomes");
    } finally {
      setLoading(false);
      setLoadingState(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [year, month, type]); // Refetch when the year, month, or type changes

  const refetch = () => {
    fetchData();
  };

  return { incomes, loading, error, refetch };
}

export const useAddIncome = (): [
  (income: Income) => Promise<string>,
  boolean,
  string | null,
] => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const addIncome = async (income: Income): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      const docRef = await addDoc(incomesCollection, income);

      // Invalidate cache
      const cacheKey = `incomes_${income.type}_${income.date.toDate().getFullYear()}_${income.date.toDate().getMonth() + 1}`;
      await deleteResponseFromCache(cacheKey);

      setLoading(false);
      return docRef.id;
    } catch (e: any) {
      console.error("Error adding income:", e);
      setLoading(false);
      setError(e.message || "An error occurred");
      throw e;
    }
  };

  return [addIncome, loading, error];
};

export const useDeleteIncome = (): [
  (id: string) => Promise<void>,
  boolean,
  Error | undefined,
] => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const deleteIncome = async (id: string): Promise<void> => {
    try {
      if (!id) {
        throw new Error("Document ID is empty");
      }
      setLoading(true); // Set loading to true when deletion starts
      const docRef = doc(incomesCollection, id); // Get document reference
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error("Income not found");
      }

      // Invalidate cache
      const data = docSnap.data() as Income;
      const cacheKey = `incomes_${data.type}_${data.date.toDate().getFullYear()}_${data.date.toDate().getMonth() + 1}`;
      await deleteResponseFromCache(cacheKey);

      await deleteDoc(docRef); // Delete the document
    } catch (e: any) {
      console.error("Error deleting document:", e);
      setError(e);
      throw e;
    } finally {
      setLoading(false); // Set loading to false regardless of success or failure
    }
  };

  return [deleteIncome, loading, error];
};

export const updateIncome = async (
  id: string,
  updatedData: Partial<Income>
): Promise<void> => {
  try {
    const docRef = doc(incomesCollection, id);
    await updateDoc(docRef, updatedData);

    if (updatedData.date instanceof Timestamp) {
      const date = updatedData.date.toDate();
      const cacheKey = `incomes_${updatedData.type}_${date.getFullYear()}_${date.getMonth() + 1}`;
      await deleteResponseFromCache(cacheKey);
    } else {
      console.warn(
        "Date is either undefined or not a Timestamp. Skipping cache invalidation."
      );
    }
  } catch (e: any) {
    console.error("Error updating income:", e);
    throw e;
  }
};

export const deleteIncomeForDateRange = async (
  startDate: Date,
  endDate: Date
): Promise<void> => {
  try {
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);
    const q = query(
      incomesCollection,
      where("date", ">=", startTimestamp),
      where("date", "<=", endTimestamp)
    );
    const querySnapshot = await getDocs(q);

    const deletePromises = querySnapshot.docs.map(async (docSnapshot) => {
      const data = docSnapshot.data() as Income;
      const cacheKey = `incomes_${data.type}_${data.date.toDate().getFullYear()}_${data.date.toDate().getMonth() + 1}`;
      await deleteResponseFromCache(cacheKey);
      return deleteDoc(docSnapshot.ref);
    });

    await Promise.all(deletePromises);
  } catch (e: any) {
    console.error("Error deleting documents:", e);
    throw e;
  }
};

export const useGetIncomeById = (
  id: string
): [Income | undefined, boolean, Error | undefined] => {
  const [income, setIncome] = useState<Income | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    const fetchIncome = async () => {
      try {
        const cachedIncome = await getResponseFromCache(id);
        if (cachedIncome) {
          const convertedIncome = {
            ...cachedIncome,
            date: new Timestamp(cachedIncome.date.seconds, cachedIncome.date.nanoseconds)
          };
          setIncome(convertedIncome);
          setLoading(false);
          return;
        }

        const docRef = doc(incomesCollection, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const incomeData = docSnap.data() as Income;
          setIncome(incomeData);
          await saveResponseToCache(id, incomeData);
        } else {
          throw new Error("Income not found");
        }
      } catch (e: any) {
        console.error("Error getting income:", e);
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchIncome();
  }, [id]);

  return [income, loading, error];
};
