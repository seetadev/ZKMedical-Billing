// @ts-nocheck comment
import { useState, useRef } from "react";
import { ethers } from "ethers";
import doctorsideabi from "../../utils/abis/doctorsideabi.json";
import {
  Progress,
  Text,
  Stack,
  chakra,
  Icon,
  VisuallyHidden,
  Box,
  ButtonGroup,
  Button,
  Heading,
  Flex,
  FormControl,
  GridItem,
  FormLabel,
  Input,
  Select,
  SimpleGrid,
  InputLeftAddon,
  InputGroup,
  Textarea,
  FormHelperText,
  InputRightElement,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
} from "@chakra-ui/react";

import { useToast } from "@chakra-ui/react";
import lighthouse from "@lighthouse-web3/sdk";

const UserRegistration = () => {
  const toast = useToast();

  const [name, setName] = useState("");
  const [age, setAge] = useState();
  const [email, setEmail] = useState("");
  const inputRef = useRef(null);
  //   const [aadharImage, setAadharImage] = useState();
  const [ipfsUrl, setIpfsUrl] = useState("");

  const progressCallback = (progressData) => {
    let percentageDone =
      100 - (progressData?.total / progressData?.uploaded)?.toFixed(2);
    console.log(percentageDone);
  };

  const uploadFile = async (file) => {
    const output = await lighthouse.upload(
      file,
      process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY,
      false,
      null,
      progressCallback
    );
    console.log("File Status:", output);

    setIpfsUrl(output.data.Hash);

    toast({
      title: "Aadhar Card Uploaded to the IPFS.",
      description: "Congratulations 🎉 ",
      status: "success",
      duration: 1000,
      isClosable: true,
      position: "top-right",
    });

    console.log(
      "Visit at https://gateway.lighthouse.storage/ipfs/" + output.data.Hash
    );
  };

  const handleSubmit = async () => {
    if (window.ethereum._state.accounts?.length !== 0) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_DOCTORSIDE_ADDRESS,
          doctorsideabi,
          signer
        );

        const tx = await contract.createUser(
          name,
          ipfsUrl,
          "",
          age,
          email,
          "",
          "",
          "",
          3
        );

        toast({
          title: "Registration request sent",
          description: "Please wait for the transaction to be confirmed",
          status: "info",
          duration: 1000,
          isClosable: true,
          position: "top-right",
        });
      } catch (e) {
        console.log(e);
        toast({
          title: "Get MediToken to register",
          description: "Atleast 1 MediToken is required to register",
          status: "error",
          duration: 1000,
          isClosable: true,
          position: "top-right",
        });
      }
    }
  };

  return (
    <>
      <Box
        borderWidth="1px"
        rounded="lg"
        shadow="1px 1px 3px rgba(0,0,0,0.3)"
        maxWidth={800}
        p={6}
        m="10px auto"
        as="form"
      >
        <Heading w="100%" textAlign={"center"} fontWeight="normal" mb="2%">
          User Registration
        </Heading>

        <FormControl mr="5%">
          <FormLabel htmlFor="first-name" fontWeight={"normal"}>
            Name
          </FormLabel>
          <Input
            id="first-name"
            placeholder="Full name"
            onChange={(e) => setName(e.target.value)}
          />
        </FormControl>
        <FormControl mr="5%" mt="2%">
          <FormLabel htmlFor="age" fontWeight={"normal"}>
            Age
          </FormLabel>
          <NumberInput
            step={1}
            defaultValue={18}
            min={1}
            onChange={(value) => setAge(value)}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
        <FormControl mt="2%" mr="5%">
          <FormLabel htmlFor="first-name" fontWeight={"normal"}>
            Email
          </FormLabel>
          <Input
            id="first-name"
            placeholder="Full name"
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>
        <FormControl mt="2%">
          <FormLabel
            fontWeight={"normal"}
            color="gray.700"
            _dark={{
              color: "gray.50",
            }}
          >
            Aadhaar Card
          </FormLabel>

          <Input onChange={(e) => uploadFile(e.target.files)} type="file" />
        </FormControl>
        <Button onClick={handleSubmit} mt="2%">
          Submit
        </Button>
      </Box>
    </>
  );
};

export default UserRegistration;
