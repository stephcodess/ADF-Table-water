import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense } from "react"; // For lazy loading
import React from "react";
import routePaths from "./routes";
import Dashboard from "../../screens/dashboard/dashboard";
import Home from "../../screens/home/home";
import Employees from "../../screens/employees/employees";
import ExternalIncome from "../../screens/income/external";
import InternalIncome from "../../screens/income/internal";
import ManageExpenses from "../../screens/expenses";
import ManageMachines from "../../screens/settings/machines/manageMachines";
import ProductionComponent from "../../screens/production/production";

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route
        path={routePaths.dashboard}
        element={
          <Suspense fallback={<div>Loading...</div>}>
            <Dashboard />
          </Suspense>
        }
      />
      <Route
        path={routePaths.internalSales}
        element={
          <Suspense fallback={<div>Loading...</div>}>
            <InternalIncome />
          </Suspense>
        }
      />

      <Route
        path={routePaths.ExternalSales}
        element={
          <Suspense fallback={<div>Loading...</div>}>
            <ExternalIncome />
          </Suspense>
        }
      />

      <Route
        path={routePaths.expenses}
        element={
          <Suspense fallback={<div>Loading...</div>}>
            <ManageExpenses />
          </Suspense>
        }
      />
      <Route
        path={routePaths.machineries}
        element={
          <Suspense fallback={<div>Loading...</div>}>
            <ManageMachines />
          </Suspense>
        }
      />

      <Route
        path={routePaths.production}
        element={
          <Suspense fallback={<div>Loading...</div>}>
            <ProductionComponent />
          </Suspense>
        }
      />

      <Route
        path={routePaths.employees}
        element={
          <Suspense fallback={<div>Loading...</div>}>
            <Employees />
          </Suspense>
        }
      />
    </Routes>
  </Router>
);

export default AppRoutes;
