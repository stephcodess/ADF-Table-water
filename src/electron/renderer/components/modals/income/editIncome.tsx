import React, { useState, useEffect } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { Income, updateIncome } from "../../../services/income";
import { Timestamp } from "firebase/firestore"; // Import Timestamp from Firebase

interface EditIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialIncomeData: Income | null;
  refetch: () => void;
}

const EditIncomeModal: React.FC<EditIncomeModalProps> = ({
  isOpen,
  onClose,
  initialIncomeData,
  refetch,
}) => {
  const [date, setDate] = useState<string>("");
  const [noOfBags, setNoOfBags] = useState<number>(0);
  const [rate, setRate] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const toast = useToast();

  useEffect(() => {
    if (initialIncomeData) {
      setDate(
        new Date(initialIncomeData.date.seconds * 1000)
          .toISOString()
          .split("T")[0]
      );
      setNoOfBags(initialIncomeData.no_of_bags);
      setRate(initialIncomeData.rate);
      setTotal(initialIncomeData.total);
    }
  }, [initialIncomeData]);

  const handleUpdate = async () => {
    if (initialIncomeData) {
      setLoading(true);
      try {
        const updatedData = {
          date: Timestamp.fromDate(new Date(date)), // Convert the date to Firestore Timestamp
          no_of_bags: noOfBags,
          rate: rate,
          total: total,
        };

        await updateIncome(initialIncomeData.id, updatedData);
        toast({
          title: "Income updated.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        refetch();
        onClose();
      } catch (error) {
        console.error("Error updating income:", error);
        toast({
          title: "Error updating income.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Modal size="xl" isOpen={isOpen} onClose={onClose}>
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
            Add New Income
          </Text>
        </ModalHeader>
        <ModalBody>
          <VStack color="#fff" marginTop="50px" gap="20px">
            <FormControl id="date" mb={4}>
              <FormLabel>Date</FormLabel>
              <Input
                width="100%"
                height="50px"
                borderRadius="50px"
                border="1px solid rgba(255,255,255,0.3)"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </FormControl>
            <FormControl id="no-of-bags" mb={4}>
              <FormLabel>No of Bags</FormLabel>
              <Input
                width="100%"
                height="50px"
                borderRadius="50px"
                border="1px solid rgba(255,255,255,0.3)"
                type="number"
                value={noOfBags}
                onChange={(e) => setNoOfBags(parseFloat(e.target.value))}
              />
            </FormControl>
            <FormControl id="rate" mb={4}>
              <FormLabel>Rate</FormLabel>
              <Input
                width="100%"
                height="50px"
                borderRadius="50px"
                border="1px solid rgba(255,255,255,0.3)"
                type="number"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
              />
            </FormControl>
            <FormControl id="total" mb={4}>
              <FormLabel>Total</FormLabel>
              <Input
                width="100%"
                height="50px"
                borderRadius="50px"
                border="1px solid rgba(255,255,255,0.3)"
                type="number"
                value={total}
                onChange={(e) => setTotal(parseFloat(e.target.value))}
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={handleUpdate} isLoading={loading}>
            Update
          </Button>
          <Button ml={20} colorScheme="red" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditIncomeModal;
