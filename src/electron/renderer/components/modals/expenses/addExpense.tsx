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
  Select,
  VStack,
} from "@chakra-ui/react";
import React, { ChangeEvent, useEffect, useState } from "react";
import {
  Expense,
  updateExpense,
  useAddExpense,
  useUpdateExpense,
} from "../../../services/expenses";
import { Machinery, useGetAllMachines } from "../../../services/machineries";
import { Employee, useGetAllEmployees } from "../../../services/employees";
import { randomString } from "../../../utils/variables/randomString";
import { Timestamp } from "firebase/firestore";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  refetch: () => void;
  initialExpense?: Expense | null; // Pass existing expense for editing
}

export type ExpenseType =
  | "purchase"
  | "plumbing"
  | "repair"
  | "salary"
  | "iou / salary advance"
  | "commission"
  | "operators"
  | "loaders"
  | "ROI"
  | "running cost"
  | "license renewal"
  | "Vehicle paper"
  | "Tax"
  | "Rent"
  | "bonus"
  | "others";

const all_expense_types = [
  "purchase",
  "plumbing",
  "repair",
  "salary",
  "iou / salary advance",
  "commission",
  "operators",
  "loaders",
  "ROI",
  "running cost",
  "license renewal",
  "Vehicle paper",
  "Tax",
  "Rent",
  "bonus",
  "others",
];

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  refetch,
  initialExpense
}) => {
  const { employees } = useGetAllEmployees();
  const [addExpense, loading, error] = useAddExpense();
  const {
    machines,
    loading: machinesLoading,
    error: machinesError,
  } = useGetAllMachines();
  const [updateExpense, updating, updateError] = useUpdateExpense();

  const isEditing = !!initialExpense; // True if an existing expense is passed

  const [expense, setExpense] = useState<Expense>({
    quantity: initialExpense?.quantity || "",
    date: initialExpense?.date || Timestamp.now(),
    id: initialExpense?.id || randomString,
    item: initialExpense?.item || "",
    rate: initialExpense?.rate || "",
    total: initialExpense?.total || "",
    type: initialExpense?.type || ("" as ExpenseType),
    reciever: initialExpense?.reciever || "",
    description: initialExpense?.description || "",
  });

  useEffect(() => {
    if (initialExpense) {
      setExpense(initialExpense);
    }
  }, [initialExpense]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Parse quantity and rate to numbers
    const quantity =
      name === "quantity" ? parseFloat(value) : parseFloat(expense.quantity);
    const rate = name === "rate" ? parseFloat(value) : parseFloat(expense.rate);

    // Calculate total based on the type of change
    let total = expense.total;
    if (name === "quantity" || name === "rate") {
      total =
        isNaN(quantity) || isNaN(rate) ? "" : (quantity * rate).toFixed(2);
    }

    // Clear existing entries for quantity, rate, and total when the type changes
    if (name === "type") {
      total = "";
      setExpense((prevState) => ({
        ...prevState,
        item: "",
        quantity: "",
        rate: "",
        description: "", // Reset description when type changes
      }));
    }

    // Convert date string back to Timestamp if the date input is changed
    const newValue =
      name === "date" ? Timestamp.fromDate(new Date(value)) : value;
    setExpense((prevState) => ({
      ...prevState,
      [name]: newValue,
      total:
        name === "quantity" || name === "rate" || name === "type"
          ? total
          : name === "total"
            ? value
            : prevState.total,
    }));
  };

  const handleAddExpense = async () => {
    try {
      if (isEditing) {
        await updateExpense(expense.id, expense); // Update existing expense
      } else {
        await addExpense(expense); // Add new expense
      }
      refetch();
      onClose();
    } catch (e) {
      console.error("Error submitting expense:", e);
    }
  };

  return (
    <Modal useInert={true} size="xl" isOpen={isOpen} onClose={onClose}>
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent
        height="auto"
        minH="300px"
        color="#fff"
        backdropFilter="blur(10px)"
        bg="linear-gradient(111.84deg, rgba(6, 11, 38, 0.8) 59.3%, rgba(26, 31, 55, 0.7) 100%)"
      >
        <ModalCloseButton />
        <ModalHeader>
          {isEditing ? "Edit Expense" : "Add New Expense"}
        </ModalHeader>

        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Date</FormLabel>
              <Input
                width="100%"
                height="50px"
                borderRadius="50px"
                border="1px solid rgba(255,255,255,0.3)"
                color="#fff"
                type="date"
                name="date"
                value={expense.date.toDate().toISOString().split("T")[0]}
                onChange={handleChange}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Type</FormLabel>
              <Select
                width="100%"
                height="50px"
                borderRadius="50px"
                border="1px solid rgba(255,255,255,0.3)"
                color="#fff"
                name="type"
                value={expense.type}
                onChange={handleChange}
              >
                <option value="">Select Type</option>
                {all_expense_types.map(
                  (expense_type: string, index: number) => (
                    <option key={index} value={expense_type}>
                      {expense_type}
                    </option>
                  )
                )}
              </Select>
            </FormControl>
            {expense.type === "repair" && (
              <FormControl>
                <FormLabel>Item</FormLabel>
                <Select
                  width="100%"
                  height="50px"
                  borderRadius="50px"
                  border="1px solid rgba(255,255,255,0.3)"
                  color="#fff"
                  name="item"
                  value={expense.item}
                  onChange={handleChange}
                >
                  <option value="">Select Item</option>
                  {machines &&
                    machines.map((machine: Machinery, index: number) => (
                      <option key={index} value={machine.model}>
                        {machine.model}
                      </option>
                    ))}
                  <option value="electrical">Electrical</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="General">General</option>
                  <option value="others">Others</option>
                </Select>
              </FormControl>
            )}
            {expense.type === "purchase" && (
              <FormControl>
                <FormLabel>Item</FormLabel>
                <Select
                  width="100%"
                  height="50px"
                  borderRadius="50px"
                  border="1px solid rgba(255,255,255,0.3)"
                  color="#fff"
                  name="item"
                  value={expense.item}
                  onChange={handleChange}
                >
                  <option value="">Select Item</option>
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="packing nylon">Packing Nylon</option>
                  <option value="nylon roll">Nylon Roll</option>
                  <option value="diesel">Bottle</option>
                  <option value="Liquid Wash">Liquid Wash</option>
                  <option value="Tyres">Tyre (Automobile)</option>
                  <option value="Engine Oil">Engine Oil</option>
                  <option value="Oil Filter">Oil Filter</option>
                  <option value="Tube(Automobile)">Tube (Automobile)</option>
                  <option value="PHCN">PHCN</option>
                  <option value="others">Others</option>
                </Select>
              </FormControl>
            )}

            {/* Show Description Field if "Others" is Selected */}
            {(expense.item === "others" || expense.type === "others") && (
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input
                  width="100%"
                  height="50px"
                  borderRadius="50px"
                  border="1px solid rgba(255,255,255,0.3)"
                  color="#fff"
                  type="text"
                  name="description"
                  value={expense.description}
                  onChange={handleChange}
                />
              </FormControl>
            )}

            {(expense.type === "salary" ||
              expense.type === "bonus" ||
              expense.type === "operators" ||
              expense.type === "loaders" ||
              expense.type === "commission" ||
              expense.type === "ROI" ||
              expense.type === "iou / salary advance") && (
              <FormControl>
                <FormLabel>Employee</FormLabel>
                <Select
                  width="100%"
                  height="50px"
                  borderRadius="50px"
                  border="1px solid rgba(255,255,255,0.3)"
                  color="#fff"
                  name="reciever"
                  value={expense.reciever}
                  onChange={handleChange}
                >
                  <option value="">Select Employee</option>
                  {employees &&
                    employees.map((employee: Employee, index: number) => (
                      <option
                        key={index}
                        value={employee.last_name + " " + employee.other_names}
                      >
                        {employee.last_name + " " + employee.other_names}
                      </option>
                    ))}
                </Select>
              </FormControl>
            )}

            {expense.type === "purchase" && (
              <>
                <FormControl>
                  <FormLabel>Quantity</FormLabel>
                  <Input
                    width="100%"
                    height="50px"
                    borderRadius="50px"
                    border="1px solid rgba(255,255,255,0.3)"
                    color="#fff"
                    type="number"
                    name="quantity"
                    value={expense.quantity}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Rate</FormLabel>
                  <Input
                    width="100%"
                    height="50px"
                    borderRadius="50px"
                    border="1px solid rgba(255,255,255,0.3)"
                    color="#fff"
                    type="number"
                    name="rate"
                    value={expense.rate}
                    onChange={handleChange}
                  />
                </FormControl>
              </>
            )}
            <FormControl>
              <FormLabel>Total</FormLabel>
              <Input
                width="100%"
                height="50px"
                borderRadius="50px"
                border="1px solid rgba(255,255,255,0.3)"
                color="#fff"
                type="number"
                name="total"
                value={expense.total}
                onChange={handleChange}
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button color="white" variant="outline" mr={3} onClick={onClose}>
            Close
          </Button>

          <Button
            colorScheme="teal"
            onClick={handleAddExpense}
            isLoading={loading || updating}
          >
            {isEditing ? "Update Expense" : "Add Expense"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddExpenseModal;
