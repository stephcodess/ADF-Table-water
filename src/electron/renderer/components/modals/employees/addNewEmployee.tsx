import React, { useMemo, useState } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  HStack,
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
  useToast,
} from "@chakra-ui/react";
import { useTable, Column } from "react-table";
import { Employee, useAddEmployee, useGetAllEmployees } from "../../../services/employees";
import { randomString } from "../../../utils/variables/randomString";

const AddNewEmployee = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const toast = useToast();
  const [employee, setEmployee] = useState<Employee>({
    id: randomString,
    last_name: "",
    other_names: "",
    role: "",
    salary: "",
    employment_date: "",
  });
  const [addEmployee, loading, error] = useAddEmployee();

  const { employees, refetch } = useGetAllEmployees(); // Fetch and manage employee list

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEmployee((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleAddEmployee = async () => {
    try {
      await addEmployee(employee);
      toast({
        title: "Employee added successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      refetch(); // Refresh the employee list
      onClose();
    } catch (e) {
      console.error("Error adding employee:", e);
    }
  };

  const roles = [
    "driver",
    "operator",
    "loader",
    "factory cleaner",
    "packer",
    "manager",
    "marketer",
    "sales rep",
  ];


  return (
    <>
      <Modal useInert={true} size="xl" isOpen={isOpen} onClose={onClose}>
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent
          backdropBlur="10px"
          width={{ base: "90%", md: "80%", lg: "800px" }}
          height="fit-content"
          borderRadius="15px"
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
              Add New Employee
            </Text>
          </ModalHeader>
          <ModalBody>
            <VStack color="#fff" marginTop="50px" gap="20px">
              <HStack width="100%">
                <FormControl>
                  <FormLabel>Other Names</FormLabel>
                  <Input
                    width="100%"
                    height="50px"
                    borderRadius="50px"
                    border="1px solid rgba(255,255,255,0.3)"
                    type="text"
                    color="#fff"
                    name="other_names"
                    value={employee.other_names}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Last Name</FormLabel>
                  <Input
                    width="100%"
                    height="50px"
                    borderRadius="50px"
                    border="1px solid rgba(255,255,255,0.3)"
                    type="text"
                    color="#fff"
                    name="last_name"
                    value={employee.last_name}
                    onChange={handleChange}
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Role</FormLabel>
                <Select
                  width="100%"
                  height="50px"
                  borderRadius="50px"
                  border="1px solid rgba(255,255,255,0.3)"
                  color="#fff"
                  name="role"
                  value={employee.role}
                  onChange={handleChange}
                >
                  <option value="">Select Role</option>
                  {roles.map((role, index) => (
                    <option
                      key={index}
                      value={role}
                      style={{
                        textTransform: "uppercase",
                        background: "rgba(0,0,0,0.7)",
                        color: "#fff",
                      }}
                    >
                      {role}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>
                  {employee.role === "operator"
                    ? "Rate per bag produced"
                    : "Salary"}
                </FormLabel>
                <Input
                  width="100%"
                  height="50px"
                  borderRadius="50px"
                  border="1px solid rgba(255,255,255,0.3)"
                  type="text"
                  color="#fff"
                  name="salary"
                  value={employee.salary}
                  onChange={handleChange}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Employment Date</FormLabel>
                <Input
                  width="100%"
                  height="50px"
                  borderRadius="50px"
                  border="1px solid rgba(255,255,255,0.3)"
                  type="date"
                  color="#fff"
                  name="employment_date"
                  value={employee.employment_date}
                  onChange={handleChange}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              width="100px"
              height="45px"
              background="rgba(0,7,81,255)"
              color="#fff"
              onClick={handleAddEmployee}
              disabled={loading || Object.values(employee).some((val) => !val)}
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
    </>
  );
};

export default AddNewEmployee;
