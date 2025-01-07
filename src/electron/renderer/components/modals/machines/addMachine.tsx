import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useAddMachinery } from "../../../services/machineries";
import { randomString } from "../../../utils/variables/randomString";

const AddMachineModal = ({
  isOpen,
  onClose,
  refetch,
}: {
  isOpen: boolean;
  onClose: () => void;
  refetch: () => void;
}) => {
  const [machine, setMachine] = useState({
    id: randomString,
    model: "",
    category: "",
    capacity: "",
  });
  const [addMachinery, loading, error] = useAddMachinery();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setMachine((prevMachine) => ({
      ...prevMachine,
      [name]: value,
    }));
  };

  const handleAddMachine = async () => {
    try {
      await addMachinery(machine);
      refetch();
      onClose();
    } catch (e) {
      console.error("Error adding machinery:", e);
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
            Add New Machine
          </Text>
        </ModalHeader>
        <ModalBody>
          <VStack color="#fff" marginTop="50px" gap="20px">
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input
                width="100%"
                height="50px"
                borderRadius="50px"
                border="1px solid rgba(255,255,255,0.3)"
                color="#fff"
                name="model"
                value={machine.model}
                onChange={handleChange}
              />
              <FormErrorMessage></FormErrorMessage>
            </FormControl>
            <FormControl>
              <FormLabel>Category</FormLabel>
              <Select
                width="100%"
                height="50px"
                borderRadius="50px"
                border="1px solid rgba(255,255,255,0.3)"
                color="#fff"
                name="category"
                value={machine.category}
                onChange={handleChange}
              >
                <option value="" disabled>
                  Select Category
                </option>
                <option value="trucks">Trucks</option>
                <option value="sachets">Sachets</option>
              </Select>
              <FormErrorMessage></FormErrorMessage>
            </FormControl>
            {machine.category === "trucks" && (
              <FormControl>
                <FormLabel>Capacity</FormLabel>
                <Input
                  width="100%"
                  height="50px"
                  borderRadius="50px"
                  border="1px solid rgba(255,255,255,0.3)"
                  color="#fff"
                  name="capacity"
                  value={machine.capacity}
                  onChange={handleChange}
                />
                <FormErrorMessage></FormErrorMessage>
              </FormControl>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            width="100px"
            height="45px"
            background="rgba(0,7,81,255)"
            color="#fff"
            onClick={handleAddMachine}
            disabled={
              loading ||
              !machine.model ||
              !machine.category ||
              !machine.capacity
            }
          >
            {loading ? "Adding..." : "Add"}
          </Button>
          {error && (
            <Text color="red.500" fontSize="sm" mt="2">
              {error}
            </Text>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddMachineModal;
