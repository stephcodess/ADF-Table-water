import {
  Box,
  Button,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import React from "react";

export const DeleteIncomeModal = ({
  isOpen,
  onClose,
  handleDelete,
  deleting,
  selectedCount = 1, // Number of items selected for deletion
}: {
  isOpen: boolean;
  onClose: () => void;
  handleDelete: () => void;
  deleting: boolean;
  selectedCount?: number;
}) => {
  return (
    <Modal useInert={true} size="xl" isOpen={isOpen} onClose={onClose}>
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent
        height="300px"
        color="#fff"
        backdropFilter="blur(10px)"
        bg="linear-gradient(111.84deg, rgba(6, 11, 38, 0.8) 59.3%, rgba(26, 31, 55, 0.7) 100%)"
      >
        <ModalHeader>Delete Income</ModalHeader>
        <Divider />
        <ModalBody>
          <Box>
            {selectedCount > 1 ? (
              <Text>
                Do you want to delete these <strong>{selectedCount}</strong>{" "}
                income details?
              </Text>
            ) : (
              <Text>Do you want to delete this income detail?</Text>
            )}
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
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
