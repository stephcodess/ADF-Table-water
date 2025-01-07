import {
  Box,
  HStack,
  Icon,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import React, { ReactElement, useState } from "react";
import {
  MdAttachMoney,
  MdHome,
  MdPayments,
  MdPerson2,
  MdSettings,
} from "react-icons/md";
import { Link } from "react-router-dom";
import routePaths from "../../utils/routes/routes";
import { FaArrowDown, FaMoneyCheck } from "react-icons/fa";

type SidebarRoutes = {
  name: string;
  icon: ReactElement;
  route: string;
  subRoutes?: Array<SidebarRoutes>;
};
const AppSidebar: React.FC = () => {
  const [showSubRoutes, setShowSubRoutes] = useState<{
    [key: string]: boolean;
  }>({});
  const routes: Array<SidebarRoutes> = [
    {
      name: "Dashboard",
      icon: <MdHome size={24} color="rgba(0,7,81,255)" />,
      route: routePaths.dashboard,
    },
    {
      name: "Manage Employees ",
      icon: <MdPerson2 size={24} color="rgba(0,7,81,255)" />,
      route: routePaths.employees,
    },
    {
      name: "Income",
      icon: <MdAttachMoney size={24} color="rgba(0,7,81,255)" />,
      route: routePaths.dashboard,
      subRoutes: [
        {
          name: "Internal Sales",
          icon: <MdAttachMoney size={24} color="rgba(0,7,81,255)" />,
          route: routePaths.internalSales,
        },
        {
          name: "External Sales",
          icon: <MdAttachMoney size={24} color="rgba(0,7,81,255)" />,
          route: routePaths.ExternalSales,
        },
      ],
    },
    {
      name: "Expenses",
      icon: <MdAttachMoney size={24} color="rgba(0,7,81,255)" />,
      route: routePaths.expenses,
    },
    {
      name: "Production",
      icon: <MdPayments size={24} color="rgba(0,7,81,255)" />,
      route: routePaths.production,
    },
    {
      name: "Machines",
      icon: <MdSettings size={24} color="rgba(0,7,81,255)" />,
      route: routePaths.machineries,
    },
  ];

  const toggleShowMenu = (route: string) => {
    setShowSubRoutes((prevRoutes) => ({
      ...prevRoutes,
      [route]: !prevRoutes[route],
    }));
  };

  return (
    <VStack
      bg="rgba(0,7,81,255)"
      backdropFilter="blur(10px)"
      transition="0.2s linear"
      width="20%"
      maxWidth="20%"
      height="calc(100vh - 32px)"
      paddingInline="20px"
      margin="16px 0 16px 16px"
      borderRadius="16px"
      spacing={4}
      position="fixed"
    >
      <Box
        fontSize="2xl"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        height="100px"
        marginBottom="2rem"
        fontWeight="bold"
      >
        {/* <img src="../Icons/logo.png" alt="" /> */}
        <Text color="#fff">ADF WATER</Text>
      </Box>

      <VStack width="100%" color="#fff">
        <VStack>
          <Box display="flex" flexDir="column" gap="1.5rem">
            {routes.map((item: SidebarRoutes, index: number) =>
              item?.subRoutes ? (
                <Box key={index}>
                  <HStack
                    onClick={() => toggleShowMenu(item.route)}
                    height="60px"
                    _hover={{
                      backgroundColor: "rgba(255,255,255,0.4)",
                    }}
                    padding="10px"
                    px="10px"
                    cursor="pointer"
                    borderRadius="10px"
                  >
                    <Box
                      width="30px"
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      height="30px"
                      borderRadius="30px"
                      bgColor="#fff"
                    >
                      {item.icon}
                    </Box>
                    <Text fontWeight="bolder"> {item.name} </Text>
                    <FaArrowDown />
                  </HStack>
                  <VStack display={showSubRoutes[item.route] ? "flex" : "none"}>
                    {item.subRoutes.map(
                      (subRoute: SidebarRoutes, index: number) => (
                        <Link to={subRoute.route} key={index}>
                          <HStack
                            height="60px"
                            _hover={{
                              backgroundColor: "rgba(255,255,255,0.4)",
                            }}
                            padding="10px"
                            px="10px"
                            cursor="pointer"
                            borderRadius="10px"
                          >
                            <Box
                              width="30px"
                              display="flex"
                              justifyContent="center"
                              alignItems="center"
                              height="30px"
                              borderRadius="30px"
                              bgColor="#fff"
                            >
                              {subRoute.icon}
                            </Box>
                            <Text fontWeight="bolder"> {subRoute.name} </Text>
                          </HStack>
                        </Link>
                      )
                    )}
                  </VStack>
                </Box>
              ) : (
                <Link to={item.route} key={index}>
                  <HStack
                    height="60px"
                    _hover={{
                      backgroundColor: "rgba(255,255,255,0.4)",
                    }}
                    padding="10px"
                    px="10px"
                    cursor="pointer"
                    borderRadius="10px"
                  >
                    <Box
                      width="30px"
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      height="30px"
                      borderRadius="30px"
                      bgColor="#fff"
                    >
                      {item.icon}
                    </Box>
                    <Text fontWeight="bolder"> {item.name} </Text>
                  </HStack>
                </Link>
              )
            )}
          </Box>
        </VStack>
      </VStack>
    </VStack>
  );
};

export default AppSidebar;
