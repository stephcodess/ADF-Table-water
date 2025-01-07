import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Table as ChakraTable,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
  VStack,
  Td,
} from "@chakra-ui/react";
import AppLayout from "../../components/layout/appLayout";
import { FaPlus } from "react-icons/fa";
import { useTable, useGlobalFilter, Column, TableInstance } from "react-table";
import {
  Employee,
  useDeleteEmployee,
  useGetAllEmployees,
} from "../../services/employees";
import AddNewEmployee from "../../components/modals/employees/addNewEmployee";

const DeleteEmployeeModal = ({
  isOpen,
  onClose,
  handleDelete,
  deleting,
}: any) => {
  return (
    <Modal useInert={true} size="xl" isOpen={isOpen} onClose={onClose}>
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent
        height="300px"
        color="#fff"
        backdropFilter="blur(10px)"
        bg="linear-gradient(111.84deg, rgba(6, 11, 38, 0.8) 59.3%, rgba(26, 31, 55, 0.7) 100%)"
      >
        <ModalHeader>Delete Employee</ModalHeader>
        <Divider />
        <ModalBody>
          <Box>
            <Text>Do you want to delete this employee?</Text>
          </Box>
        </ModalBody>
        <Divider />
        <ModalFooter
          display={"flex"}
          flexDirection="row"
          px="10px"
          justifyContent="space-between"
          alignItems="center"
        >
          <Button
            onClick={onClose}
            height="40px"
            width="120px"
            background="red.300"
          >
            Close
          </Button>
          <Button
            onClick={() => handleDelete()}
            height="40px"
            width="120px"
            bg="rgba(0,7,81,255)"
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const Employees = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [deleteId, setDeleteId] = useState<string>("");
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onOpenDeleteModal,
    onClose: onCloseDeleteModal,
  } = useDisclosure();
  const { employees, refetch } = useGetAllEmployees();
  const [deleteEmployee, deleting, deleteError] = useDeleteEmployee();
  const toast = useToast();
  const [filterInput, setFilterInput] = useState<string>("");

  const handleDelete = async () => {
    try {
      await deleteEmployee(deleteId);
      toast({
        title: "Employee deleted successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      refetch();
      onCloseDeleteModal();
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast({
        title: "Error deleting employee.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value || "";
    setFilterInput(value);
    tableInstance.setGlobalFilter(value); // Update react-table's global filter
  };

  const columns: Column<Employee>[] = useMemo(
    () => [
      {
        Header: "Name",
        accessor: (row) => `${row.other_names} ${row.last_name}`,
        id: "name",
      },
      {
        Header: "Role",
        accessor: "role",
      },
      {
        Header: "Employment Date",
        accessor: "employment_date",
      },
      {
        Header: "Salary/Rate",
        accessor: "salary",
      },
      {
        Header: "Actions",
        accessor: "id",
        Cell: ({ value }: { value: string }) => (
          <Button
            onClick={() => {
              setDeleteId(value);
              onOpenDeleteModal();
            }}
            size="sm"
            bg="red.500"
            color="#fff"
          >
            Delete
          </Button>
        ),
      },
    ],
    [onOpenDeleteModal]
  );

  const data = useMemo(() => employees || [], [employees]);
  const tableInstance = useTable(
    { columns, data },
    useGlobalFilter
  ) as TableInstance<Employee> & { setGlobalFilter: (filter: string) => void };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setGlobalFilter,
  } = tableInstance;

  return (
    <AppLayout>
      <VStack width="95%" m="auto" marginBottom="20px">
        <AddNewEmployee isOpen={isOpen} onClose={onClose} />
        <DeleteEmployeeModal
          handleDelete={handleDelete}
          isOpen={isDeleteModalOpen}
          deleting={deleting}
          onClose={onCloseDeleteModal}
        />
        <HStack
          width="100%"
          height="100px"
          justifyContent="flex-end"
          display="flex"
          flexDir="row"
        >
          <Button
            onClick={onOpen}
            type="button"
            bg="rgba(0,7,81,255)"
            textAlign="center"
            color="#fff"
            border="none"
          >
            <FaPlus color="#fff" fontSize="20px" />{" "}
            <Text pl="10px">Add new Employee</Text>
          </Button>
        </HStack>

        <Card
          background="rgba(0,7,81,255)"
          width="100%"
          overflowX={{ sm: "scroll", xl: "hidden" }}
          pb="0px"
        >
          <CardHeader display="flex" alignItems="center">
            <Text fontSize="lg" color="#fff" fontWeight="bold">
              Employees
            </Text>
          </CardHeader>
          <CardBody>
            <Input
              placeholder="Search employees..."
              value={filterInput}
              onChange={handleFilterChange}
              width="100%"
              height="50px"
              borderRadius="50px"
              border="1px solid rgba(255,255,255,0.3)"
              color="#fff"
              mb="20px"
            />
            <ChakraTable {...getTableProps()} variant="simple" color="#fff">
              <Thead>
                {headerGroups.map((headerGroup) => (
                  <Tr {...headerGroup.getHeaderGroupProps()} color="gray.400">
                    {headerGroup.headers.map((column) => (
                      <Th
                        {...column.getHeaderProps()}
                        fontFamily="Plus Jakarta Display"
                        borderBottomColor="#56577A"
                      >
                        {column.render("Header")}
                      </Th>
                    ))}
                  </Tr>
                ))}
              </Thead>
              <Tbody {...getTableBodyProps()}>
                {rows.length === 0 ? (
                  <Tr>
                    <Td colSpan={columns.length}>
                      <Text textAlign="center" color="#fff">
                        No Employees Found.
                      </Text>
                    </Td>
                  </Tr>
                ) : (
                  rows.map((row) => {
                    prepareRow(row);
                    return (
                      <Tr {...row.getRowProps()}>
                        {row.cells.map((cell) => (
                          <Td
                            {...cell.getCellProps()}
                            color="gray.400"
                            borderBottomColor="#56577A"
                          >
                            {cell.render("Cell")}
                          </Td>
                        ))}
                      </Tr>
                    );
                  })
                )}
              </Tbody>
            </ChakraTable>
          </CardBody>
        </Card>
      </VStack>
    </AppLayout>
  );
};

export default Employees;
