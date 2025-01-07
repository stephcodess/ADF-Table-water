import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Td,
  Text,
  Tr,
  useColorModeValue,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { Employee } from "../../services/employees";
import { FaEllipsisV, FaTrash } from "react-icons/fa";
import { Income } from "../../services/income";
import { Machinery } from "../../services/machineries";

type MachineryTableProps = {
  row: Machinery;
  lastItem: boolean;
  onOpen?: () => void;
  setDeleteId?: any;
  index: number;
};
function MachineryTableRow(props: MachineryTableProps) {
  const { id, capacity, category, model } = props.row;

  const { onOpen, setDeleteId, index } = props;

  const lastItem = props.lastItem;
  const textColor = useColorModeValue("gray.700", "white");
  const bgStatus = useColorModeValue("gray.400", "#1a202c");
  const colorStatus = useColorModeValue("white", "gray.400");
  const { isOpen, onOpen: onOpenMenu, onClose } = useDisclosure();

  return (
    <Tr pos="relative" overflowY="visible">
      <Td
        minWidth={{ sm: "250px" }}
        ps="0px"
        border={lastItem ? "none" : ""}
        borderBottomColor="#56577A"
      >
        <Text>{index}</Text>
      </Td>

      <Td
        border={lastItem ? "none" : ""}
        borderBottomColor="#56577A"
        minW="150px"
      >
        <Text fontSize="sm" color="#fff" fontWeight="normal">
          {model}
        </Text>
      </Td>
      <Td border={lastItem ? "none" : ""} borderBottomColor="#56577A">
        <Text>{category}</Text>
      </Td>
      <Td border={lastItem ? "none" : ""} borderBottomColor="#56577A">
        <Text fontSize="sm" color="#fff" fontWeight="normal">
          {capacity}
        </Text>
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
          color={colorStatus}
        >
          <HStack
            _hover={{
              background: "lightblue",
            }}
            borderBottom="1px solid #fff"
            width="100%"
            onClick={() => {
              onOpen && onOpen();
              setDeleteId && setDeleteId(id);
            }}
            height="50%"
            padding={"5px"}
            cursor="pointer"
          >
            <IconButton aria-label="delete" icon={<FaTrash />} />
            <Text>Delete</Text>
          </HStack>
           {/* <HStack
            _hover={{
              background: "lightblue",
            }}
            width="100%"
            height="50%"
            cursor="pointer"
            padding={"5px"}
          >
            <IconButton aria-label="delete" icon={<FaTrash />} />
            <Text>Edit</Text>
          </HStack> */}
        </VStack>
      )}
    </Tr>
  );
}

export default MachineryTableRow;
