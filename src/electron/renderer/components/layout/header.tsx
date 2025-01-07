import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  HStack,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  VStack,
} from "@chakra-ui/react";
import { FaDownload } from "react-icons/fa";
import {
  deleteIncomeForDateRange,
  Income,
  useAddIncome,
  useGetAllIncomesByType,
} from "../../services/income";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Production,
  useAddProduction,
  useGetProductionsByMonth,
} from "../../services/productions";
import { Expense, useGetAllExpenses } from "../../services/expenses";
import { useGetAllMachineriesByCategory } from "../../services/machineries";
import { randomString } from "../../utils/variables/randomString";
import ProductionTables from "../Tables/productionsTable";
import { Timestamp } from "firebase/firestore";

interface InternalBagsProps {
  date: any;
  external: number;
  rate: number;
  internalIncomes: Income[];
  total: number;
}

const InternalBags: React.FC<InternalBagsProps> = ({
  date,
  rate,
  external,
  internalIncomes,
  total,
}) => {
  const [internalData, setInternalData] = useState<Income[]>();

  useEffect(() => {
    const newData = internalIncomes.filter(
      (internal) =>
        internal.date.toDate().toLocaleDateString() ===
        date.toDate().toLocaleDateString()
    );
    setInternalData(newData);
  }, [internalIncomes, date]);

  return (
    <>
      <Td>
        {internalData && internalData.length > 0
          ? internalData[0].no_of_bags
          : 0}
      </Td>
      <Td>
        {internalData && internalData.length > 0
          ? internalData[0].no_of_bags + external
          : external}
      </Td>
      <Td>{rate || (internalData && internalData[0].no_of_bags)}</Td>
      <Td>
        {internalData && internalData.length > 0
          ? internalData[0].total + total
          : total}
      </Td>
    </>
  );
};

const AppHeader: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const currentYear = new Date().getFullYear().toString();
  const currentMonth = (new Date().getMonth() + 1).toString();
  const [totalKgUsed, setTotalKgUsed] = useState<number>(0);
  const [totalPackingBagsUsed, setTotalPackingBagsUsed] = useState<number>(0);

  const [selectedYear, setSelectedYear] = useState<string>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [totalProductions, setTotalProductions] = useState<number>(0);
  const { expenses, refetch: refetchExpenses } = useGetAllExpenses(
    selectedYear,
    selectedMonth
  );

  const [addIncome, loading, error] = useAddIncome();
  const handleAddIncome = async (income: any) => {
    try {
      await addIncome(income);
    } catch (e) {
      console.error("Error adding income:", e);
    }
  };

  const [sortedOperators, setSortedOperators] = useState<
    {
      operator: string;
      totalQuantity: number;
      totalKgUsed: number;
      totalPackingBagsUsed: number;
    }[]
  >([]);

  // useEffect(() => {
  //   const generateProductions = () => {
  //     const data = [];
  //     const baseDate = new Date("January 1, 2024 01:00:00 UTC+1");

  //     const kg_used_M1 = [
  //       10.73,
  //     ];

  //     const kg_used_M2 = [
  //       20, 18, 15, 25, 22, 19, 17, 28, 23, 26, 21, 24, 27, 30, 32, 29, 35, 38,
  //       40, 42, 45, 48, 50, 55, 58, 60, 65, 68, 70,
  //     ];

  //     const quantity_M1 = [
  //       40, 38, 42, 36, 45, 44, 38, 35, 39, 41, 37, 40, 42, 43, 36, 39, 46, 48,
  //       50, 52, 55, 58, 62, 65, 68, 70, 72, 75, 78,
  //     ];

  //     const quantity_M2 = [
  //       32, 30, 35, 28, 34, 33, 30, 37, 32, 36, 31, 35, 38, 40, 37, 39, 42, 45,
  //       48, 50, 52, 55, 58, 62, 65, 68, 70, 72, 75,
  //     ];

  //     for (let i = 0; i < 29; i++) {
  //       const currentDate = new Date(baseDate);
  //       currentDate.setDate(baseDate.getDate() + i);

  //       const entry_M1 = {
  //         date: currentDate,
  //         id: randomString,
  //         kg_used: kg_used_M1[i],
  //         quantity: quantity_M1[i],
  //         machine: "M1",
  //         operator: "Ajayi Sunday",
  //         packing_bags_used: 10, // Example value
  //         type: "internal", // Example type
  //       };

  //       const entry_M2 = {
  //         date: currentDate,
  //         id: randomString,
  //         kg_used: kg_used_M2[i],
  //         quantity: quantity_M2[i],
  //         machine: "M2",
  //         operator: "Oluseye Segun",
  //         packing_bags_used: 30, // Example value
  //         type: "internal", // Example type
  //       };

  //       data.push(entry_M1, entry_M2);
  //     }

  //     return data;
  //   };

  //   const generatedProductions = generateProductions();
  //   console.log(generateProductions);
  //   // setProductions(generatedProductions);
  // }, []); // Empty depe

  const { incomes: internalIncomes, refetch: refetchInternal } =
    useGetAllIncomesByType("internal", selectedYear, selectedMonth);
  const { incomes: externalIncomes, refetch: refetchExternal } =
    useGetAllIncomesByType("external", selectedYear, selectedMonth);
  const {
    productions,
    loading: loadingProductions,
    error: productionError,
    refetch: refetchProductions,
  } = useGetProductionsByMonth(selectedYear, selectedMonth);

  const { machineries, refetch: refetchTrucks } =
    useGetAllMachineriesByCategory("trucks");

  const [externalIncomeByDriver, setExternalIncomeByDriver] = useState<
    { driver: string; totalIncome: number; totalBags: number }[]
  >([]);

  const [totalSalesByTruck, setTotalSalesByTruck] = useState<
    { truck: string; totalSales: number; totalBags: number }[]
  >([]);

  const [totalInternalSales, setTotalInternalSales] = useState<number>(0);
  const [totalExternalSales, setTotalExternalSales] = useState<number>(0);

  const [machineStats, setMachineStats] = useState<
    { machine: string; totalKgUsed: number; totalPackingBagsUsed: number }[]
  >([]);

  const formatNumber: any = (number: number) => {
    return number.toLocaleString("en-US");
  };

  useEffect(() => {
    if (productions) {
      const machineData = productions.reduce(
        (
          acc: {
            [key: string]: {
              totalKgUsed: number;
              totalPackingBagsUsed: number;
            };
          },
          production
        ) => {
          production.data.forEach((item) => {
            const { machine, kg_used, packing_bags_used } = item;
            if (machine) {
              if (!acc[machine])
                acc[machine] = { totalKgUsed: 0, totalPackingBagsUsed: 0 };
              acc[machine].totalKgUsed += parseInt(kg_used.toString(), 10);
              acc[machine].totalPackingBagsUsed += parseInt(
                packing_bags_used.toString(),
                10
              );
            }
          });
          return acc;
        },
        {}
      );

      const formattedData = Object.keys(machineData).map((machine) => ({
        machine,
        totalKgUsed: machineData[machine].totalKgUsed,
        totalPackingBagsUsed: machineData[machine].totalPackingBagsUsed,
      }));

      setMachineStats(formattedData);
    }
  }, [productions]);

  useEffect(() => {
    const truck452Sales = [
      "",
      "516",
      "",
      "528",
      "528",
      "528",
      "528",
      "",
      "528",
      "528",
      "460",
      "480",
      "400",
      "475",
      "",
      "489",
      "",
      "528",
      "526",
      "",
      "528",
      "",
      "524",
      "",
      "527",
      "",
      "528",
      "528",
      "",
      "528",
    ];

    const truck652Sales = [
      "",
      "528",
      "528",
      "",
      "528",
      "528",
      "528",
      "",
      "528",
      "",
      "528",
      "",
      "528",
      "497",
      "",
      "527",
      "402",
      "",
      "528",
      "",
      "862",
      "",
      "426",
      "528",
      "",
      "528",
      "528",
      "528",
      "",
      "528",
    ];

    const internalSales = [
      "",
      "25",
      "3",
      "9",
      "6",
      "3",
      "10",
      "",
      "22",
      "3",
      "18",
      "1",
      "2",
      "2",
      "7",
      "",
      "7",
      "7",
      "",
      "",
      "28",
      "8",
      "",
      "12",
      "",
      "",
      "2",
      "12",
      "6",
      "",
      "14",
    ];

    const rate = 250; // Constant rate
    const driver = "Tajudeen Hamzat"; // Constant driver

    // Function to calculate the number of days in a month
    const getDaysInMonth = (month: number, year: number): number =>
      new Date(year, month, 0).getDate();

    /**
     * Generates a Firebase Timestamp from a given day, month, and year.
     * @param day - The day of the month (1-31).
     * @param month - The month of the year (1-12).
     * @param year - The year (e.g., 2024).
     * @returns A Firebase Timestamp representing the date.
     */
    const generateDate = (
      day: number,
      month: number,
      year: number
    ): Timestamp => {
      const date = new Date(year, month - 1, day); // Month is 0-indexed
      return Timestamp.fromDate(date); // Converts JavaScript Date to Firebase Timestamp
    };
    const generateData = () => {
      const year = 2024;
      const month = 9; // July
      const daysInMonth = getDaysInMonth(month, year);
      const batchData = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const index = day - 1; // Array index (0-based)

        // Internal sales
        const internalBags = Number(internalSales[index]) || 0; // Default to 0 if no value exists
        const internalTotal = internalBags * rate;
        batchData.push({
          type: "internal",
          no_of_bags: internalBags,
          rate,
          total: internalTotal,
          date: generateDate(day, month, year),
          driver,
        });

        // External sales combining truck 652 and 452
        const bags652 = Number(truck652Sales[index]) || 0; // Default to 0 if no value exists
        const bags452 = Number(truck452Sales[index]) || 0; // Default to 0 if no value exists
        const totalBags = bags652 + bags452;
        const externalTotal = totalBags * rate;

        batchData.push({
          type: "external",
          no_of_bags: totalBags,
          rate,
          total: externalTotal,
          date: generateDate(day, month, year),
          driver,
          bags_by_truck: [
            { truck: "652", bags: bags652 },
            { truck: "452", bags: bags452 },
          ],
        });
      }

      // const result = batchData.map((data, index) => handleAddIncome(data));
      // console.log("Generated Batch Data:", result);
    };

    generateData();
  }, []);

  useEffect(() => {
    if (internalIncomes) {
      const internalTotal = internalIncomes.reduce(
        (total, income) => total + income.total,
        0
      );
      setTotalInternalSales(internalTotal);
    }
  }, [internalIncomes]);

  useEffect(() => {
    if (externalIncomes) {
      const externalTotal = externalIncomes.reduce(
        (total, income) => total + income.total,
        0
      );

      const incomeByDriver = externalIncomes.reduce(
        (acc: any, income: Income) => {
          if (income.driver) {
            const existingDriver = acc.find(
              (item: any) => item.driver === income.driver
            );
            if (existingDriver) {
              existingDriver.totalIncome += income.total;
              existingDriver.totalBags += income.no_of_bags;
            } else {
              acc.push({
                driver: income.driver,
                totalIncome: income.total,
                totalBags: income.no_of_bags,
              });
            }
          }
          return acc;
        },
        []
      );

      const salesByTruck = externalIncomes.reduce(
        (acc: any, income: Income) => {
          if (income.bags_by_truck) {
            income.bags_by_truck.forEach((truckObj) => {
              const existingTruck = acc.find(
                (item: any) => item.truck === truckObj.truck
              );
              if (existingTruck) {
                existingTruck.totalSales += income.rate * truckObj.bags;
                existingTruck.totalBags += truckObj.bags;
              } else {
                acc.push({
                  truck: truckObj.truck,
                  totalSales: truckObj.bags * income.rate,
                  totalBags: truckObj.bags,
                });
              }
            });
          }
          return acc;
        },
        []
      );

      setTotalSalesByTruck(salesByTruck);
      setExternalIncomeByDriver(incomeByDriver);
      setTotalExternalSales(externalTotal);
    }
  }, [externalIncomes]);

  useEffect(() => {
    if (productions) {
      const operatorData = productions.reduce(
        (
          acc: {
            [key: string]: {
              totalQuantity: number;
              totalKgUsed: number;
              totalPackingBagsUsed: number;
            };
          },
          production
        ) => {
          production.data.forEach((item) => {
            const { operator, quantity, kg_used, packing_bags_used } = item;
            if (operator) {
              if (!acc[operator]) {
                acc[operator] = {
                  totalQuantity: 0,
                  totalKgUsed: 0,
                  totalPackingBagsUsed: 0,
                };
              }
              acc[operator].totalQuantity += parseInt(quantity.toString(), 10);
              acc[operator].totalKgUsed += parseInt(kg_used.toString(), 10);
              acc[operator].totalPackingBagsUsed += parseInt(
                packing_bags_used.toString(),
                10
              );
            }
          });
          return acc;
        },
        {}
      );

      const sortedOperators = Object.keys(operatorData)
        .map((operator) => ({
          operator,
          totalQuantity: operatorData[operator].totalQuantity,
          totalKgUsed: operatorData[operator].totalKgUsed,
          totalPackingBagsUsed: operatorData[operator].totalPackingBagsUsed,
        }))
        .sort((a, b) => b.totalQuantity - a.totalQuantity);

      setSortedOperators(sortedOperators);

      const totalKgUsed = productions.reduce(
        (total, production) =>
          total +
          production.data.reduce(
            (sum, item) => sum + parseInt(item.kg_used.toString(), 10),
            0
          ),
        0
      );

      const totalPackingBagsUsed = productions.reduce(
        (total, production) =>
          total +
          production.data.reduce(
            (sum, item) =>
              sum + parseInt(item.packing_bags_used.toString(), 10),
            0
          ),
        0
      );

      setTotalKgUsed(totalKgUsed);
      setTotalPackingBagsUsed(totalPackingBagsUsed);
    }
  }, [productions]);

  useEffect(() => {
    if (productions) {
      const externalTotal = productions.reduce(
        (quantity, production) =>
          quantity +
          production.data.reduce(
            (sum, item) => sum + parseInt(item.quantity.toString(), 10),
            0
          ),
        0
      );
      setTotalProductions(externalTotal);
    }
  }, [productions]);

  useEffect(() => {
    refetchInternal();
    refetchExternal();
    refetchProductions();
    refetchExpenses();
  }, [selectedYear, selectedMonth]);

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(event.target.value);
  };

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(event.target.value);
  };

  const formattedExpenses = useMemo(() => {
    if (!expenses) return [];

    return expenses.reduce((acc: any, expense: Expense) => {
      const index = acc.findIndex((item: any) => item.type === expense.type);
      if (index !== -1) {
        acc[index].expenses_data.push(expense);
        acc[index].total =
          parseInt(acc[index].total) + parseInt(expense.total.toString());
      } else {
        acc.push({
          type: expense.type,
          expenses_data: [expense],
          total: expense.total,
        });
      }
      return acc;
    }, []);
  }, [expenses]);

  const totalExpense = useMemo(() => {
    let total = 0;
    formattedExpenses.forEach((item: any) => {
      total += parseInt(item.total);
    });
    return total;
  }, [formattedExpenses]);

  const generatePDF = (
    selectedMonth: string,
    selectedYear: string,
    expenses: { type: string; expenses_data: any[]; total: number }[]
  ) => {
    const doc: any = new jsPDF();
    let currentY = 10;

    try {
      const pageWidth = doc.internal.pageSize.getWidth();
      const marginX = 10;

      const logoSrc = "../../assets/images/background-body-admin.jpeg";
      const logoSize = 20;
      const logoX = marginX; // Left margin
      const logoY = currentY;

      doc.setDrawColor(0);
      doc.setFillColor(255, 255, 255);
      doc.circle(
        logoX + logoSize / 2,
        logoY + logoSize / 2,
        logoSize / 2,
        "FD"
      );

      doc.addImage(logoSrc, "PNG", logoX, logoY, logoSize, logoSize);

      const addSmallLogo = () => {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const smallLogoSize = 15;
        const smallLogoX = pageWidth - smallLogoSize - marginX;
        const smallLogoY = pageHeight - smallLogoSize - 5;
        doc.addImage(
          logoSrc,
          "PNG",
          smallLogoX,
          smallLogoY,
          smallLogoSize,
          smallLogoSize
        );
      };

      const addressX = logoX + logoSize + 10;
      const addressY = currentY + 5;
      doc.setFontSize(10);
      doc.setFont("Helvetica", "bold");
      doc.text("ADF TABLE WATER", addressX, addressY);
      doc.setFontSize(8);
      doc.setFont("Helvetica", "normal");
      doc.text(
        "ADDRESS: El-DESIGN HOME NIGERIA LIMITED, KM25, BESIDE NNPC MEGA STATION,\nALONG IWO/OJOO EXPRESSWAY, IBADAN, OYO STATE.",
        addressX,
        addressY + 5
      );
      doc.text(
        "PHONE: +2348108511609, +2348101672974, +2347036485800| Email: adfwater@gmail.com",
        addressX,
        addressY + 12
      );

      currentY += logoSize + 2;
      doc.setDrawColor(0);
      doc.setLineWidth(0.1);
      doc.line(marginX, currentY, pageWidth - marginX, currentY);

      currentY += 8;

      doc.setFontSize(16);
      doc.setFont("Helvetica", "bold");
      doc.text(
        `ADF TABLE WATER MONTHLY REPORT - ${new Date(
          0,
          parseInt(selectedMonth) - 1
        )
          .toLocaleString("default", {
            month: "long",
          })
          .toUpperCase()} ${selectedYear.toUpperCase()}`,
        marginX,
        currentY
      );

      currentY += 1;

      // **Content: External Sales Table**
      const externalTable = document.getElementById(
        "external-sales-table"
      ) as HTMLTableElement | null;
      if (externalTable) {
        if (externalTable.rows.length > 0) {
          autoTable(doc, { html: externalTable, startY: currentY + 10 });
          currentY = doc.lastAutoTable.finalY + 5;
        } else {
          doc.text("No data available for All Sales.", marginX, currentY + 10);
          currentY += 5;
        }
      }

      // Sales by Drivers Table
      const externalTableDriver = document.getElementById(
        "external-sales-driver"
      ) as HTMLTableElement | null;
      if (externalTableDriver) {
        // doc.text("SALES BY DRIVERS", marginX, currentY);
        if (externalTableDriver.rows.length > 0) {
          autoTable(doc, { html: externalTableDriver, startY: currentY + 10 });
          currentY = doc.lastAutoTable.finalY + 5;
        } else {
          doc.text("No data available for Drivers.", marginX, currentY + 10);
          currentY += 5;
        }
      }

      // Sales by Trucks Table
      const externalTableTruck = document.getElementById(
        "external-sales-truck"
      ) as HTMLTableElement | null;
      if (externalTableTruck) {
        // doc.text("SALES BY TRUCKS", marginX, currentY);
        if (externalTableTruck.rows.length > 0) {
          autoTable(doc, { html: externalTableTruck, startY: currentY + 10 });
          currentY = doc.lastAutoTable.finalY + 20;
        } else {
          doc.text("No data available for Trucks.", marginX, currentY + 10);
          currentY += 5;
        }
      }

      // Production Tables
      const machines = [
        ...new Set(
          productions?.flatMap((prod) =>
            prod.data.map((entry) => entry.machine)
          )
        ),
      ];
      // doc.text("PRODUCTIONS DATA", 10, currentY);
      machines.forEach((machine) => {
        const productionTable = document.getElementById(
          `productions-table-${machine}`
        ) as HTMLTableElement | null;
        if (productionTable) {
          // doc.text(`Production Data for ${machine}`, 10, currentY);
          autoTable(doc, {
            html: productionTable,
            startY: currentY + 10,
          });
          currentY = doc.lastAutoTable.finalY + 10;
        } else {
          doc.text(
            `Production table for machine "${machine}" is missing.`,
            10,
            currentY
          );
          currentY += 5;
        }
      });

      // **Machine Summary Table**
      const machineSummaryTable = document.getElementById(
        "machine-summary-section"
      ) as HTMLTableElement | null;
      if (machineSummaryTable) {
        if (machineSummaryTable?.rows?.length > 0) {
          autoTable(doc, { html: machineSummaryTable, startY: currentY + 10 });
          currentY = doc.lastAutoTable.finalY + 10;
        } else {
          doc.text("No data available for Machine Summary.", 10, currentY + 10);
          currentY += 5;
        }
      } else {
        doc.text("Productions table is missing.", 10, currentY);
        currentY += 5;
      }

      // **Operator Summary Table**
      const operatorSummaryTable = document.getElementById(
        "operator-summary-section"
      ) as HTMLTableElement | null;
      if (operatorSummaryTable) {
        // doc.text("PRODUCTION DATA FOR EACH OPERATOR", 5, currentY);
        if (operatorSummaryTable?.rows?.length > 0) {
          autoTable(doc, { html: operatorSummaryTable, startY: currentY + 10 });
          currentY = doc.lastAutoTable.finalY + 20;
        } else {
          doc.text(
            "No data available for Operator Summary.",
            10,
            currentY + 10
          );
          currentY += 5;
        }
      } else {
        doc.text("Production Summary table is missing.", 10, currentY);
        currentY += 5;
      }

      const staffExpensesTable = document.getElementById(
        "staff-expenses-table"
      ) as HTMLTableElement | null;
      if (staffExpensesTable) {
        if (staffExpensesTable.rows.length > 0) {
          doc.setFontSize(12);
          doc.setFont("Helvetica", "bold");
          autoTable(doc, { html: staffExpensesTable, startY: currentY + 15 });
          currentY = doc.lastAutoTable.finalY + 10;
        } else {
          doc.text(
            "No data available for Staff Expenses.",
            marginX,
            currentY + 10
          );
          currentY += 5;
        }
      }

      // Expenses Tables
      if (expenses?.length > 0) {
        expenses.forEach((expense, index) => {
          // doc.text(`EXPENSES ON ${expense.type}`, marginX, currentY);
          const expenseTable = document.getElementById(
            `expenses-table-${index}`
          ) as HTMLTableElement | null;

          if (expenseTable) {
            if (expenseTable.rows.length > 0) {
              autoTable(doc, { html: expenseTable, startY: currentY + 10 });
              currentY = doc.lastAutoTable.finalY + 20;
            } else {
              doc.text(
                `No data available for ${expense.type}.`,
                marginX,
                currentY + 10
              );
              currentY += 5;
            }
          }
        });
      }

      // Summary Section
      const summarySection = document.getElementById("summary-section");
      if (summarySection) {
        const summaryText = String(
          summarySection.innerText || "No summary available."
        );
        doc.setFontSize(10);
        doc.text(summaryText, marginX, currentY + 10);
        currentY += 70;
      }

      if (formattedExpenses && formattedExpenses.length > 0) {
        currentY += 10; // Add spacing before the summary
        doc.setFontSize(12);
        doc.setFont("Helvetica", "bold");
        doc.text("Summary of All Expenses", marginX, currentY);
        currentY += 10; // Move down for the text content

        doc.setFontSize(10);
        doc.setFont("Helvetica", "normal");

        // Iterate over formattedExpenses and list each expense
        formattedExpenses.forEach((expense: any, index: any) => {
          const summaryText = `Total Expense on ${expense.type} = #${formatNumber(expense.total)}`;
          if (currentY + 10 > doc.internal.pageSize.getHeight()) {
            // Add a new page if needed
            doc.addPage();
            currentY = 10; // Reset to the top of the new page
          }
          doc.text(summaryText, marginX, currentY, {
            maxWidth: pageWidth - 2 * marginX,
          });
          currentY += 10; // Add spacing after each line
        });

        currentY += 20; // Add extra spacing after the summary section
      } else {
        console.log("No formatted expenses available.");
      }

      // Profit Section
      const profitWrapper = document.getElementById("profit-wrapper");
      if (profitWrapper) {
        doc.setFontSize(12);
        doc.text("PROFIT SUMMARY", marginX, currentY);
        doc.setFontSize(10);
        const profitText = String(
          profitWrapper.innerText || "No profit summary available."
        );
        doc.text(profitText, marginX, currentY + 10);
        currentY += 30;
      }

      const pageCount = doc.getNumberOfPages();
      for (let i = 2; i <= pageCount; i++) {
        doc.setPage(i); // Move to the page
        addSmallLogo(); // Add the logo
      }

      // Save the PDF
      const filename = `ADF - ${new Date(
        0,
        parseInt(selectedMonth) - 1
      ).toLocaleString("default", {
        month: "long",
      })}_${selectedYear}_Monthly_Report.pdf`;
      doc.save(filename);

      console.log("PDF generated successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <>
      <HStack
        position="relative"
        width="100%"
        height="120px"
        alignItems="center"
        mx="auto"
        px="30px"
        justifyContent="space-between"
        marginBottom="2rem"
        zIndex={100}
      >
        <Text fontSize="28px" color="#fff" fontWeight="bold">
          Dashboard
        </Text>
        <Button
          onClick={onOpen}
          type="button"
          bg="rgba(0,7,81,255)"
          textAlign="center"
          color="#fff"
          border="none"
        >
          <FaDownload color="#fff" fontSize="20px" />{" "}
          <Text pl="10px">Download</Text>
        </Button>
      </HStack>

      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <ModalOverlay />
        <ModalContent
          width="93vw"
          maxWidth="93vw"
          backdropBlur="10px"
          borderRadius="15px"
          color="#fff"
          bg="linear-gradient(111.84deg, rgba(6, 11, 38, 1) 59.3%, rgba(26, 31, 55, 1) 100%)"
        >
          <ModalHeader display={"flex"} justifyContent={"space-between"}>
            <Text>OverView </Text>
            <>
              <Button colorScheme="blue" mr={3} onClick={onClose}>
                Close
              </Button>
              <Button
                onClick={() =>
                  generatePDF(selectedMonth, selectedYear, formattedExpenses)
                }
                type="button"
                bg="rgba(0,7,81,255)"
                textAlign="center"
                color="#fff"
                border="none"
              >
                <FaDownload color="#fff" fontSize="20px" />{" "}
                <Text pl="10px">Download</Text>
              </Button>
            </>
          </ModalHeader>
          {/* <ModalCloseButton /> */}
          <ModalBody>
            <VStack alignItems="flex-start" spacing={4} mb={4}>
              <HStack spacing={4}>
                <Select
                  placeholder="Select Year"
                  value={selectedYear}
                  onChange={handleYearChange}
                >
                  {Array.from(
                    { length: 10 },
                    (_, i) => new Date().getFullYear() - i
                  ).map((year) => (
                    <option key={year} value={year.toString()}>
                      {year}
                    </option>
                  ))}
                </Select>
                <Select
                  placeholder="Select Month"
                  value={selectedMonth}
                  onChange={handleMonthChange}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={month.toString()}>
                      {new Date(0, month - 1).toLocaleString("default", {
                        month: "long",
                      })}
                    </option>
                  ))}
                </Select>
              </HStack>
            </VStack>

            <Text
              fontSize="xl"
              mb="4"
              fontWeight="bolder"
              textTransform="uppercase"
            >
              General Overview of Income, Expenses and Production for{" "}
              {new Date(0, parseInt(selectedMonth) - 1).toLocaleString(
                "default",
                {
                  month: "long",
                }
              )}
              -{selectedYear}
            </Text>

            <Table marginTop="40px" variant="simple" id="external-sales-table">
              <Thead>
                <Tr>
                  <Th
                    colSpan={5}
                    style={{
                      textAlign: "left",
                      fontWeight: "bold",
                      fontSize: "1.2em",
                    }}
                  >
                    EXTERNAL AND INTERNAL SALES
                  </Th>
                </Tr>
                <Tr>
                  <Th>
                    <b>Date</b>
                  </Th>
                  {/* <Th>
                    <b>Driver</b>
                  </Th> */}
                  {machineries?.map((machine) => (
                    <Th>
                      <b>{machine.model}</b>
                    </Th>
                  ))}
                  <Th>
                    <b>Internal</b>
                  </Th>
                  <Th>
                    <b>Total Bags</b>
                  </Th>

                  <Th>
                    <b>Rate</b>
                  </Th>
                  <Th>
                    <b>Total Amount</b>
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {externalIncomes?.map((income: Income) => (
                  <Tr key={income.id}>
                    <Td>{income.date.toDate().toLocaleDateString()}</Td>
                    {/* <Td>{income.driver || "N/A"}</Td> */}
                    {machineries?.map((machine) => (
                      <Th>
                        {
                          income?.bags_by_truck?.find(
                            (truck) => truck?.truck === machine.model
                          )?.bags
                        }
                      </Th>
                    ))}
                    <InternalBags
                      date={income.date}
                      external={income.no_of_bags}
                      rate={income.rate}
                      total={income.total}
                      internalIncomes={internalIncomes ? internalIncomes : []}
                    />
                  </Tr>
                ))}
                {externalIncomes?.length === 0 && (
                  <Tr>
                    <Td>No Sales for this month</Td>
                  </Tr>
                )}
              </Tbody>
            </Table>

            <VStack>
              <Table
                marginTop="40px"
                variant="simple"
                id="external-sales-driver"
              >
                <Thead>
                  <Tr>
                    <Th
                      colSpan={5}
                      style={{
                        textAlign: "left",
                        fontWeight: "bold",
                        fontSize: "1.2em",
                      }}
                    >
                      TOTAL SALES BY EACH DRIVER
                    </Th>
                  </Tr>
                  <Tr>
                    <Th>Driver</Th>
                    <Th>Total Bags</Th>
                    <Th>Income</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {externalIncomeByDriver?.map((income, index: number) => (
                    <Tr key={index}>
                      <Td>{income.driver}</Td>
                      <Td>{formatNumber(income.totalBags)}</Td>
                      <Td>{formatNumber(income.totalIncome)}</Td>
                    </Tr>
                  ))}
                  {externalIncomeByDriver?.length === 0 && (
                    <Tr>
                      <Td>No sales redcorded.</Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </VStack>

            <VStack>
              <Table
                marginTop="40px"
                variant="simple"
                id="external-sales-truck"
              >
                <Thead>
                  <Tr>
                    <Th
                      colSpan={5}
                      style={{
                        textAlign: "left",
                        fontWeight: "bold",
                        fontSize: "1.2em",
                      }}
                    >
                      TOTAL SALES BY EACH TRUCK
                    </Th>
                  </Tr>
                  <Tr>
                    <Th>Truck</Th>
                    <Th>Total Bags</Th>
                    <Th>Income</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {totalSalesByTruck?.map((sale, index: number) => (
                    <Tr key={index}>
                      <Td>{sale.truck}</Td>
                      <Td>{formatNumber(sale.totalBags)}</Td>
                      <Td>{formatNumber(sale.totalSales)}</Td>
                    </Tr>
                  ))}
                  {totalSalesByTruck?.length === 0 && (
                    <Tr>
                      <Td>No sales redcorded.</Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </VStack>

            <Text fontSize="xl" fontWeight="bold" marginTop="2rem">
              SUMMARY
            </Text>
            <br />
            <VStack alignItems="flex-start" id="summary-section">
              <HStack justifyContent="flex-start">
                <Text fontWeight="bolder">Total Internal Income: </Text>
                <Text>{formatNumber(totalInternalSales)}</Text>
              </HStack>
              <HStack justifyContent="flex-start">
                <Text fontWeight="bolder">Total External Income:</Text>
                <Text>{formatNumber(totalExternalSales)}</Text>
              </HStack>
              <HStack justifyContent="flex-start">
                <Text fontWeight="bolder">
                  Total Internal Income + Total External Income:
                </Text>
                <Text>
                  {formatNumber(totalExternalSales + totalInternalSales)}
                </Text>
              </HStack>
            </VStack>

            <ProductionTables productions={productions ? productions : []} />
            <br />
            <VStack align="start" spacing={4}>
              <Table
                marginTop="40px"
                variant="simple"
                id="operator-summary-section"
              >
                <Thead>
                  <Tr>
                    <Th
                      colSpan={5}
                      style={{
                        textAlign: "left",
                        fontWeight: "bold",
                        fontSize: "1.2em",
                      }}
                    >
                      SUMMARY OF BAGS OF WATER PRODUCED BY EACH OPERATOR
                    </Th>
                  </Tr>
                  <Tr>
                    <Th>Operator</Th>
                    <Th>Total Quantity</Th>
                    <Th>Total Kg Used</Th>
                    {/* <Th>Total Packing Bags Used</Th> */}
                  </Tr>
                </Thead>
                <Tbody>
                  {sortedOperators.map((operatorData) => (
                    <Tr key={operatorData.operator}>
                      <Td>{operatorData.operator}</Td>
                      <Td>{formatNumber(operatorData.totalQuantity)}</Td>
                      <Td>{formatNumber(operatorData.totalKgUsed)}</Td>
                      {/* <Td>{formatNumber(operatorData.totalPackingBagsUsed)}</Td> */}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </VStack>

            <br />
            <VStack align="start" spacing={4}>
              <Table
                marginTop="40px"
                variant="simple"
                id="machine-summary-section"
              >
                <Thead>
                  <Tr>
                    <Th
                      colSpan={5}
                      style={{
                        textAlign: "left",
                        fontWeight: "bold",
                        fontSize: "1.2em",
                      }}
                    >
                      TOTAL KG AND PACKING BAGS USED
                    </Th>
                  </Tr>
                  <Tr>
                    <Th>Machine</Th>
                    <Th>Total Kg Used</Th>
                    {/* <Th>Total Packing Bags Used</Th> */}
                  </Tr>
                </Thead>
                <Tbody>
                  {machineStats.map((machineData) => (
                    <Tr key={machineData.machine}>
                      <Td>{machineData.machine}</Td>
                      <Td>{formatNumber(machineData.totalKgUsed)}</Td>
                      {/* <Td>{formatNumber(machineData.totalPackingBagsUsed)}</Td> */}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </VStack>

            <Text fontSize="xl" fontWeight="bold" marginTop="2rem">
              Summary
            </Text>
            <br />
            <VStack alignItems="flex-start" id="production-summary-section">
              <HStack justifyContent="flex-start">
                <Text fontWeight="bolder">
                  Total Production: {totalProductions}
                </Text>
              </HStack>
              <Text fontSize="md">Total Kg Used: {totalKgUsed}</Text>
              <Text fontSize="md">
                Total Packing Bags Used: {totalPackingBagsUsed}
              </Text>
            </VStack>
            <br />
            <Text fontWeight="bolder" mt="20px" fontSize="xl" mb="4">
              Expenses for the month:
            </Text>
            <Table
              marginTop="40px"
              variant="simple"
              id={`staff-expenses-table`}
            >
              <Thead>
                <Tr>
                  <Th
                    colSpan={5}
                    style={{
                      textAlign: "center",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      fontSize: "1.2em",
                    }}
                  >
                    STAFF EXPENSES
                  </Th>
                </Tr>
                <Tr>
                  <Th>Date</Th>
                  <Th>Employee</Th>
                  <Th>Description</Th>
                  <Th>Total</Th>
                </Tr>
              </Thead>
              <Tbody>
                {formattedExpenses.map((category: any, index: any) => {
                  const staffExpenses = category.expenses_data?.filter(
                    (expense: Expense) => expense.reciever // Filter out only staff expenses
                  );

                  // If there are staff expenses, map them into rows.
                  return staffExpenses.map((expense: Expense) => (
                    <Tr key={expense.id}>
                      <Td>{expense?.date?.toDate().toLocaleDateString()}</Td>
                      {expense.item && <Td>{expense.item}</Td>}
                      {expense.reciever && <Td>{expense.reciever}</Td>}
                      {expense.type && <Td>{expense.type}</Td>}
                      <Td>{expense.total}</Td>
                    </Tr>
                  ));
                })}
              </Tbody>
            </Table>

            {formattedExpenses.map((category: any, index: any) => {
              const NonestaffExpenses = category.expenses_data?.filter(
                (expense: Expense) => !expense.reciever // Only non-staff expenses
              );

              // Skip rendering the table if there are no non-staff expenses
              if (!NonestaffExpenses || NonestaffExpenses.length === 0) {
                return null; // Skip rendering for empty data
              }

              return (
                <React.Fragment key={index}>
                  <Table
                    marginTop="40px"
                    variant="simple"
                    id={`expenses-table-${index}`}
                  >
                    <Thead>
                      <Tr>
                        <Th
                          colSpan={5}
                          style={{
                            textAlign: "center",
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            fontSize: "1.2em",
                          }}
                        >
                          {`TOTAL AMOUNT SPENT ON ${NonestaffExpenses[0]?.type}`}
                        </Th>
                      </Tr>
                      <Tr>
                        <Th>Date</Th>
                        {NonestaffExpenses?.some(
                          (expense: Expense) => expense.item
                        ) && <Th>Item</Th>}
                        {NonestaffExpenses?.some(
                          (expense: Expense) => expense.reciever
                        ) && <Th>Employee</Th>}
                        {NonestaffExpenses?.some(
                          (expense: Expense) => expense.quantity
                        ) && <Th>Quantity</Th>}
                        {NonestaffExpenses?.some(
                          (expense: Expense) => expense.rate
                        ) && <Th>Rate</Th>}
                        <Th>Total</Th>
                      </Tr>
                    </Thead>

                    <Tbody>
                      {NonestaffExpenses.map((expense: Expense) => (
                        <Tr key={expense.id}>
                          <Td>
                            {expense?.date?.toDate().toLocaleDateString()}
                          </Td>
                          {expense.item === "others" ? (
                            expense.description
                          ) : (
                            <Td>{expense.item}</Td>
                          )}
                          {expense.reciever && <Td>{expense.reciever}</Td>}
                          {expense.quantity && <Td>{expense.quantity}</Td>}
                          {expense.rate && <Td>{expense.rate}</Td>}
                          <Td>{expense.total}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </React.Fragment>
              );
            })}

            {formattedExpenses.length > 0 && (
              <Text fontWeight="bolder" mt="20px" fontSize="xl" mb="4">
                SUMMARY OF ALL EXPENSES:
                <br />
              </Text>
            )}

            <VStack alignItems="flex-start" id="expense-summary">
              {Array.from({ length: formattedExpenses.length }).map(
                (_, index: number) => (
                  <React.Fragment key={index}>
                    <Text>
                      Total Expense on {formattedExpenses[index].type} = #
                      {formatNumber(formattedExpenses[index].total)}
                    </Text>
                  </React.Fragment>
                )
              )}
            </VStack>

            <HStack id="profit-wrapper" mt={"20px"}>
              <Text fontWeight="bolder" fontSize="20px">
                Difference (Total income - Total Expense ):
              </Text>
              <Text>
                #{" "}
                {formatNumber(
                  totalExternalSales + totalInternalSales - totalExpense
                )}
              </Text>
            </HStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={() =>
                generatePDF(selectedMonth, selectedYear, formattedExpenses)
              }
              type="button"
              bg="rgba(0,7,81,255)"
              textAlign="center"
              color="#fff"
              border="none"
            >
              <FaDownload color="#fff" fontSize="20px" />{" "}
              <Text pl="10px">Download</Text>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AppHeader;
