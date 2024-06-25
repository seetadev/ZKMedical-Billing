// @ts-nocheck comment
import React from "react";
import { Spinner, Flex, Stack, useColorModeValue } from "@chakra-ui/react";

const spinner = () => {
  return (
    <Flex
      align={"center"}
      justify={"center"}
      bg={useColorModeValue("gray.50", "gray.800")}
      flexDir={"row"}
      justifyContent={"space-evenly"}
    >
      <Stack>
        <Stack
          spacing={4}
          w={"full"}
          maxW={"md"}
          rounded={"xl"}
          boxShadow={"lg"}
          p={6}
          my={12}
        >
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            size="xl"
          />
        </Stack>
      </Stack>
    </Flex>
  );
};

export default spinner;
