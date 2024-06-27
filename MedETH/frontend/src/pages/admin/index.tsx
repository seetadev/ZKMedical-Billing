// @ts-nocheck comment
import React, { useState, useEffect } from "react";
import {
  Grid,
  GridItem,
  Center,
  Button,
  Flex,
  Stack,
  useColorModeValue,
  Heading,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import Image from "next/image";
import LockSVG from "../../assets/lock-svgrepo-com.svg";
import { ethers } from "ethers";
import { useSigner } from "wagmi";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import CardComponent from "@/components/CardComponent/CardComponent";
import SpinnerComponent from "../../components/Spinner/Spinner";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Text,
  Box,
  StackDivider,
} from "@chakra-ui/react";
import DocumentCard from "@/components/DocumentCardAdmin/DocumentCard";
import { FormErrorMessage, FormHelperText } from "@chakra-ui/react";
import doctorsideabi from "../../utils/abis/doctorsideabi.json";
import { useRouter } from "next/router";

const Admin = () => {
  const [password, setPassword] = useState("");
  const [cards, showCards] = useState(false);
  const [error, showError] = useState(false);
  const [userWallet, setUserWallet] = useState("");
  const [loader, setLoader] = useState(false);
  const [sysUsers, setSysUsers] = useState([]);
  const [docArray, setDocArray] = useState([]);
  const router = useRouter();

  const handleClick = async (e: any) => {
    if (window.ethereum._state.accounts?.length !== 0) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_DOCTORSIDE_ADDRESS,
        doctorsideabi,
        signer
      );
      const accounts = await provider.listAccounts();
      setUserWallet(accounts[0]);
      if (password == "admin") {
        setLoader(true);
        const totalUsers = Number(await contract.totalUsers());
        let userData = await contract.userIdtoUser(1);
        console.log(userData);

        for (let i = 1; i < totalUsers; i++) {
          userData = await contract.userIdtoUser(i);
          console.log(userData);
          setSysUsers((prevState) => [...prevState, userData]);
        }

        setLoader(false);
        showCards(true);
      } else {
        showError(true);
      }
    } else {
      showError(true);
    }
  };

  if (loader) {
    return <SpinnerComponent />;
  }

  if (!cards) {
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
            <Image src={LockSVG} width={250} alt="Lock SVG" />
          </Stack>
        </Stack>
        <Stack
          spacing={4}
          w={"full"}
          maxW={"md"}
          bg={useColorModeValue("white", "gray.700")}
          rounded={"xl"}
          boxShadow={"lg"}
          p={6}
          my={12}
        >
          <Heading lineHeight={1.1} fontSize={{ base: "2xl", md: "3xl" }}>
            Enter Admin Security Key
          </Heading>
          <FormControl id="password" isRequired>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
          </FormControl>
          <Stack spacing={6}>
            <Button
              bg={"blue.400"}
              color={"white"}
              _hover={{
                bg: "blue.500",
              }}
              onClick={(e) => {
                handleClick(e);
              }}
            >
              Submit
            </Button>
          </Stack>
        </Stack>
      </Flex>
    );
  }

  return (
    <Tabs>
      <TabList>
        <Tab>All</Tab>
        <Tab>Unverified</Tab>
        <Tab>Verified</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <Grid
            templateRows="repeat(2, 1fr)"
            templateColumns="repeat(4, 1fr)"
            gap={4}
          >
            {sysUsers &&
              sysUsers.map((sysUser: any, index: any) => {
                return (
                  <GridItem rowSpan={1} colSpan={1}>
                    <CardComponent sysUser={sysUser} signal={0} />
                  </GridItem>
                );
              })}
          </Grid>
        </TabPanel>
        <TabPanel>
          <Grid
            templateRows="repeat(2, 1fr)"
            templateColumns="repeat(4, 1fr)"
            gap={4}
          >
            {sysUsers &&
              sysUsers
                .filter((sysUser: any) => sysUser.isVerified == false)
                .map((sysUser: any, index: any) => {
                  return (
                    <GridItem rowSpan={1} colSpan={1}>
                      <CardComponent sysUser={sysUser} signal={1} />
                    </GridItem>
                  );
                })}
          </Grid>
        </TabPanel>
        <TabPanel>
          <Grid
            templateRows="repeat(2, 1fr)"
            templateColumns="repeat(4, 1fr)"
            gap={4}
          >
            {sysUsers &&
              sysUsers
                .filter((sysUser: any) => sysUser.isVerified)
                .map((sysUser: any, index: any) => {
                  return (
                    <GridItem rowSpan={1} colSpan={1}>
                      <CardComponent sysUser={sysUser} signal={0} />
                    </GridItem>
                  );
                })}
          </Grid>
        </TabPanel>
        <TabPanel>
          <Grid
            templateRows="repeat(2, 1fr)"
            templateColumns="repeat(4, 1fr)"
            gap={4}
          >
            {sysUsers &&
              sysUsers
                .filter(
                  (sysUser: any) => sysUser.role == 3 && sysUser.isVerified
                )
                .map((sysUser: any, index: any) => {
                  return (
                    <GridItem rowSpan={1} colSpan={1}>
                      <CardComponent sysUser={sysUser} signal={0} />
                    </GridItem>
                  );
                })}
          </Grid>
        </TabPanel>
        <TabPanel>
          <Grid
            templateRows="repeat(2, 1fr)"
            templateColumns="repeat(4, 1fr)"
            gap={4}
          >
            {sysUsers &&
              sysUsers
                .filter(
                  (sysUser: any) => sysUser.role == 2 && sysUser.isVerified
                )
                .map((sysUser: any, index: any) => {
                  return (
                    <GridItem rowSpan={1} colSpan={1}>
                      <CardComponent sysUser={sysUser} signal={0} />
                    </GridItem>
                  );
                })}
          </Grid>
        </TabPanel>
        <TabPanel>
          <Grid
            templateRows="repeat(2, 1fr)"
            templateColumns="repeat(4, 1fr)"
            gap={4}
          >
            {sysUsers &&
              sysUsers
                .filter(
                  (sysUser: any) => sysUser.role == 4 && sysUser.isVerified
                )
                .map((sysUser: any, index: any) => {
                  return (
                    <GridItem rowSpan={1} colSpan={1}>
                      <CardComponent sysUser={sysUser} signal={0} />
                    </GridItem>
                  );
                })}
          </Grid>
        </TabPanel>
        <TabPanel>
          <Grid
            templateRows="repeat(2, 1fr)"
            templateColumns="repeat(4, 1fr)"
            gap={4}
          >
            {sysUsers &&
              sysUsers
                .filter(
                  (sysUser: any) => sysUser.role == 1 && sysUser.isVerified
                )
                .map((sysUser: any, index: any) => {
                  return (
                    <GridItem rowSpan={1} colSpan={1}>
                      <CardComponent sysUser={sysUser} signal={0} />
                    </GridItem>
                  );
                })}
          </Grid>
        </TabPanel>

        <TabPanel>
          <FormControl>
            <FormLabel>Email address</FormLabel>
            <Input type="email" />
            <FormHelperText>We'll never share your email.</FormHelperText>
          </FormControl>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default Admin;
