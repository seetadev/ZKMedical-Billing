// @ts-nocheck comment
import {
  Heading,
  Avatar,
  Box,
  Center,
  Image,
  Flex,
  Text,
  Stack,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

import { useSigner } from "wagmi";
import { useToast } from "@chakra-ui/react";
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { LitNetwork } from "@lit-protocol/constants";
import {
  LitAccessControlConditionResource,
  createSiweMessageWithRecaps,
  generateAuthSig,
  LitActionResource,
} from "@lit-protocol/auth-helpers";
import { LitAbility, AuthCallbackParams } from "@lit-protocol/types";
import doctorsideabi from "../../utils/abis/doctorsideabi.json";

const CardComponent = ({ sysUser, signal }) => {
  const age = sysUser.userAge.toNumber();
  const role = sysUser.userRole.toNumber();
  const userId = sysUser.userId.toNumber();

  const [size, setSize] = useState("md");
  const [adharsize, setAdharSize] = useState("md");
  const [decryptedAdhar, setDecryptedAdhar] = useState("");
  const [decryptedDegree, setDecryptedDegree] = useState("");
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const handleSizeClick = async (newSize) => {
    await handleDecryptDegree(sysUser[8]);
    setSize(newSize);
    onEditOpen();
  };

  const handleSizeClick2 = async (newSize) => {
    await handleDecryptAdhar(sysUser[2]);
    setSize(newSize);
    onDeleteOpen();
  };

  const toast = useToast();

  const handleDecryptAdhar = async (stringToDecrypt) => {
    console.log(stringToDecrypt);
    const accessControlConditions = [
      {
        contractAddress: "",
        standardContractType: "",
        chain: "sepolia",
        method: "eth_getBalance",
        parameters: [":userAddress", "latest"],
        returnValueTest: {
          comparator: ">=",
          value: "1000000000000", // 0.000001 ETH
        },
      },
    ];
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const ethAccounts = await provider.send("eth_requestAccounts", []);
    const ethersSigner = provider.getSigner();
    const litNodeClient = new LitJsSdk.LitNodeClient({
      litNetwork: LitNetwork.Cayenne,
    });
    await litNodeClient.connect();

    var nameArr = stringToDecrypt.split(" ");
    var ciphertext = nameArr[0];
    var dataToEncryptHash = nameArr[1];
    console.log(ciphertext);
    console.log(dataToEncryptHash);

    console.log("decrypting...");

    const accsResourceString =
      await LitAccessControlConditionResource.generateResourceString(
        accessControlConditions || [],
        dataToEncryptHash || ""
      );
    console.log(accsResourceString);

    const sessionSigs = await litNodeClient.getSessionSigs({
      chain: "sepolia",
      expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
      resourceAbilityRequests: [
        {
          resource: new LitAccessControlConditionResource(accsResourceString),
          ability: LitAbility.AccessControlConditionDecryption,
        },
      ],
      authNeededCallback: async ({
        resourceAbilityRequests,
        expiration,
        uri,
      }) => {
        const toSign = await createSiweMessageWithRecaps({
          uri,
          expiration,
          resources: resourceAbilityRequests,
          walletAddress: await ethersSigner.getAddress(),
          nonce: await litNodeClient.getLatestBlockhash(),
          litNodeClient,
        });

        return await generateAuthSig({
          signer: ethersSigner,
          toSign,
        });
      },
    });
    console.log(sessionSigs);
    const decryptRes = await LitJsSdk.decryptToString(
      {
        accessControlConditions: accessControlConditions,
        ciphertext: ciphertext,
        dataToEncryptHash: dataToEncryptHash,
        sessionSigs: sessionSigs,
        chain: "sepolia",
      },
      litNodeClient
    );

    console.log("✅ decryptRes:", decryptRes);
    setDecryptedAdhar(decryptRes);
  };

  const handleDecryptDegree = async (stringToDecrypt) => {
    const accessControlConditions = [
      {
        contractAddress: "",
        standardContractType: "",
        chain: "sepolia",
        method: "eth_getBalance",
        parameters: [":userAddress", "latest"],
        returnValueTest: {
          comparator: ">=",
          value: "1000000000000", // 0.000001 ETH
        },
      },
    ];
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const ethAccounts = await provider.send("eth_requestAccounts", []);
    const ethersSigner = provider.getSigner();
    const litNodeClient = new LitJsSdk.LitNodeClient({
      litNetwork: LitNetwork.Cayenne,
    });
    await litNodeClient.connect();

    var nameArr = stringToDecrypt.split(" ");
    var ciphertext = nameArr[0];
    var dataToEncryptHash = nameArr[1];
    console.log(ciphertext);
    console.log(dataToEncryptHash);

    console.log("decrypting...");

    const accsResourceString =
      await LitAccessControlConditionResource.generateResourceString(
        accessControlConditions || [],
        dataToEncryptHash || ""
      );
    console.log(accsResourceString);

    const sessionSigs = await litNodeClient.getSessionSigs({
      chain: "sepolia",
      expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
      resourceAbilityRequests: [
        {
          resource: new LitAccessControlConditionResource(accsResourceString),
          ability: LitAbility.AccessControlConditionDecryption,
        },
      ],
      authNeededCallback: async ({
        resourceAbilityRequests,
        expiration,
        uri,
      }) => {
        const toSign = await createSiweMessageWithRecaps({
          uri,
          expiration,
          resources: resourceAbilityRequests,
          walletAddress: await ethersSigner.getAddress(),
          nonce: await litNodeClient.getLatestBlockhash(),
          litNodeClient,
        });

        return await generateAuthSig({
          signer: ethersSigner,
          toSign,
        });
      },
    });
    console.log(sessionSigs);
    const decryptRes = await LitJsSdk.decryptToString(
      {
        accessControlConditions: accessControlConditions,
        ciphertext: ciphertext,
        dataToEncryptHash: dataToEncryptHash,
        sessionSigs: sessionSigs,
        chain: "sepolia",
      },
      litNodeClient
    );

    console.log("✅ decryptRes:", decryptRes);
    setDecryptedDegree(decryptRes);
  };

  const approveUser = async () => {
    if (window.ethereum._state.accounts?.length !== 0) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_DOCTORSIDE_ADDRESS,
        doctorsideabi,
        signer
      );

      const tx = await contract.approveUser(userId);

      const data = { email: sysUser[5] };
      fetch("http://localhost:5000/doctor-approval", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((data) => console.log(data))
        .catch((error) => console.error("Error:", error));

      await tx.wait();
      toast({
        title: "Registration approved! ",
        description: "Please refresh the page to see the results.",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
    }
  };
  return (
    <div>
      <Center py={6}>
        <Box
          maxW={"325px"}
          w={"full"}
          bg={useColorModeValue("white", "gray.800")}
          boxShadow={"2xl"}
          rounded={"md"}
          overflow={"hidden"}
        >
          <Image
            h={"120px"}
            w={"full"}
            src={
              "https://images.unsplash.com/photo-1612865547334-09cb8cb455da?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80"
            }
            objectFit={"cover"}
          />
          <Flex justify={"center"} mt={-12}>
            <Avatar
              size={"xl"}
              src={`https://gateway.lighthouse.storage/ipfs/${sysUser[7]}`}
              alt={"Author"}
              css={{
                border: "2px solid white",
              }}
            />
          </Flex>

          <Box p={6}>
            <Stack spacing={0} align={"center"} mb={5}>
              <Heading fontSize={"2xl"} fontWeight={500} fontFamily={"body"}>
                {sysUser[1]}
              </Heading>
              {role == 1 && <Text color={"gray.500"}>Admin</Text>}
              {role == 2 && <Text color={"gray.500"}>Doctor</Text>}
              {role == 3 && <Text color={"gray.500"}>User</Text>}
              {role == 4 && <Text color={"gray.500"}>Others</Text>}
            </Stack>

            <Stack direction={"column"} justify={"left"}>
              <Stack spacing={0} align={"center"}>
                <Text fontWeight={600}>Email: {sysUser[5]}</Text>
              </Stack>

              <Stack spacing={0} align={"center"}>
                {role == 2 ? (
                  <Text fontWeight={600}>License No: {sysUser[3]}</Text>
                ) : null}
              </Stack>
              <Stack spacing={0} align={"center"}>
                <Text fontWeight={600}>Experience (in years): {age}</Text>
              </Stack>
            </Stack>

            <Button
              w={"full"}
              mt={8}
              bg={useColorModeValue("#151f21", "gray.900")}
              color={"white"}
              rounded={"md"}
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "lg",
              }}
              onClick={() => handleSizeClick("xl")}
            >
              View Degree
            </Button>
            <Button
              w={"full"}
              mt={8}
              bg={useColorModeValue("#151f21", "gray.900")}
              color={"white"}
              rounded={"md"}
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "lg",
              }}
              onClick={() => handleSizeClick2("xl")}
            >
              View Aadhar
            </Button>
            {signal == 1 && (
              <Button
                w={"full"}
                mt={8}
                bg={useColorModeValue("#151f21", "gray.900")}
                color={"white"}
                rounded={"md"}
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "lg",
                }}
                onClick={approveUser}
              >
                Approve
              </Button>
            )}
            <Modal isOpen={isEditOpen} onClose={onEditClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Degree</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  {role == 2 ? (
                    <Image
                      src={`https://gateway.lighthouse.storage/ipfs/${decryptedDegree}`}
                    ></Image>
                  ) : (
                    <Text>User and other 3rd parties do not need a degree</Text>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button onClick={onEditClose}>Close</Button>
                </ModalFooter>
              </ModalContent>
            </Modal>

            <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>AdharCard</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <Image
                    src={`https://gateway.lighthouse.storage/ipfs/${decryptedAdhar}`}
                  ></Image>
                </ModalBody>
                <ModalFooter>
                  <Button onClick={onDeleteClose}>Close</Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </Box>
        </Box>
      </Center>
    </div>
  );
};

export default CardComponent;
