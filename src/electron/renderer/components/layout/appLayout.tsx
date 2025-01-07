import { Box, HStack, VStack } from "@chakra-ui/react";
import React, { ReactNode } from "react";
import AppSidebar from "./sidebar";
import AppHeader from "./header";

type AppLayoutProps = {
  children: ReactNode;
};
const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <HStack
      width="100%"
      height={"100vh"}
      alignItems="flex-start"
      objectFit="cover"
      backgroundImage="url('../../assets/images/background-body-admin.jpeg')"
      backgroundSize="cover"
      backgroundPosition="center"
      position="relative"
      maxH="100vh"
      overflow="scroll"
    >
      <Box pos="fixed" height="100vh" width="100vw" background="rgb(0, 7, 81, 0.7);"></Box>
      <AppSidebar />
      <VStack
        overflow="scroll"
        position="relative"
        left="20%"
        width={"80%"}
        justifyContent="flex-start"
      >
        <AppHeader />
        {children}
      </VStack>
    </HStack>
  );
};

export default AppLayout;
