import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDoc,
  getDocs,
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
  expenseErrorState,
  expenseLoadingState,
  expenseSuccessState,
} from "./state";
import {
  saveResponseToCache,
  getResponseFromCache,
  deleteResponseFromCache,
} from "../utils/firebase/indexDbcache";

// Expense interface with optional description field
export interface Expense {
  quantity: string;
  date: Timestamp;
  id: string;
  item: string;
  rate: string;
  total: string;
  type: string;
  reciever: string;
  description?: string;
}

const expensesCollection = collection(firestore, "expenses");

export function useGetAllExpenses(
  selectedYear?: string,
  selectedMonth?: string
): {
  expenses: Expense[] | null;
  refetch: (year?: string, month?: string) => void;
} {
  const setLoading = useSetRecoilState(expenseLoadingState);
  const setError = useSetRecoilState(expenseErrorState);
  const setSuccess = useSetRecoilState(expenseSuccessState);
  const [expenses, setExpenses] = useState<Expense[] | null>(null);

  const fetchData = async (year?: string, month?: string) => {
    try {
      setLoading(true);

      const currentDate = new Date();
      const currentYear = year || currentDate.getFullYear().toString();
      const currentMonth =
        month || (currentDate.getMonth() + 1).toString().padStart(2, "0");

      const startOfMonth = new Date(
        Number(currentYear),
        Number(currentMonth) - 1,
        1
      );
      const endOfMonth = new Date(
        Number(currentYear),
        Number(currentMonth),
        0,
        23,
        59,
        59,
        999
      );

      const q = query(
        expensesCollection,
        where("date", ">=", Timestamp.fromDate(startOfMonth)),
        where("date", "<=", Timestamp.fromDate(endOfMonth))
      );

      const cacheId = `expenses-${currentYear}-${currentMonth}`;
      const cachedResponse = await getResponseFromCache(cacheId);

      if (cachedResponse) {
        // Use cache if available
        const convertedExpenses = cachedResponse.map((expense: any) => ({
          ...expense,
          date:
            expense.date instanceof Timestamp
              ? expense.date
              : new Timestamp(expense?.date.seconds, expense.date.nanoseconds),
        }));
        setExpenses(convertedExpenses);
        setSuccess(true);
      } else {
        // Fetch from Firestore if no cache
        const querySnapshot = await getDocs(q);
        const fetchedExpenses = querySnapshot.docs.map((doc) => {
          const data: any = doc.data() as Expense;
          return {
            ...data,
            id: doc.id,
            date:
              data.date instanceof Timestamp
                ? data.date
                : new Timestamp(data.date.seconds, data.date.nanoseconds),
          };
        });
        setExpenses(fetchedExpenses);
        await saveResponseToCache(cacheId, fetchedExpenses); // Save the data to cache
        setSuccess(true);
      }
    } catch (error: any) {
      console.error("Error fetching expenses:", error);
      setError(error.message || "An error occurred while fetching expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cacheId = `expenses-${selectedYear}-${selectedMonth}`;
    deleteResponseFromCache(cacheId);
    fetchData(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  const refetch = (year?: string, month?: string) => {
    fetchData(year, month);
  };

  return { expenses, refetch };
}
// Hook to add a new expense
export const useAddExpense = (): [
  (expense: Expense) => Promise<string>,
  boolean,
  string | null
] => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const addExpense = async (expense: Expense): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      const docRef = await addDoc(expensesCollection, expense);
      setLoading(false);
      return docRef.id;
    } catch (e: any) {
      console.error("Error adding expense:", e);
      setLoading(false);
      setError(e.message || "An error occurred while adding expense");
      throw e;
    }
  };

  return [addExpense, loading, error];
};

export const useDeleteExpense = (): [
  (id: string) => Promise<void>,
  boolean,
  Error | undefined
] => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const deleteExpense = async (id: string): Promise<void> => {
    try {
      if (!id) {
        throw new Error("Document ID is empty");
      }
      setLoading(true);
      const docRef = doc(expensesCollection, id);
      await deleteDoc(docRef);
      await deleteResponseFromCache(id);
    } catch (e: any) {
      console.error("Error deleting expense:", e);
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return [deleteExpense, loading, error];
};

// Function to update an expense
export const updateExpense = async (
  id: string,
  updatedData: Partial<Expense>
): Promise<void> => {
  try {
    const docRef = doc(expensesCollection, id);
    await updateDoc(docRef, updatedData);
    await saveResponseToCache(id, updatedData);
  } catch (e: any) {
    console.error("Error updating expense:", e);
    throw e;
  }
};

// Hook to update an expense
export const useUpdateExpense = (): [
  (id: string, updatedData: Partial<Expense>) => Promise<void>,
  boolean,
  string | null
] => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateExpenseHandler = async (
    id: string,
    updatedData: Partial<Expense>
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await updateExpense(id, updatedData);
    } catch (e: any) {
      console.error("Error updating expense:", e);
      setError(e.message || "An error occurred while updating expense");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return [updateExpenseHandler, loading, error];
};

// Hook to get an expense by ID
export const useGetExpenseById = (
  id: string
): [Expense | undefined, boolean, Error | undefined] => {
  const [expense, setExpense] = useState<Expense | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const cachedExpense = await getResponseFromCache(id);
        if (cachedExpense) {
          setExpense(cachedExpense as Expense);
        } else {
          const docRef = doc(expensesCollection, id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const expenseData = docSnap.data() as Expense;
            setExpense(expenseData);
            await saveResponseToCache(id, expenseData);
          } else {
            throw new Error("Expense not found");
          }
        }
      } catch (e: any) {
        console.error("Error getting expense:", e);
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchExpense();
  }, [id]);

  return [expense, loading, error];
};
