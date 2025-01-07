// employeeService.ts

import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  where,
  query,
  DocumentData,
  QuerySnapshot,
} from "firebase/firestore";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  addEmployeesErrorState,
  addEmployeesLoadingState,
  AddEmployeesSuccessState,
  employeesErrorState,
  employeesLoadingState,
  employeesSuccessState,
} from "./state";
import { useEffect, useState } from "react";
import { firestore } from "../utils/firebase/firebaseSetup";
import {
  getResponseFromCache,
  deleteResponseFromCache,
  saveResponseToCache,
} from "../utils/firebase/indexDbcache";

export interface Employee {
  id: string;
  last_name: string;
  other_names: string;
  role: string;
  salary: string;
  employment_date: string;
}

const employeesCollection = collection(firestore, "Employees");

export function useAddEmployee(): [
  (employee: Employee) => Promise<string>,
  boolean,
  string | null,
] {
  const setLoading = useSetRecoilState(addEmployeesLoadingState);
  const setError = useSetRecoilState(addEmployeesErrorState);
  const setSuccess = useSetRecoilState(AddEmployeesSuccessState);

  const [error, setErrorLocal] = useState<string | null>(null);

  const addEmployee = async (employee: Employee): Promise<string> => {
    setLoading(true);
    setErrorLocal(null);
    try {
      const docRef = await addDoc(employeesCollection, employee);
      const newEmployee = { ...employee, id: docRef.id };

      // Update cache
      const cacheKey = "allEmployees";
      const cachedEmployees = await getResponseFromCache(cacheKey);
      const updatedEmployees = cachedEmployees
        ? [...cachedEmployees, newEmployee]
        : [newEmployee];
      await saveResponseToCache(cacheKey, updatedEmployees);

      setLoading(false);
      setSuccess(true);
      return docRef.id;
    } catch (e: any) {
      console.error("Error adding document:", e);
      setLoading(false);
      setErrorLocal(e.message || "An error occurred");
      setError(e.message || "An error occurred");
      setSuccess(false);
      throw e;
    }
  };

  return [addEmployee, useRecoilValue(addEmployeesLoadingState), error];
}


export function useGetAllEmployees(role?: string): {
  employees: Employee[] | null;
  refetch: () => void;
} {
  const setLoading = useSetRecoilState(employeesLoadingState);
  const setError = useSetRecoilState(employeesErrorState);
  const setSuccess = useSetRecoilState(employeesSuccessState);
  const [employees, setEmployees] = useState<Employee[] | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      let querySnapshot: QuerySnapshot<DocumentData>;
      let cacheKey = "allEmployees";
      if (role) {
        const q = query(employeesCollection, where("role", "==", role));
        querySnapshot = await getDocs(q);
        cacheKey += `_${role}`;
      } else {
        querySnapshot = await getDocs(employeesCollection);
      }

      // Check cache
      const cachedData = await getResponseFromCache(cacheKey);
      if (cachedData) {
        setEmployees(cachedData);
        setLoading(false);
        return;
      }

      // Fetch from Firestore if not cached
      const fetchedEmployees = querySnapshot.docs.map((doc) => {
        const data = doc.data() as Employee;
        return { ...data, id: doc.id };
      });
      setEmployees(fetchedEmployees);
      setSuccess(true);

      await saveResponseToCache(cacheKey, fetchedEmployees);
    } catch (error: any) {
      console.error("Error fetching employees:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role]);

  const refetch = () => {
    fetchData(); // Explicit refetch for UI update
  };

  return { employees, refetch };
}


export const useGetEmployeeById = (
  id: string
): [Employee | undefined, boolean, Error | undefined] => {
  const [employee, setEmployee] = useState<Employee | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);

        const cachedData = await getResponseFromCache(id);
        if (cachedData) {
          setEmployee(cachedData);
          setLoading(false);
          return;
        }

        const docRef = doc(employeesCollection, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const employeeData = docSnap.data() as Employee;
          setEmployee(employeeData);

          await saveResponseToCache(id, employeeData);
        } else {
          throw new Error("Document does not exist");
        }
      } catch (e: any) {
        console.error("Error getting document:", e);
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  return [employee, loading, error];
};

export const updateEmployee = async (
  id: string,
  updatedData: Partial<Employee>
): Promise<void> => {
  try {
    const docRef = doc(employeesCollection, id);
    await updateDoc(docRef, updatedData);

    const cachedData = await getResponseFromCache(id);
    if (cachedData) {
      const updatedEmployee = { ...cachedData, ...updatedData };
      await saveResponseToCache(id, updatedEmployee);
    }
  } catch (e) {
    console.error("Error updating document:", e);
    throw e;
  }
};

export const useDeleteEmployee = (): [
  (id: string) => Promise<void>,
  boolean,
  Error | undefined,
] => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const deleteEmployee = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      const docRef = doc(employeesCollection, id);
      await deleteDoc(docRef);

      await deleteResponseFromCache(id);
    } catch (e: any) {
      console.error("Error deleting document:", e);
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return [deleteEmployee, loading, error];
};
