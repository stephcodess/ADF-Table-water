import React from "react";
import { Flex } from "@chakra-ui/react";

const IconBox = (props: { [x: string]: any; children: any }) => {
  const { children, ...rest } = props;

  return (
    <Flex
      alignItems={"center"}
      justifyContent={"center"}
      borderRadius={"12px"}
      {...rest}
    >
      {children}
    </Flex>
  );
};

export default IconBox;