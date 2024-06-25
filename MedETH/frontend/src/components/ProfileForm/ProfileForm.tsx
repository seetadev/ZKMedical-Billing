// @ts-nocheck comment
import React, { useState, useRef } from "react";
import { ethers } from "ethers";
import {
  Progress,
  Icon,
  toast,
  Text,
  chakra,
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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Radio,
  RadioGroup,
  Stack,
  useToast,
} from "@chakra-ui/react";

import doctorsideabi from "../../utils/abis/doctorsideabi.json";
import lighthouse from "@lighthouse-web3/sdk";

export default function ProfileForm() {
  const [diabetes, setDiabetes] = useState(false);
  const [disablilities, setDisabilities] = useState(false);
  const [highbp, setHighbp] = useState(false);
  const inputRef = useRef(null);
  const toast = useToast();
  const [name, setName] = useState("");
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
      title: "Previous Medical Record Uploaded to the IPFS.",
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

  const uploadReport = async () => {
    if (window.ethereum._state.accounts?.length !== 0) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_DOCTORSIDE_ADDRESS,
        doctorsideabi,
        signer
      );

      const accounts = await provider.listAccounts();
      contract.uploadMedicalReprt(name, accounts[0], accounts[0], ipfsUrl);
    }
  };

  const handleSubmit = async () => {
    if (window.ethereum._state.accounts?.length !== 0) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_DOCTORSIDE_ADDRESS,
        doctorsideabi,
        signer
      );

      const accounts = await provider.listAccounts();
      contract.userWalletAddresstoUserId(accounts[0]).then((id) => {
        let numid = id.toNumber();
        console.log(numid);

        contract.takeUserHistory(numid, disablilities, highbp, diabetes, 0);
      });
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
        <Heading w="100%" textAlign={"center"} fontWeight="normal">
          Update Medical History
        </Heading>
        <Flex>
          <FormControl mr="5%" mt="4%">
            <FormLabel htmlFor="diabetes" fontWeight={"normal"}>
              Are you diagnosed with diabetes ?
            </FormLabel>
            <RadioGroup defaultValue="1">
              <Stack spacing={5} direction="row">
                <Radio
                  colorScheme="red"
                  value="1"
                  onChange={() => setDiabetes(false)}
                >
                  No
                </Radio>
                <Radio
                  colorScheme="green"
                  value="2"
                  onChange={() => setDiabetes(true)}
                >
                  Yes
                </Radio>
              </Stack>
            </RadioGroup>
          </FormControl>
        </Flex>
        <Flex>
          <FormControl mr="5%" mt="4%">
            <FormLabel htmlFor="disablilities" fontWeight={"normal"}>
              Do you have any disablilities ?
            </FormLabel>
            <RadioGroup defaultValue="1">
              <Stack spacing={5} direction="row">
                <Radio
                  colorScheme="red"
                  value="1"
                  onChange={() => setDisabilities(false)}
                >
                  No
                </Radio>
                <Radio
                  colorScheme="green"
                  value="2"
                  onChange={() => setDisabilities(true)}
                >
                  Yes
                </Radio>
              </Stack>
            </RadioGroup>
          </FormControl>
        </Flex>
        <Flex>
          <FormControl mr="5%" mt="4%">
            <FormLabel htmlFor="bp" fontWeight={"normal"}>
              Are you diagnosed with high blood pressure ?
            </FormLabel>
            <RadioGroup defaultValue="1">
              <Stack spacing={5} direction="row">
                <Radio
                  colorScheme="red"
                  value="1"
                  onChange={() => setHighbp(false)}
                >
                  No
                </Radio>
                <Radio
                  colorScheme="green"
                  value="2"
                  onChange={() => setHighbp(true)}
                >
                  Yes
                </Radio>
              </Stack>
            </RadioGroup>
          </FormControl>
        </Flex>
        <FormControl mt="2%">
          <FormLabel
            fontWeight={"normal"}
            color="gray.700"
            _dark={{
              color: "gray.50",
            }}
          >
            Previous Medical Record
          </FormLabel>

          <Input onChange={(e) => uploadFile(e.target.files)} type="file" />

          <FormControl mt="2%" mr="5%">
            <FormLabel htmlFor="first-name" fontWeight={"normal"}>
              Report Name
            </FormLabel>
            <Input
              id="first-name"
              placeholder="Full name"
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>
          <Button mt="2%" onClick={uploadReport}>
            Upload Medical Report
          </Button>
        </FormControl>
        <Button onClick={handleSubmit} mt="2%">
          Submit
        </Button>
      </Box>
    </>
  );
}
