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

type TablesTableRowData = {
  row: Employee;
  lastItem: boolean;
  onOpen?: () => void;
  setDeleteId?: any;
};
function TablesTableRow(props: TablesTableRowData) {
  const { id, last_name, other_names, role, salary, employment_date } =
    props.row;

  const { onOpen, setDeleteId } = props;

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
        <Flex align="center" py=".8rem" minWidth="100%" flexWrap="nowrap">
          <Avatar src="" w="50px" borderRadius="12px" me="18px" border="none" />
          <Flex direction="column">
            <Text
              fontSize="sm"
              color="#fff"
              fontWeight="normal"
              minWidth="100%"
            >
              {last_name + " " + other_names}
            </Text>
            {/* <Text fontSize="sm" color="gray.400" fontWeight="normal">
              {email}
            </Text> */}
          </Flex>
        </Flex>
      </Td>

      <Td
        border={lastItem ? "none" : ""}
        borderBottomColor="#56577A"
        minW="150px"
      >
        <Flex direction="column">
          <Text fontSize="sm" color="#fff" fontWeight="normal">
            {role}
          </Text>
          {/* <Text fontSize="sm" color="gray.400" fontWeight="normal">
            {address}
          </Text> */}
        </Flex>
      </Td>
      {/* <Td border={lastItem ? "none" : ""} borderBottomColor="#56577A">
        <Text>{gender}</Text>
      </Td>
      <Td border={lastItem ? "none" : ""} borderBottomColor="#56577A">
        <Text fontSize="sm" color="#fff" fontWeight="normal">
          {phone_number}
        </Text>
      </Td> */}
      <Td border={lastItem ? "none" : ""} borderBottomColor="#56577A">
        <Text fontSize="sm" color="#fff" fontWeight="normal">
          {employment_date}
        </Text>
      </Td>
      <Td border={lastItem ? "none" : ""} borderBottomColor="#56577A">
        <Text fontSize="sm" color="#fff" fontWeight="normal">
          {salary}
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
      <Td>
        <HStack
          onClick={() => {
            onOpen && onOpen();
            setDeleteId && setDeleteId(id);
          }}
          padding={"5px"}
          cursor="pointer"
        >
          <IconButton aria-label="delete" icon={<FaTrash />} />
          {/* <Text>Delete</Text> */}
        </HStack>
      </Td>
    </Tr>
  );
}

export default TablesTableRow;
