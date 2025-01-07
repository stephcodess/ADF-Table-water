import {
  Button,
  Card,
  CardBody,
  CardHeader,
  HStack,
  Table,
  Tbody,
  Th,
  Thead,
  Tr,
  useDisclosure,
  VStack,
  Text,
  useToast,
  Td,
  Select,
  Spinner,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import AppLayout from "../../../components/layout/appLayout";
import React from "react";
import { FaPlus } from "react-icons/fa";
import AddIncomeModal from "../../../components/modals/income/addIncome";
import {
  Income,
  useDeleteIncome,
  useGetAllIncomesByType,
} from "../../../services/income";
import { DeleteIncomeModal } from "../../../components/modals/income/deleteIncome";
import IncomesTableRow from "../../../components/Tables/incomeTableRow";

const ExternalIncome: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear().toString();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, "0");

  const [selectedYear, setSelectedYear] = useState<string>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);

  const { incomes, loading, error, refetch }: any = useGetAllIncomesByType(
    "external",
    selectedYear,
    selectedMonth
  );

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIncomes, setSelectedIncomes] = useState<string[]>([]); // Batch selection state

  const [deleteIncome, deleting, deleteError] = useDeleteIncome();

  const {
    isOpen: isDeleteModalOpen,
    onOpen: onOpenDeleteModal,
    onClose: onCloseDeleteModal,
  } = useDisclosure();
  const toast = useToast();
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (success) {
      refetch();
      onClose();
      toast({
        title: "Income deleted.",
        status: "success",
        duration: 3000,
        position: "top-right",
        isClosable: true,
      });
      setSuccess(false); // Reset success state
    } else if (deleteError) {
      toast({
        title: "Error deleting income details.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [success, deleteError, refetch, onClose, toast]);

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await deleteIncome(id);
      setSuccess(true);
    } catch (error) {
      console.error("Error deleting income:", error);
      setSuccess(false);
    }
  };

  const handleBulkDelete = async (): Promise<void> => {
    try {
      if (selectedIncomes.length > 0) {
        await Promise.all(selectedIncomes.map((id) => deleteIncome(id)));
        setSelectedIncomes([]); // Clear the selected incomes
        setSuccess(true);
      } else {
        toast({
          title: "No items selected.",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error deleting selected incomes:", error);
      toast({
        title: "Error deleting selected incomes.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <AppLayout>
      <DeleteIncomeModal
        handleDelete={handleBulkDelete} // Bulk delete handler
        isOpen={isDeleteModalOpen}
        deleting={deleting}
        onClose={onCloseDeleteModal}
      />
      <AddIncomeModal
        refetch={refetch}
        type="external"
        isOpen={isOpen}
        onClose={onClose}
      />
      <VStack width="95%" m="auto" marginBottom="20px">
        <HStack
          width="100%"
          height="100px"
          justifyContent="space-between"
          display="flex"
          flexDir="row"
        >
          <HStack>
            <Select
              placeholder="Select Year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {Array.from(
                { length: Number(currentYear) - 2020 + 1 },
                (_, i) => (Number(currentYear) - i).toString()
              ).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Select>
            <Select
              placeholder="Select Month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {Array.from({ length: 12 }, (_, i) =>
                (i + 1).toString().padStart(2, "0")
              ).map((month) => (
                <option key={month} value={month}>
                  {new Date(0, Number(month) - 1).toLocaleString("default", {
                    month: "long",
                  })}
                </option>
              ))}
            </Select>
          </HStack>
          <HStack>
            <Button
              colorScheme="red"
              onClick={() => {
                if (selectedIncomes.length > 0) {
                  onOpenDeleteModal(); // Open confirmation modal for bulk delete
                } else {
                  toast({
                    title: "No items selected.",
                    status: "info",
                    duration: 3000,
                    isClosable: true,
                  });
                }
              }}
            >
              Delete Selected
            </Button>
            <Button
              onClick={onOpen}
              type="button"
              bg="rgba(0,7,81,255)"
              textAlign="center"
              color="#fff"
              border="none"
            >
              <FaPlus color="#fff" fontSize="20px" />{" "}
              <Text pl="10px">Add Income</Text>
            </Button>
          </HStack>
        </HStack>

        <Card
          background="rgba(0,7,81,255)"
          width="100%"
          overflowX={{ sm: "scroll", xl: "hidden" }}
          pb="0px"
        >
          <CardHeader display="flex" alignItems="center">
            <Text fontSize="lg" color="#fff" fontWeight="bold">
              Daily External Sales
            </Text>
          </CardHeader>
          <CardBody>
            {loading ? (
              <HStack
                width="100%"
                margin="auto"
                height="100px"
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
              >
                <Spinner color="#fff" />
              </HStack>
            ) : (
              <Table variant="simple" color="#fff">
                <Thead>
                  <Tr my=".8rem" ps="0px" color="gray.400">
                    <Th>
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          setSelectedIncomes(
                            isChecked ? incomes.map((income: any) => income.id) : []
                          );
                        }}
                        checked={
                          selectedIncomes.length > 0 &&
                          selectedIncomes.length === incomes.length
                        }
                      />
                    </Th>
                    <Th>Date</Th>
                    <Th>Truck/Driver</Th>
                    <Th>No of Bags</Th>
                    <Th>Rate</Th>
                    <Th>Total</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {incomes && incomes.length > 0 ? (
                    incomes.map((income: Income, index: number) => (
                      <Tr key={index}>
                        <Td>
                          <input
                            type="checkbox"
                            checked={selectedIncomes.includes(income.id)}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              setSelectedIncomes((prev) =>
                                isChecked
                                  ? [...prev, income.id] // Add to selection
                                  : prev.filter((id) => id !== income.id) // Remove from selection
                              );
                            }}
                          />
                        </Td>
                        <Td>{income.date.toDate().toLocaleDateString()}</Td>
                        <Td>{(income.bags_by_truck && 'Not') || income.driver || "N/A"}</Td>
                        <Td>{income.no_of_bags} </Td>
                        <Td>{income.rate}</Td>
                        <Td>{income.total}</Td>
                        <Td>
                          <Button
                            colorScheme="red"
                            size="sm"
                            onClick={() => {
                              setDeleteId(income.id);
                              onOpenDeleteModal();
                            }}
                          >
                            Delete
                          </Button>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={7}>No external income found</Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            )}
          </CardBody>
        </Card>
      </VStack>
    </AppLayout>
  );
};

export default ExternalIncome;
