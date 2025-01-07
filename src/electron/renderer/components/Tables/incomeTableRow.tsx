import {
  Button,
  Td,
  Text,
  Tr,
  useColorModeValue,
  VStack,
  HStack,
  IconButton,
  useDisclosure,
  Flex,
} from "@chakra-ui/react";
import { FaEllipsisV, FaTrash, FaEdit } from "react-icons/fa";
import { Income } from "../../services/income";
import React from "react";

type IncomesTableRowProps = {
  row: Income;
  lastItem: boolean;
  onOpenDelete: () => void;
  onOpenEdit: () => void;
  internal?: boolean;
};

const IncomesTableRow: React.FC<IncomesTableRowProps> = ({
  row,
  lastItem,
  onOpenDelete,
  onOpenEdit,
  internal = false,
}) => {
  const { date, no_of_bags, rate, total, truck, driver } = row;
  const textColor = useColorModeValue("gray.700", "white");
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Tr pos="relative" overflowY="visible">
      <Td
        minWidth={{ sm: "250px" }}
        ps="0px"
        border={lastItem ? "none" : ""}
        borderBottomColor="#56577A"
      >
        <Text>{date.toDate().toISOString().split("T")[0]}</Text>
      </Td>
      {!internal && (
        <Td
          border={lastItem ? "none" : ""}
          borderBottomColor="#56577A"
          minW="150px"
        >
          <Flex direction="column">
            <Text fontSize="sm" color="#fff" fontWeight="normal">
              {truck}
            </Text>
            <br></br>
            <Text fontSize="sm" color="gray.400" fontWeight="normal">
              {driver}
            </Text>
          </Flex>
        </Td>
      )}
      <Td border={lastItem ? "none" : ""} borderBottomColor="#56577A">
        <Text>{no_of_bags}</Text>
      </Td>
      <Td border={lastItem ? "none" : ""} borderBottomColor="#56577A">
        <Text fontSize="sm" color="#fff" fontWeight="normal">
          {rate}
        </Text>
      </Td>
      <Td border={lastItem ? "none" : ""} borderBottomColor="#56577A">
        <Text fontSize="sm" color="#fff" fontWeight="normal">
          {total}
        </Text>
      </Td>
      <Td border={lastItem ? "none" : ""} borderBottomColor="#56577A">
        <Button
          onClick={() => {
            isOpen ? onClose() : onOpen();
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
          top="50px"
          color={textColor}
        >
          <HStack
            _hover={{
              background: "lightblue",
            }}
            borderBottom="1px solid #fff"
            width="100%"
            onClick={() => {
              onOpenDelete();
              onClose();
            }}
            height="50%"
            padding={"5px"}
            cursor="pointer"
          >
            <IconButton aria-label="delete" icon={<FaTrash />} />
            <Text>Delete</Text>
          </HStack>
          <HStack
            _hover={{
              background: "lightblue",
            }}
            width="100%"
            height="50%"
            cursor="pointer"
            padding={"5px"}
            onClick={() => {
              onOpenEdit();
              onClose();
            }}
          >
            <IconButton aria-label="edit" icon={<FaEdit />} />
            <Text>Edit</Text>
          </HStack>
        </VStack>
      )}
    </Tr>
  );
};

export default IncomesTableRow;
