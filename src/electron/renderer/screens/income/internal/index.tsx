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
  Td,
  useToast,
  Select,
  Spinner,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import AppLayout from "../../../components/layout/appLayout";
import React from "react";
import { FaPlus } from "react-icons/fa";
import AddInternalSales from "../../../components/modals/income/addIncome";
import { DeleteIncomeModal } from "../../../components/modals/income/deleteIncome";
import {
  Income,
  useDeleteIncome,
  useGetAllIncomesByType,
} from "../../../services/income";
import EditIncomeModal from "../../../components/modals/income/editIncome";

const InternalIncome: React.FC = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear().toString();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, "0");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedYear, setSelectedYear] = useState<string>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const {
    isOpen: isEditOpen,
    onOpen: onOpenEdit,
    onClose: onCloseEdit,
  } = useDisclosure();
  const [editIncome, setEditIncome] = useState<Income | null>(null);

  const { incomes, refetch, loading, error }: any = useGetAllIncomesByType(
    "internal",
    selectedYear,
    selectedMonth
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteIncome, deleting, deleteError] = useDeleteIncome();
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onOpenDeleteModal,
    onClose: onCloseDeleteModal,
  } = useDisclosure();
  const toast = useToast();
  const [success, setSuccess] = useState<boolean>(false);

  const [selectedIncomes, setSelectedIncomes] = useState<string[]>([]); // State to manage selected incomes

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
      <VStack width="95%" m="auto">
        <DeleteIncomeModal
          handleDelete={handleBulkDelete} // Trigger bulk delete
          isOpen={isDeleteModalOpen}
          deleting={deleting}
          onClose={onCloseDeleteModal}
        />
        <AddInternalSales
          refetch={refetch}
          type="internal"
          isOpen={isOpen}
          onClose={onClose}
        />
        <EditIncomeModal
          refetch={refetch}
          initialIncomeData={editIncome}
          isOpen={isEditOpen}
          onClose={onCloseEdit}
        />
        <HStack
          width="100%"
          height="100px"
          justifyContent="space-between"
          display="flex"
          flexDir="row"
        >
          <HStack>
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              bg="white"
              borderColor="gray.300"
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
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              bg="white"
              borderColor="gray.300"
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
                  onOpenDeleteModal(); // Open confirmation modal
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
          pb="100px"
        >
          <CardHeader display="flex" alignItems="center">
            <Text fontSize="lg" color="#fff" fontWeight="bold">
              Daily Internal Sales
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
                        <Td>{income.no_of_bags}</Td>
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
                      <Td colSpan={6}>No internal income found</Td>
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

export default InternalIncome;
