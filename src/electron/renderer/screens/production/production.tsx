import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  HStack,
  VStack,
  Text,
  Thead,
  Tbody,
  Th,
  Tr,
  Td,
  Table,
  CardBody,
  Card,
  CardHeader,
  useDisclosure,
  Spinner,
  Select,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
} from "@chakra-ui/react";
import AppLayout from "../../components/layout/appLayout";
import { FaPlus, FaTrash } from "react-icons/fa";
import AddProductionModal from "../../components/modals/productions";
import {
  useGetProductionsByMonth,
  useDeleteProduction,
  Production,
} from "../../services/productions";

const ProductionComponent = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, "0");

  const [selectedYear, setSelectedYear] = useState<string>(
    currentYear.toString()
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);

  const { productions, loading, error, refetch } = useGetProductionsByMonth(
    selectedYear,
    selectedMonth
  );

  const [deleteProduction, deleteLoading] = useDeleteProduction();
  const [selectedProductionId, setSelectedProductionId] = useState<
    string | null
  >(null);

  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure();

  const handleDelete = async () => {
    if (selectedProductionId) {
      try {
        await deleteProduction(selectedProductionId);
        toast({
          title: "Production deleted.",
          description: "The production record has been deleted.",
          status: "success",
          duration: 4000,
          isClosable: true,
        });
        refetch(); // Refetch after deletion
      } catch (error: any) {
        toast({
          title: "Error deleting production.",
          description:
            error.message || "An error occurred while deleting production",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      } finally {
        setSelectedProductionId(null);
        onDeleteModalClose();
      }
    }
  };

  const renderDeleteConfirmationModal = () => (
    <Modal size="xl" isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent
        backdropBlur="10px"
        width={{ base: "90%", md: "80%", lg: "800px" }}
        height="fit-content"
        transition="1s ease-out"
        borderRadius="15px"
        backdropFilter="blur(10px)"
        bg="linear-gradient(111.84deg, rgba(6, 11, 38, 0.8) 59.3%, rgba(26, 31, 55, 0.7) 100%)"
      >
        <ModalCloseButton
          background="#fff"
          height="40px"
          width="40px"
          m="5px"
          borderRadius="50%"
        />
        <ModalHeader
          borderBottom="1px solid rgba(255,255,255,0.2)"
          height="140px"
          display="flex"
          alignItems="center"
        >
          <Text
            textTransform="uppercase"
            color="#fff"
            fontSize="20px"
            fontWeight="bolder"
          >
            Delete Production Record
          </Text>
        </ModalHeader>
        <ModalBody>
          <Text color="white" my={20}>
            Are you sure you want to delete this production record? This will
            delete the production record for this particular date.
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="red"
            onClick={handleDelete}
            isLoading={deleteLoading}
          >
            Delete
          </Button>
          <Button variant="ghost" onClick={onDeleteModalClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );

  const handleDeleteClick = (productionId: string) => {
    setSelectedProductionId(productionId);
    onDeleteModalOpen();
  };

  useEffect(() => {
    if (error) {
      toast({
        title: "Error fetching productions.",
        description: error,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  }, [error, toast]);

  // Avoid triggering an infinite loop
  useEffect(() => {
    refetch(); // Fetch productions only when selectedYear or selectedMonth changes
  }, [selectedYear, selectedMonth]);

  const groupByMachine = () => {
    const machineGroups: { [key: string]: any[] } = {};

    if (productions && Array.isArray(productions)) {
      productions.forEach((production) => {
        if (production.data && Array.isArray(production.data)) {
          production.data.forEach((item) => {
            if (item.machine && !machineGroups[item.machine]) {
              machineGroups[item.machine] = [];
            }
            if (item.machine) {
              machineGroups[item.machine].push({
                ...item,
                date: production.date,
                id: production.id,
              });
            }
          });
        }
      });
    }

    return machineGroups;
  };

  const machineGroups = groupByMachine();

  const renderProductionTable = () => (
    <>
      {Object.keys(machineGroups).map((machine) => (
        <Box key={machine} mb={6}>
          <Text fontSize="xl" color="#fff" fontWeight="bold" mb={4}>
            Machine: {machine}
          </Text>
          <Table variant="simple" color="#fff">
            <Thead>
              <Tr my=".8rem" ps="0px" color="gray.400">
                <Th ps="0px" color="gray.400" borderBottomColor="#56577A">
                  Date
                </Th>
                <Th color="gray.400" borderBottomColor="#56577A">
                  Operator
                </Th>
                <Th color="gray.400" borderBottomColor="#56577A">
                  Quantity
                </Th>
                <Th color="gray.400" borderBottomColor="#56577A">
                  Kg used
                </Th>
                <Th color="gray.400" borderBottomColor="#56577A">
                  Packing Bags used
                </Th>
                <Th color="gray.400" borderBottomColor="#56577A">
                  Actions
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {machineGroups[machine].map((production, rowIndex) => (
                <Tr key={rowIndex}>
                  <Td borderBottomColor="#56577A">
                    {
                      new Date(production.date.seconds * 1000)
                        .toISOString()
                        .split("T")[0]
                    }
                  </Td>
                  <Td borderBottomColor="#56577A">{production.operator}</Td>
                  <Td borderBottomColor="#56577A">{production.quantity}</Td>
                  <Td borderBottomColor="#56577A">{production.kg_used}</Td>
                  <Td borderBottomColor="#56577A">
                    {production.packing_bags_used}
                  </Td>
                  <Td borderBottomColor="#56577A">
                    <Button
                      colorScheme="red"
                      onClick={() => handleDeleteClick(production.id)}
                      leftIcon={<FaTrash />}
                    >
                      Delete
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      ))}
    </>
  );

  return (
    <AppLayout>
      <VStack width="95%" m="auto">
        <AddProductionModal
          isOpen={isOpen}
          onClose={onClose}
          refetch={refetch}
        />
        <HStack
          width="100%"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
        >
          <HStack>
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              borderColor="gray.300"
            >
              {Array.from(
                { length: currentYear - 2020 + 1 },
                (_, i) => 2020 + i
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
          <Button onClick={onOpen} bg="rgba(0,7,81,255)" color="#fff">
            <FaPlus color="#fff" fontSize="20px" />{" "}
            <Text pl="10px">Add Production</Text>
          </Button>
        </HStack>

        <Card
          background="rgba(0,7,81,255)"
          width="100%"
          overflowX={{ sm: "scroll", xl: "hidden" }}
          pb="100px"
        >
          <CardHeader display="flex" alignItems="center">
            <Text fontSize="lg" color="#fff" fontWeight="bold">
              Daily Production Records
            </Text>
          </CardHeader>
          <CardBody>
            {loading ? (
              <Spinner color="white" />
            ) : (
              renderProductionTable()
            )}
          </CardBody>
        </Card>
      </VStack>
      {renderDeleteConfirmationModal()}
    </AppLayout>
  );
};

export default ProductionComponent;
