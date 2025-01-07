import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  HStack,
  Input,
  Select,
  Table,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
  Td,
  VStack,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import {
  useTable,
  useGlobalFilter,
  useSortBy,
  Column,
  TableState as ReactTableState,
  TableInstance as ReactTableInstance,
} from "react-table";
import AppLayout from "../../components/layout/appLayout";
import { FaPlus } from "react-icons/fa";
import { Expense, useDeleteExpense, useGetAllExpenses } from "../../services/expenses";
import { useRecoilValue } from "recoil";
import { expenseErrorState, expenseLoadingState } from "../../services/state";
import AddExpenseModal from "../../components/modals/expenses/addExpense";
import DeleteExpenseModal from "../../components/modals/expenses/deleteExpense";

interface TableStateWithGlobalFilter<T extends object>
  extends ReactTableState<T> {
  globalFilter?: string;
}

interface TableInstanceWithGlobalFilter<T extends object>
  extends ReactTableInstance<T> {
  setGlobalFilter: (filterValue: string | undefined) => void;
}

const ManageExpenses: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [deleteId, setDeleteId] = useState<string>("");
  const [editExpense, setEditExpense] = useState<Expense | null>(null); // Store expense to edit
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onOpenDeleteModal,
    onClose: onCloseDeleteModal,
  } = useDisclosure();

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear().toString();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, "0");

  const [selectedYear, setSelectedYear] = useState<string>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);

  const { expenses, refetch } = useGetAllExpenses(selectedYear, selectedMonth);
  const loading = useRecoilValue(expenseLoadingState);
  const error = useRecoilValue(expenseErrorState);
  const [deleteExpense, deleting, deleteError] = useDeleteExpense();
  const toast = useToast();
  const [success, setSuccess] = useState<boolean | null>(null); // Track success explicitly

  const columns: Column<Expense>[] = useMemo(
    () => [
      {
        Header: "Date",
        accessor: "date",
        Cell: ({
          value,
        }: {
          value: { seconds: number; nanoseconds: number };
        }) =>
          value ? new Date(value.seconds * 1000).toLocaleDateString() : "N/A",
      },
      {
        Header: "Item/Employee",
        accessor: "item",
        Cell: ({
          row,
        }: {
          row: {
            original: Expense & { reciever?: string; description?: string };
          };
        }) =>
          row.original.description ||
          row.original.item ||
          row.original.reciever ||
          "N/A",
      },
      {
        Header: "Type",
        accessor: "type",
      },
      {
        Header: "Rate",
        accessor: "rate",
      },
      {
        Header: "Total",
        accessor: "total",
      },
      {
        Header: "Actions",
        accessor: "id",
        Cell: ({ row }: any) => (
          <HStack spacing={2}>
            <Button
              size="sm"
              onClick={() => {
                setEditExpense(row.original); // Set the expense to edit
                onOpen(); // Open the Add/Edit modal
              }}
            >
              Edit
            </Button>
            <Button
              size="sm"
              colorScheme="red" // Red delete button
              onClick={() => {
                setDeleteId(row.original.id);
                onOpenDeleteModal();
              }}
            >
              Delete
            </Button>
          </HStack>
        ),
      },
    ],
    [onOpen, onOpenDeleteModal]
  );

  const data = useMemo(() => expenses || [], [expenses]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
    setGlobalFilter,
  } = useTable(
    { columns, data } as any,
    useGlobalFilter,
    useSortBy
  ) as TableInstanceWithGlobalFilter<Expense>;

  const { globalFilter } = state as TableStateWithGlobalFilter<Expense>;

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense(id);
      setSuccess(true); // Set success only after successful deletion
      refetch(); // Refetch data to update table
    } catch (error) {
      console.error("Error deleting expense:", error);
      setSuccess(false); // Set success to false if there's an error
    }
  };

  useEffect(() => {
    if (success === true) {
      refetch();
      toast({
        title: "Expense deleted.",
        status: "success",
        duration: 3000,
        position: "top-right",
        isClosable: true,
      });
      setSuccess(null); // Reset success to prevent repeated toasts
    } else if (success === false) {
      refetch();
      toast({
        title: "Error deleting expense.",
        status: "error",
        duration: 3000,
        position: "top-right",
        isClosable: true,
      });
      setSuccess(null); // Reset success to prevent repeated toasts
    }
  }, [success, toast]);

  useEffect(() => {
    if (error) {
      console.error("Error fetching expenses:", error);
    }
  }, [error]);

  return (
    <AppLayout>
      <VStack width="95%" m="auto" marginBottom="20px">
        <AddExpenseModal
          isOpen={isOpen}
          onClose={() => {
            onClose();
            setEditExpense(null); // Reset edit expense
            refetch();
          }}
          refetch={refetch}
          initialExpense={editExpense} // Pass the expense to edit
        />
        <DeleteExpenseModal
          handleDelete={() => handleDelete(deleteId)}
          isOpen={isDeleteModalOpen}
          deleting={deleting}
          onClose={onCloseDeleteModal}
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
              borderColor="gray.300"
            >
              {Array.from(
                { length: new Date().getFullYear() - 2021 + 1 },
                (_, i) => 2021 + i
              ).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Select>
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
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
          <Button
            onClick={onOpen}
            type="button"
            bg="rgba(0,7,81,255)"
            textAlign="center"
            color="#fff"
            border="none"
          >
            <FaPlus color="#fff" fontSize="20px" />{" "}
            <Text pl="10px">Add new Expense</Text>
          </Button>
        </HStack>
        <Card
          background="rgba(0,7,81,255)"
          width="100%"
          height="auto"
          pb="100px"
        >
          <CardHeader display="flex" alignItems="center">
            <Text fontSize="lg" color="#fff" fontWeight="bold">
              DAILY EXPENSES
            </Text>
          </CardHeader>
          <Input
            placeholder="Search expenses..."
            value={globalFilter || ""}
            onChange={(e) => setGlobalFilter(e.target.value || undefined)}
            width="96%"
            mx="2%"
            height="50px"
            borderRadius="50px"
            border="1px solid rgba(255,255,255,0.3)"
            color="#fff"
            mb="20px"
            _placeholder={{ color: "rgba(255, 255, 255, 0.7)" }}
          />
          <CardBody>
            <Table {...getTableProps()} variant="simple" color="#fff">
              <Thead>
                {headerGroups.map((headerGroup) => (
                  <Tr
                    {...headerGroup.getHeaderGroupProps()}
                    my=".8rem"
                    ps="0px"
                    color="gray.400"
                  >
                    {headerGroup.headers.map((column: any) => (
                      <Th
                        {...column.getHeaderProps(
                          column.getSortByToggleProps()
                        )}
                        ps="0px"
                        color="gray.400"
                        fontFamily="Plus Jakarta Display"
                        borderBottomColor="#56577A"
                      >
                        {column.render("Header")}
                        {column.isSorted
                          ? column.isSortedDesc
                            ? " 🔽"
                            : " 🔼"
                          : ""}
                      </Th>
                    ))}
                  </Tr>
                ))}
              </Thead>
              <Tbody {...getTableBodyProps()}>
                {rows.map((row) => {
                  prepareRow(row);
                  return (
                    <Tr {...row.getRowProps()}>
                      {row.cells.map((cell) => (
                        <Td
                          {...cell.getCellProps()}
                          color="gray.400"
                          fontFamily="Plus Jakarta Display"
                        >
                          {cell.render("Cell")}
                        </Td>
                      ))}
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </VStack>
    </AppLayout>
  );
};

export default ManageExpenses;
