import {
  Box,
  Button,
  Divider,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import React from "react";

const DeleteExpenseModal = ({ isOpen, onClose, handleDelete, deleting }: any) => {
  return (
    <Modal useInert={true} size="xl" isOpen={isOpen} onClose={onClose}>
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent
        height="300px"
        color="#fff"
        backdropFilter="blur(10px)"
        bg="linear-gradient(111.84deg, rgba(6, 11, 38, 0.8) 59.3%, rgba(26, 31, 55, 0.7) 100%)"
      >
        <ModalHeader>Delete Expense</ModalHeader>
        <Divider />
        <ModalBody>
          <Box>
            <Text>Do you want to delete this expense?</Text>
          </Box>
        </ModalBody>
        <Divider />
        <ModalFooter
          display={"flex"}
          flexDirection="row"
          px="10px"
          justifyContent="space-between"
          alignItems="center"
        >
          <Button
            onClick={onClose}
            height="40px"
            width="120px"
            background="red.300"
          >
            Close
          </Button>
          <Button
            onClick={() => handleDelete()}
            height="40px"
            width="120px"
            bg="rgba(0,7,81,255)"
          >
            {deleting ? "Deleting" : "Delete"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteExpenseModal;
