import { Box, Button, Text } from "@chakra-ui/react";
import React from "react";
import { useNavigate } from "react-router-dom"; // Use for navigation
import routePaths from "../../utils/routes/routes";
import AppLayout from "../../components/layout/appLayout";

const Home = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <Box>
        <h1>Home Page</h1>
        <Button
          colorScheme="teal"
          onClick={() => navigate(routePaths.dashboard)}
        >
          press me
        </Button>
      </Box>
    </AppLayout>
  );
};

export default Home;
