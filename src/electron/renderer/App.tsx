import React, { Suspense } from "react";
import { ChakraProvider, Button } from "@chakra-ui/react";
import Routers from "./utils/routes/router";
import ErrorBoundary from "./utils/errorHandlers/errorBoundary";
import { RecoilRoot } from "recoil";

const App = () => (
  <ChakraProvider>
    <RecoilRoot>
      <ErrorBoundary>
        <Routers />
      </ErrorBoundary>
    </RecoilRoot>
  </ChakraProvider>
);

export default App;
