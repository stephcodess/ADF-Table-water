import { atom } from 'recoil';

export const employeesLoadingState = atom({
  key: 'employeesLoadingState',
  default: false,
});

export const employeesErrorState = atom({
  key: 'employeesErrorState',
  default: null,
});

export const employeesSuccessState = atom({
  key: 'employeesSuccessState',
  default: false,
});

export const addEmployeesLoadingState = atom({
  key: 'addEmployeesLoadingState',
  default: false,
});

export const addEmployeesErrorState = atom({
  key: 'addEmployeesErrorState',
  default: null,
});

export const AddEmployeesSuccessState = atom({
  key: 'addEmployeesSuccessState',
  default: false,
});

export const incomesLoadingState = atom({
  key: 'incomesLoadingState',
  default: false,
});

export const incomesErrorState = atom({
  key: 'incomesErrorState',
  default: null,
});

export const incomesSuccessState = atom({
  key: 'incomesSuccessState',
  default: false,
});

export const machineryLoadingState = atom({
  key: 'machineryLoadingState',
  default: false,
});

export const machineryErrorState = atom({
  key: 'machineryErrorState',
  default: null,
});

export const machinerySuccessState = atom({
  key: 'machinerySuccessState',
  default: false,
});

export const expenseLoadingState = atom({
  key: 'expenseLoadingState',
  default: false,
});

export const expenseErrorState = atom({
  key: 'expenseErrorState',
  default: null,
});

export const expenseSuccessState = atom({
  key: 'expenseSuccessState',
  default: false,
});

export const productionLoadingState = atom<boolean>({
  key: 'productionLoadingState',
  default: false,
});

export const productionErrorState = atom<string | null>({
  key: 'productionErrorState',
  default: null,
});

export const productionSuccessState = atom<boolean>({
  key: 'productionSuccessState',
  default: false,
});
