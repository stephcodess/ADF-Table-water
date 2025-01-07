import React from "react";
import PropTypes from "prop-types";
import {
  Tr,
  Td,
  Text,
  Button,
  useDisclosure,
  VStack,
  IconButton,
} from "@chakra-ui/react";
import { FaEllipsisV, FaTrash } from "react-icons/fa";
import { Expense } from "../../services/expenses";

// interface Expense {
//   date: string;
//   id: string;
//   item: string;

//   quantity: string;
//   rate: string;
//   total: string;
// }

interface ExpensesTableRowProps {
  row: Partial<Expense>;
  lastItem: boolean;
  onOpen?: () => void;
  setDeleteId?: (id: string) => void;
  internal?: boolean;
}

const ExpensesTableRow: React.FC<ExpensesTableRowProps> = ({
  row,
  lastItem,
  onOpen,
  setDeleteId,
  internal,
}) => {
  const { date, id, item, type, total, reciever } = row;
  const { isOpen, onOpen: onOpenMenu, onClose } = useDisclosure();

  

  return (
    <Tr pos="relative" overflowY="visible">
      <Td
        minWidth={{ sm: "250px" }}
        ps="0px"
        border={lastItem ? "none" : ""}
        borderBottomColor="#56577A"
      >
        <Text>{date?.toDate().toISOString().split("T")[0]}</Text>
      </Td>

      {!internal && (
        <Td
          border={lastItem ? "none" : ""}
          borderBottomColor="#56577A"
          minW="150px"
        >
          <Text fontSize="sm" color="#fff" fontWeight="normal">
            {item ? item : reciever}
          </Text>
        </Td>
      )}
      <Td border={lastItem ? "none" : ""} borderBottomColor="#56577A">
        <Text>{type}</Text>
      </Td>
      <Td border={lastItem ? "none" : ""} borderBottomColor="#56577A">
        <Text>{total}</Text>
      </Td>
      <Td border={lastItem ? "none" : ""} borderBottomColor="#56577A">
        <Button
          onClick={() => {
            isOpen ? onClose() : onOpenMenu();
          }}
          p="0px"
          bg="transparent"
          variant="no-hover"
        >
          <Text
            fontSize="sm"
            color="gray.400"
            fontWeight="bold"
            cursor="pointer"
          >
            <FaEllipsisV />
          </Text>
        </Button>
      </Td>
      {isOpen && (
        <VStack
          width="200px"
          height="fit-content"
          position="absolute"
          right={0}
          zIndex={1000}
          borderRadius="5px"
          background="rgba(0,0,0,0.8)"
          top="80px"
          color="white"
        >
          <Button
            onClick={() => {
              onOpen && onOpen();
              setDeleteId && setDeleteId(id || "");
            }}
            _hover={{
              background: "lightblue",
            }}
            borderBottom="1px solid #fff"
            width="100%"
            height="50%"
            padding={"5px"}
            cursor="pointer"
            textAlign="left"
          >
            <IconButton aria-label="delete" icon={<FaTrash />} />
            <Text>Delete</Text>
          </Button>
          {/* <Button
            _hover={{
              background: "lightblue",
            }}
            width="100%"
            height="50%"
            cursor="pointer"
            padding={"5px"}
            textAlign="left"
          >
            <IconButton aria-label="delete" icon={<FaTrash />} />
            <Text>Edit</Text>
          </Button> */}
        </VStack>
      )}
    </Tr>
  );
};

export default ExpensesTableRow;
