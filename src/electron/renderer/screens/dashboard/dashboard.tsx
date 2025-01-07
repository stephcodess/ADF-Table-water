import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Flex,
  HStack,
  Select,
  SimpleGrid,
  Spacer,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Table,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import AppLayout from "../../components/layout/appLayout";
import LineChart from "../../components/Charts/LineChart";
import {
  lineChartOptionsDashboard,
  barChartDataDashboard,
  barChartOptionsDashboard,
} from "../../utils/variables/charts";
import IconBox from "../../components/Icons/IconBox";
import {
  CartIcon,
  DocumentIcon,
  GlobeIcon,
  WalletIcon,
} from "../../components/Icons/Icons";
import BarChart from "../../components/Charts/BarChart";
import { useGetAllIncomesByType } from "../../services/income";
import DashboardTableRow from "../../components/Tables/DashboardTableRow";
import { useGetCurrentMonthProductions } from "../../services/productions";
import { useGetAllExpenses } from "../../services/expenses";

interface DashboardTableRow {
  date: string;
  internal: number;
  external: number;
  total: number;
}

const Dashboard = () => {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(
    currentDate.getFullYear().toString()
  );
  const [totalProduction, setTotalProduction] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(
    (currentDate.getMonth() + 1).toString().padStart(2, "0")
  );
  const [totalExpenses, settotalExpenses] = useState(0);
  const { productions: currentMonthProductions } =
    useGetCurrentMonthProductions();

  const { incomes: fetchedIncomes, refetch } = useGetAllIncomesByType(
    undefined,
    selectedYear,
    selectedMonth
  );
  const { expenses, refetch: refetchExpenses } = useGetAllExpenses(
    selectedYear,
    selectedMonth
  );

  const { incomes: incomeAnalysis } = useGetAllIncomesByType(
    undefined,
    currentDate.getFullYear().toString(),
    undefined
  );

  useEffect(() => {
    if (currentMonthProductions) {
      const total = currentMonthProductions.reduce(
        (acc, production) =>
          acc + production.data?.reduce((sum, d) => sum + d.quantity, 0),
        0
      );
      setTotalProduction(total);
      const totalExpenses: any = expenses?.reduce(
        (total, expense) => total + parseInt(expense.total),
        0
      );
      settotalExpenses(totalExpenses);
    }
  }, [currentMonthProductions, expenses]);

  const totalIncome = useMemo(() => {
    if (!fetchedIncomes) return 0;

    return fetchedIncomes.reduce((total, income) => total + income.total, 0);
  }, [fetchedIncomes]);

  const [lineChartDataDashboard, setLineChartDataDashboard]: any = useState([
    {
      name: "Sachet water",
      data: Array(12).fill(0),
    },
  ]);

  useEffect(() => {
    if (incomeAnalysis) {
      let monthlyIncomeData = Array(12).fill(0);
      incomeAnalysis?.forEach((income) => {
        const incomeDate = income.date.toDate(); // Convert timestamp to Date
        const incomeYear = incomeDate.getFullYear();
        const incomeMonth = incomeDate.getMonth(); // 0 for January, 11 for December

        if (incomeYear === currentDate.getFullYear()) {
          monthlyIncomeData[incomeMonth] += income.total;
        }
      });
      setLineChartDataDashboard([
        {
          name: "Sachet water",
          data: monthlyIncomeData,
        },
      ]);
    }
  }, [incomeAnalysis]);

  const years = Array.from(
    { length: currentDate.getFullYear() - 2020 + 1 },
    (_, i) => (2020 + i).toString()
  );

  const sortedIncomes = useMemo(() => {
    if (!fetchedIncomes) return [];
    type Totals = { internal: number; external: number; total: number };
    const incomesByDate: { [key: string]: Totals } = fetchedIncomes.reduce(
      (acc: { [key: string]: Totals }, income) => {
        const date = income.date.toDate().toISOString().split("T")[0];
        if (!acc[date]) {
          acc[date] = { internal: 0, external: 0, total: 0 };
        }
        if (income.type === "internal") {
          acc[date].internal += income.total;
        } else if (income.type === "external") {
          acc[date].external += income.total;
        }
        acc[date].total += income.total;
        return acc;
      },
      {}
    );

    return Object.entries(incomesByDate)
      .map(([date, totals]) => ({
        date,
        ...totals,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [fetchedIncomes]);

  return (
    <AppLayout>
      <VStack width="95%" mx="auto" height="100%">
        <HStack width="100%">
          <SimpleGrid
            width="100%"
            columns={{ sm: 1, md: 2, xl: 3 }}
            spacing="24px"
          >
            {/* MiniStatistics Card */}
            <Card background="rgba(0,7,81,255)">
              <CardBody>
                <Flex
                  flexDirection="row"
                  align="center"
                  justify="center"
                  w="100%"
                >
                  <Stat me="auto">
                    <StatLabel
                      fontSize="sm"
                      color="gray.400"
                      fontWeight="bold"
                      pb="2px"
                    >
                      Total Sales
                    </StatLabel>
                    <Flex>
                      <StatNumber fontSize="lg" color="#fff">
                        #{totalIncome}
                      </StatNumber>
                    </Flex>
                  </Stat>
                  <IconBox as="box" h={"45px"} w={"45px"} bg="brand.200">
                    <WalletIcon h={"24px"} w={"24px"} color="#fff" />
                  </IconBox>
                </Flex>
              </CardBody>
            </Card>
            {/* MiniStatistics Card */}
            <Card minH="83px" background="rgba(0,7,81,255)">
              <CardBody>
                <Flex
                  flexDirection="row"
                  align="center"
                  justify="center"
                  w="100%"
                >
                  <Stat me="auto">
                    <StatLabel
                      fontSize="sm"
                      color="gray.400"
                      fontWeight="bold"
                      pb="2px"
                    >
                      Production (bags)
                    </StatLabel>
                    <Flex>
                      <StatNumber fontSize="lg" color="#fff">
                        {totalProduction}
                      </StatNumber>
                      {/* <StatHelpText
                        alignSelf="flex-end"
                        justifySelf="flex-end"
                        m="0px"
                        color="green.400"
                        fontWeight="bold"
                        ps="3px"
                        fontSize="md"
                      >
                        +5%
                      </StatHelpText> */}
                    </Flex>
                  </Stat>
                  <IconBox as="box" h={"45px"} w={"45px"} bg="brand.200">
                    <GlobeIcon h={"24px"} w={"24px"} color="#fff" />
                  </IconBox>
                </Flex>
              </CardBody>
            </Card>
            <Card background="rgba(0,7,81,255)">
              <CardBody>
                <Flex
                  flexDirection="row"
                  align="center"
                  justify="center"
                  w="100%"
                >
                  <Stat>
                    <StatLabel
                      fontSize="sm"
                      color="gray.400"
                      fontWeight="bold"
                      pb="2px"
                    >
                      Expenditure
                    </StatLabel>
                    <Flex>
                      <StatNumber fontSize="lg" color="#fff">
                        #{totalExpenses}
                      </StatNumber>
                    </Flex>
                  </Stat>
                  <Spacer />
                  <IconBox as="box" h={"45px"} w={"45px"} bg="brand.200">
                    <DocumentIcon h={"24px"} w={"24px"} color="#fff" />
                  </IconBox>
                </Flex>
              </CardBody>
            </Card>
          </SimpleGrid>
        </HStack>
        <HStack width="100%" height="fit-content">
          {/* <Box
            width="50%"
            height="450px"
            borderRadius="20px"
            backdropFilter="blur(10px)"
            objectFit="cover"
            backgroundImage="url('../../assets/images/bgProfile.webp')"
            backgroundSize="cover"
            backgroundPosition="center"
          >
            <Card
              borderRadius="20px"
              width="100%"
              height="100%"
              background="rgba(0,0,0,0.7)"
            >
              <CardBody>
                <Flex direction="column" mb="45px" w="100%">
                  <Text fontSize="lg" color="#fff" fontWeight="bold" mb="6px">
                    Expenses Overview
                  </Text>
                  <Flex></Flex>
                  <Box
                    // bg="linear-gradient(126.97deg, #060C29 28.26%, rgba(4, 12, 48, 0.5) 91.2%)"
                    borderRadius="20px"
                    display={{ sm: "flex", md: "block" }}
                    justifyContent={{ sm: "center", md: "flex-start" }}
                    alignItems={{ sm: "center", md: "flex-start" }}
                    height="100%"
                    pt={{ sm: "0px", md: "10px" }}
                  >
                    <BarChart
                      barChartOptions={barChartOptionsDashboard}
                      barChartData={barChartDataDashboard}
                    />
                  </Box>
                </Flex>
              </CardBody>
            </Card>
          </Box> */}
          <Box
            width="100%"
            height="450px"
            borderRadius="20px"
            background="rgba(0,7,81,255)"
            pb="10px"
          >
            <Card background="transparent">
              <CardHeader mb="20px" ps="22px">
                <Flex direction="column" alignSelf="flex-start">
                  <Text fontSize="lg" color="#fff" fontWeight="bold" mb="6px">
                    Sales Overview
                  </Text>
                </Flex>
              </CardHeader>
              <Box w="100%" minH={{ sm: "300px" }}>
                {incomeAnalysis && (
                  <LineChart
                    lineChartData={lineChartDataDashboard}
                    lineChartOptions={lineChartOptionsDashboard}
                  />
                )}
              </Box>
            </Card>
          </Box>
        </HStack>
        <VStack
          borderRadius="20px"
          marginTop="20px"
          width="100%"
          background="rgba(0,7,81,255)"
        >
          <Card
            background="transparent"
            p="16px"
            width="100%"
            overflowX={{ sm: "scroll", xl: "hidden" }}
          >
            <CardHeader p="12px 0px 28px 0px">
              <Flex direction="row" justifyContent="space-between">
                <Text fontSize="lg" color="#fff" fontWeight="bold" pb="8px">
                  Monthly Income
                </Text>
              </Flex>
            </CardHeader>
            <Suspense fallback={<div>Loading Table</div>}>
              <Table variant="simple" color="#fff">
                <Thead>
                  <Tr my=".8rem" ps="0px">
                    <Th
                      ps="0px"
                      color="gray.400"
                      fontFamily="Plus Jakarta Display"
                      borderBottomColor="#56577A"
                    >
                      Date
                    </Th>
                    <Th
                      color="gray.400"
                      fontFamily="Plus Jakarta Display"
                      borderBottomColor="#56577A"
                    >
                      Internal
                    </Th>
                    <Th
                      color="gray.400"
                      fontFamily="Plus Jakarta Display"
                      borderBottomColor="#56577A"
                    >
                      External
                    </Th>
                    <Th
                      color="gray.400"
                      fontFamily="Plus Jakarta Display"
                      borderBottomColor="#56577A"
                    >
                      Total
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {sortedIncomes.map((row, index: number) => (
                    <DashboardTableRow
                      key={index}
                      date={row.date}
                      internal={row.internal}
                      external={row.external}
                      total={row.total}
                      lastItem={
                        index === sortedIncomes.length - 1 ? true : false
                      }
                    />
                  ))}
                </Tbody>
              </Table>
            </Suspense>
          </Card>
        </VStack>
      </VStack>
    </AppLayout>
  );
};

export default Dashboard;
