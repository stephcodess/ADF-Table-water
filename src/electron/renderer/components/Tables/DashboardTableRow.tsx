import {
  Avatar,
  AvatarGroup,
  Flex,
  Icon,
  Progress,
  Td,
  Text,
  Tr,
  useColorModeValue,
} from "@chakra-ui/react";
import React from "react";

function DashboardTableRow(props: any) {
  const { date, internal, external, total,lastItem } = props;
  const textColor = useColorModeValue("gray.700", "white");
  return (
    <Tr border={lastItem ? "none" : ""}>
      <Td
        minWidth={{ sm: "250px" }}
        ps="0px"
        borderBottomColor="#56577A"
        
      >
        <Flex align="center" py=".8rem" minWidth="100%" flexWrap="nowrap">
          <Text fontSize="sm" color="#fff" fontWeight="normal" minWidth="100%">
            {date}
          </Text>
        </Flex>
      </Td>
      <Td
        borderBottomColor="#56577A"
        //  border={lastItem ? "none" : null}
      >
       <Text>{internal}</Text>
      </Td>
      <Td
        borderBottomColor="#56577A"
        // border={lastItem ? "none" : null}
      >
        <Text fontSize="sm" color="#fff" fontWeight="bold" pb=".5rem">
          {external}
        </Text>
      </Td>
      <Td
        borderBottomColor="#56577A"
        //  border={lastItem ? "none" : null}
      >
       <Text>{total}</Text>
      </Td>
    </Tr>
  );
}

export default DashboardTableRow;
