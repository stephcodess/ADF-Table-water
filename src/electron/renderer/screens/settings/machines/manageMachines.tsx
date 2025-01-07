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
  Modal,
  ModalOverlay,
  ModalHeader,
  Divider,
  ModalBody,
  Box,
  ModalFooter,
  ModalContent,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import AppLayout from "../../../components/layout/appLayout";
import React from "react";
import { FaPlus } from "react-icons/fa";
import {
  useDeleteMachinery,
  useGetAllMachineriesByCategory,
  useGetAllMachines,
} from "../../../services/machineries";
import MachineryTableRow from "../../../components/Tables/machineryTableRow";
import AddMachineModal from "../../../components/modals/machines/addMachine";

export const DeleteMachineModal = ({
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
        <ModalHeader>Delete Machine</ModalHeader>
        <Divider />
        <ModalBody>
          <Box>
            <Text>Do you want to delete this Machine details?</Text>
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
            close
          </Button>
          <Button
            onClick={() => handleDelete()}
            height="40px"
            width="120px"
            bg="rgba(0,7,81,255)"
          >
            {deleting ? "deleting" : "delete"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const ManageMachines = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    machines: machineries,
    loading,
    error,
    refetch,
  } = useGetAllMachines();
  const [deleteId, setDeleteId] = useState("");
  const [deleteMachinery, deleting, deleteError] = useDeleteMachinery();
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
        title: "Machinery deleted.",
        status: "success",
        duration: 3000,
        position: "top-right",
        isClosable: true,
      });
    } else if (deleteError) {
      toast({
        title: "Error deleting machinery details.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [success, deleteError]);

  const handleDelete = async (id: string) => {
    try {
      await deleteMachinery(id);
      setSuccess(true);
    } catch (error) {
      console.error("Error deleting machinery:", error);
      setSuccess(false);
    }
  };

  return (
    <AppLayout>
      <VStack width="95%" m="auto" marginBottom="20px">
        <DeleteMachineModal
          handleDelete={() => handleDelete(deleteId)}
          isOpen={isDeleteModalOpen}
          deleting={deleting}
          onClose={onCloseDeleteModal}
        />
        <AddMachineModal refetch={refetch} isOpen={isOpen} onClose={onClose} />
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
            <Text pl="10px">Add Machine</Text>
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
              List of Machineries
            </Text>
          </CardHeader>
          <CardBody>
            <Table variant="simple" color="#fff">
              <Thead>
                <Tr my=".8rem" ps="0px" color="gray.400">
                  <Th
                    ps="0px"
                    color="gray.400"
                    fontFamily="Plus Jakarta Display"
                    borderBottomColor="#56577A"
                  >
                    s/n
                  </Th>
                  <Th
                    ps="0px"
                    color="gray.400"
                    fontFamily="Plus Jakarta Display"
                    borderBottomColor="#56577A"
                  >
                    Name
                  </Th>
                  <Th>Categogy</Th>
                  <Th
                    color="gray.400"
                    fontFamily="Plus Jakarta Display"
                    borderBottomColor="#56577A"
                  >
                    capacity
                  </Th>

                  <Th borderBottomColor="#56577A"></Th>
                </Tr>
              </Thead>
              <Tbody>
                {machineries ? (
                  machineries.map((machinery, index) => (
                    <MachineryTableRow
                      key={index}
                      index={index + 1}
                      onOpen={onOpenDeleteModal}
                      setDeleteId={() => setDeleteId(machinery.id)}
                      row={machinery}
                      lastItem={index === machineries.length - 1 ? true : false}
                    />
                  ))
                ) : loading ? (
                  <Spinner size="24px" />
                ) : (
                  <Tr>
                    <Td colSpan={6}>No internal Machine found</Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </VStack>
    </AppLayout>
  );
};

export default ManageMachines;
