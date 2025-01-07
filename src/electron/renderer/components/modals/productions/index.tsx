import React, { useEffect, useState } from "react";
import {
  Box,
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
import { useAddProduction } from "../../../services/productions";
import { randomString } from "../../../utils/variables/randomString";
import { useGetAllEmployees } from "../../../services/employees";
import { useGetAllMachineriesByCategory } from "../../../services/machineries";
import { Timestamp } from "firebase/firestore";

interface Production {
  id: string;
  data: {
    machine: string;
    operator: string;
    quantity: number;
    kg_used: number;
    packing_bags_used: number;
  }[];
  date: Timestamp;
}

const AddProductionModal = ({
  isOpen,
  onClose,
  refetch,
}: {
  isOpen: boolean;
  onClose: () => void;
  refetch: () => void;
}) => {
  const initialProductionData = [
    {
      machine: "",
      operator: "",
      quantity: 0,
      kg_used: 0,
      packing_bags_used: 0,
    },
  ];

  const [production, setProduction] = useState<Production>({
    id: randomString,
    data: initialProductionData,
    date: Timestamp.now(),
  });
  const [addProduction, loading, error] = useAddProduction();
  const { employees, refetch: refetchEmployees } =
    useGetAllEmployees("operator");
  const { machineries, refetch: refetchMachines } =
    useGetAllMachineriesByCategory("sachets");

  const handleChange =
    (index: number) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      let parsedValue: number | string = value;

      // Parse kg_used to 2 decimal places if name is 'kg_used'
      if (name === "kg_used") {
        parsedValue = parseFloat(value);
        if (isNaN(parsedValue)) {
          parsedValue = ""; // Set to empty string if parsing fails
        } else {
          parsedValue = parseFloat(parsedValue.toFixed(2)); // Round to 2 decimal places
        }
      } else if (["quantity", "packing_bags_used"].includes(name)) {
        parsedValue = parseInt(value);
        if (isNaN(parsedValue)) {
          parsedValue = 0; // Set to 0 if parsing fails
        }
      }

      const newData = [...production.data];
      newData[index] = {
        ...newData[index],
        [name]: parsedValue,
      };
      setProduction((prevProduction) => ({
        ...prevProduction,
        data: newData,
      }));
    };

  const addMachine = () => {
    setProduction((prevProduction) => ({
      ...prevProduction,
      data: [...prevProduction.data, { ...initialProductionData[0] }],
    }));
  };

  const removeMachine = (index: number) => {
    setProduction((prevProduction) => ({
      ...prevProduction,
      data: prevProduction.data.filter((_, i) => i !== index),
    }));
  };

  const handleAddProduction = async () => {
    try {
      await addProduction(production);
      refetch();
      onClose();
    } catch (e) {
      console.error("Error adding production:", e);
    }
  };

  useEffect(() => {
    refetchEmployees();
    refetchMachines();
  }, [refetchEmployees, refetchMachines]);

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
            Add Production Record
          </Text>
        </ModalHeader>
        <ModalBody>
          <VStack color="#fff" marginTop="50px" gap="20px">
            <FormControl>
              <FormLabel>Date</FormLabel>
              <Input
                width="100%"
                height="50px"
                borderRadius="50px"
                border="1px solid rgba(255,255,255,0.3)"
                type="date"
                color="#fff"
                name="date"
                value={production.date.toDate().toISOString().split("T")[0]}
                onChange={(e) =>
                  setProduction((prevProduction) => ({
                    ...prevProduction,
                    date: Timestamp.fromDate(new Date(e.target.value)),
                  }))
                }
              />
              <FormErrorMessage></FormErrorMessage>
            </FormControl>
            {production.data.map((item, index) => (
              <React.Fragment key={index}>
                <FormControl>
                  <FormLabel>Select Machine</FormLabel>
                  <Select
                    width="100%"
                    height="50px"
                    borderRadius="50px"
                    border="1px solid rgba(255,255,255,0.3)"
                    color="#fff"
                    name="machine"
                    value={item.machine}
                    onChange={handleChange(index)}
                  >
                    <option value="" disabled>
                      Select Machine
                    </option>
                    {machineries &&
                      machineries.map((machine) => (
                        <option key={machine.id} value={machine.model}>
                          {machine.model}
                        </option>
                      ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Select Operator</FormLabel>
                  <Select
                    width="100%"
                    height="50px"
                    borderRadius="50px"
                    border="1px solid rgba(255,255,255,0.3)"
                    color="#fff"
                    name="operator"
                    value={item.operator}
                    onChange={handleChange(index)}
                  >
                    <option value="" disabled>
                      Select Operator
                    </option>
                    {employees &&
                      employees.map((employee) => (
                        <option
                          key={employee.id}
                          value={
                            employee.last_name + " " + employee.other_names
                          }
                        >
                          {employee.last_name + " " + employee.other_names}
                        </option>
                      ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>No of Bags</FormLabel>
                  <Input
                    width="100%"
                    height="50px"
                    borderRadius="50px"
                    border="1px solid rgba(255,255,255,0.3)"
                    type="number"
                    color="#fff"
                    name="quantity"
                    value={item.quantity}
                    onChange={handleChange(index)}
                  />
                  <FormErrorMessage></FormErrorMessage>
                </FormControl>
                <FormControl>
                  <FormLabel>KG Used</FormLabel>
                  <Input
                    width="100%"
                    height="50px"
                    borderRadius="50px"
                    border="1px solid rgba(255,255,255,0.3)"
                    type="number"
                    step="0.01" // Allows input of decimals to 2 decimal places
                    color="#fff"
                    name="kg_used"
                    value={item.kg_used}
                    onChange={handleChange(index)}
                  />
                  <FormErrorMessage></FormErrorMessage>
                </FormControl>
                <FormControl>
                  <FormLabel>Packing Bags Used</FormLabel>
                  <Input
                    width="100%"
                    height="50px"
                    borderRadius="50px"
                    border="1px solid rgba(255,255,255,0.3)"
                    type="number"
                    color="#fff"
                    name="packing_bags_used"
                    value={item.packing_bags_used}
                    onChange={handleChange(index)}
                  />
                  <FormErrorMessage></FormErrorMessage>
                </FormControl>
                {index > 0 && (
                  <Button
                    mt="10px"
                    colorScheme="red"
                    variant="outline"
                    size="sm"
                    onClick={() => removeMachine(index)}
                  >
                    Remove Machine
                  </Button>
                )}
              </React.Fragment>
            ))}
            <Button
              mt="10px"
              colorScheme="blue"
              variant="outline"
              size="sm"
              onClick={addMachine}
            >
              Add Machine
            </Button>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            width="100px"
            height="45px"
            background="rgba(0,7,81,255)"
            color="#fff"
            onClick={handleAddProduction}
            disabled={
              loading ||
              !production.data.every(
                (item) =>
                  item.machine &&
                  item.operator &&
                  item.quantity &&
                  item.kg_used &&
                  item.packing_bags_used
              ) ||
              !production.date
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

export default AddProductionModal;
