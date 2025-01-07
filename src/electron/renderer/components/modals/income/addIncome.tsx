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
import React, { useState, useEffect } from "react";
import { Employee, useGetAllEmployees } from "../../../services/employees";
import { Income, useAddIncome } from "../../../services/income";
import { randomString } from "../../../utils/variables/randomString";
import { Timestamp } from "firebase/firestore";
import {
  Machinery,
  useGetAllMachineriesByCategory,
} from "../../../services/machineries";

const AddInternalSales = ({
  isOpen,
  onClose,
  refetch,
  type,
}: {
  isOpen: boolean;
  onClose: () => void;
  refetch: () => void;
  type: "internal" | "external";
}) => {
  const [income, setIncome] = useState<Income>({
    id: randomString,
    driver: "",
    truck: "",
    date: Timestamp.now(),
    no_of_bags: 0,
    rate: 0,
    total: 0,
    bags_by_truck: [],
    type: type,
  });
  const [addIncome, loading, error] = useAddIncome();
  const { employees: drivers, refetch: fetchDrivers } =
    useGetAllEmployees("driver");
  const { machineries, refetch: refetchTrucks } =
    useGetAllMachineriesByCategory("trucks");

  useEffect(() => {
    if (machineries) {
      const initialBags = machineries.map((machine) => ({
        truck: machine.model,
        bags: 0,
      }));

      setIncome((prev) => ({
        ...prev,
        bags_by_truck: initialBags,
      }));
    }
  }, [machineries]);

  // useEffect(() => {
  //   fetchDrivers();
  //   refetchTrucks();
  // }, [fetchDrivers, refetchTrucks]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    truck?: string
  ) => {
    const { name, value } = e.target;

    const parsedValue =
      value === ""
        ? value
        : name === "rate" || name === "no_of_bags"
          ? name === "rate"
            ? parseFloat(value)
            : parseInt(value)
          : value;

    const newValue =
      name === "date" ? Timestamp.fromDate(new Date(value)) : parsedValue;

    if (name !== "bags_by_truck") {
      setIncome((prevState) => ({
        ...prevState,
        [name]: newValue,
        total:
          name === "rate"
            ? parseFloat(value || "0") * prevState.no_of_bags
            : name === "no_of_bags"
              ? prevState.rate * parseInt(value || "0")
              : prevState.total,
      }));
    } else {
      const updatedBagsByTruck = income.bags_by_truck?.map((item) =>
        item.truck === truck ? { ...item, bags: parseInt(value || "0") } : item
      );

      const totalBags = updatedBagsByTruck?.reduce(
        (sum, item) => sum + (item.bags || 0),
        0
      );

      setIncome((prev) => ({
        ...prev,
        no_of_bags: totalBags || 0,
        bags_by_truck: prev?.bags_by_truck?.map((item) =>
          item.truck === truck
            ? { ...item, bags: parseInt(value || "0") }
            : item
        ),
        total: prev.rate * (totalBags || 0),
      }));
    }
  };



  const handleAddIncome = async () => {
    try {
      await addIncome(income);
      refetch();
      onClose();
    } catch (e) {
      console.error("Error adding income:", e);
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
                value={income.date.toDate().toISOString().split("T")[0]}
                onChange={handleChange}
              />
              <FormErrorMessage></FormErrorMessage>
            </FormControl>
            {type === "external" && (
              <>
                <FormControl>
                  <FormLabel>Driver</FormLabel>
                  <Select
                    width="100%"
                    height="50px"
                    borderRadius="50px"
                    border="1px solid rgba(255,255,255,0.3)"
                    color="#fff"
                    name="driver"
                    value={income.driver}
                    onChange={(e) =>
                      setIncome((prevState) => ({
                        ...prevState,
                        driver: e.target.value,
                      }))
                    }
                  >
                    <option value="" disabled>
                      Select Driver
                    </option>
                    {drivers &&
                      drivers.map((driver: Employee) => (
                        <option
                          key={driver.id}
                          value={driver.other_names + " " + driver.last_name}
                        >
                          {driver.other_names + " " + driver.last_name}
                        </option>
                      ))}
                  </Select>
                  <FormErrorMessage></FormErrorMessage>
                </FormControl>
                {machineries &&
                  machineries?.map((machinery: Machinery) => (
                    <FormControl key={machinery.id}>
                      <FormLabel>No of Bags for {machinery.model}</FormLabel>
                      <Input
                        width="100%"
                        height="50px"
                        borderRadius="50px"
                        border="1px solid rgba(255,255,255,0.3)"
                        type="number"
                        color="#fff"
                        name="bags_by_truck"
                        value={
                          income.bags_by_truck?.find(
                            (bag) => bag.truck === machinery.model
                          )?.bags
                        }
                        onChange={(e) => handleChange(e, machinery.model)}
                      />
                      <FormErrorMessage></FormErrorMessage>
                    </FormControl>
                  ))}
              </>
            )}

            {type === "internal" && (
              <FormControl>
                <FormLabel>No of Bags</FormLabel>
                <Input
                  width="100%"
                  height="50px"
                  borderRadius="50px"
                  border="1px solid rgba(255,255,255,0.3)"
                  type="number"
                  color="#fff"
                  name="no_of_bags"
                  value={income.no_of_bags || ""}
                  onChange={handleChange}
                />
                <FormErrorMessage></FormErrorMessage>
              </FormControl>
            )}

            <FormControl>
              <FormLabel>Rate</FormLabel>
              <Input
                width="100%"
                height="50px"
                borderRadius="50px"
                border="1px solid rgba(255,255,255,0.3)"
                type="number"
                color="#fff"
                name="rate"
                value={income.rate || ""}
                onChange={handleChange}
              />
              <FormErrorMessage></FormErrorMessage>
            </FormControl>
            <FormControl>
              <FormLabel>Total</FormLabel>
              <Input
                width="100%"
                height="50px"
                borderRadius="50px"
                border="1px solid rgba(255,255,255,0.3)"
                type="number"
                color="#fff"
                disabled
                name="total"
                value={income.total || ""}
              />
              <FormErrorMessage></FormErrorMessage>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            width="100px"
            height="45px"
            background="rgba(0,7,81,255)"
            color="#fff"
            onClick={handleAddIncome}
            disabled={
              loading ||
              !income.date ||
              income.no_of_bags <= 0 ||
              income.rate <= 0
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

export default AddInternalSales;
