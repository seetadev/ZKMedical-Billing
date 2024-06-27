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
  Container,
  SimpleGrid,
  Icon,
} from "@chakra-ui/react";
import Image from "next/image";
import LockSVG from "../../assets/lock-svgrepo-com.svg";
import { ethers } from "ethers";
import { useSigner } from "wagmi";
import doctorsideabi from "../../utils/abis/doctorsideabi.json";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import CardComponent from "@/components/BookAppointmentCard/BookAppointmentCard";
import SpinnerComponent from "../../components/Spinner/Spinner";
import {
  IoAnalyticsSharp,
  IoLogoBitcoin,
  IoSearchSharp,
} from "react-icons/io5";
import { FaAccessibleIcon, FaUserDoctor } from "react-icons/fa";
import { ReactElement } from "react";
import { MdBiotech } from "react-icons/md";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Text,
  Box,
  StackDivider,
  Img,
} from "@chakra-ui/react";
import DocumentCard from "@/components/DocumentCardAdmin/DocumentCard";
import { FormErrorMessage, FormHelperText } from "@chakra-ui/react";
import doctorabi from "../../utils/doctorsideabi.json";
import { useRouter } from "next/router";

const ImagesArray = [
  "https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGRvY3RvcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
  "https://plus.unsplash.com/premium_photo-1661766752153-9f0c3fad728f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGRvY3RvcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1638202993928-7267aad84c31?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGRvY3RvcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZG9jdG9yfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
  "https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGRvY3RvcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
];

const returnRandomImage = () => {
  return ImagesArray[Math.floor(Math.random() * ImagesArray?.length)];
};

interface FeatureProps {
  text: string;
  iconBg: string;
  icon?: ReactElement;
}

const Feature = ({ text, icon, iconBg }: FeatureProps) => {
  return (
    <Stack direction={"row"} align={"center"}>
      <Flex
        w={8}
        h={8}
        align={"center"}
        justify={"center"}
        rounded={"full"}
        bg={iconBg}
      >
        {icon}
      </Flex>
      <Text fontWeight={600}>{text}</Text>
    </Stack>
  );
};

const BookAppointment = () => {
  const [cards, showCards] = useState(false);
  const [error, showError] = useState(false);
  const [userWallet, setUserWallet] = useState("");
  const [loader, setLoader] = useState(false);
  const [sysUsers, setSysUsers] = useState([]);

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
  };

  if (loader) {
    return <SpinnerComponent />;
  }

  if (!cards) {
    return (
      <Container maxW={"5xl"} py={12}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
          <Stack spacing={4}>
            <Text
              textTransform={"uppercase"}
              color={"blue.400"}
              fontWeight={600}
              fontSize={"sm"}
              bg={useColorModeValue("blue.50", "blue.900")}
              p={2}
              alignSelf={"flex-start"}
              rounded={"md"}
            >
              Online Consultations Available
            </Text>
            <Heading>Healthcare at its finest</Heading>
            <Text color={"gray.500"} fontSize={"lg"}>
              Stay ahead of disease and up to date on your health goals with our
              personalized wellness programs. Our team of doctors are here to
              help you achieve your health goals and get the most out of life.
            </Text>
            <Stack
              spacing={4}
              divider={
                <StackDivider
                  borderColor={useColorModeValue("gray.100", "gray.700")}
                />
              }
            >
              <Feature
                icon={
                  <Icon
                    as={IoAnalyticsSharp}
                    color={"yellow.500"}
                    w={5}
                    h={5}
                  />
                }
                iconBg={useColorModeValue("yellow.100", "yellow.900")}
                text={"24 x 7 Intensive Care Unit"}
              />
              <Feature
                icon={<Icon as={MdBiotech} color={"green.500"} w={5} h={5} />}
                iconBg={useColorModeValue("green.100", "green.900")}
                text={"State of the art X-ray/radiology equipments"}
              />
              <Feature
                icon={
                  <Icon as={IoSearchSharp} color={"purple.500"} w={5} h={5} />
                }
                iconBg={useColorModeValue("purple.100", "purple.900")}
                text={"Highly qualified and experienced doctors"}
              />
              <Feature
                icon={
                  <Icon
                    as={FaAccessibleIcon}
                    color={"purple.500"}
                    w={5}
                    h={5}
                  />
                }
                iconBg={useColorModeValue("purple.100", "purple.900")}
                text={"Excellent Rehabilitation Services"}
              />

              <Button onClick={handleClick} colorScheme={"blue"}>
                Book For a Checkup Today
              </Button>
            </Stack>
          </Stack>
          <Flex>
            <Img
              rounded={"md"}
              alt={"feature image"}
              src={returnRandomImage()}
              objectFit={"fit"}
            />
          </Flex>
        </SimpleGrid>
      </Container>
    );
  }

  return (
    <>
      <Grid
        templateRows="repeat(2, 1fr)"
        templateColumns="repeat(4, 1fr)"
        gap={4}
      >
        {sysUsers &&
          sysUsers
            .filter(
              (sysUser: any) => sysUser.isVerified && sysUser.userRole == 2
            )
            .map((sysUser: any, index: any) => {
              return (
                <GridItem rowSpan={1} colSpan={1}>
                  <CardComponent sysUser={sysUser} signal={0} />
                </GridItem>
              );
            })}
      </Grid>
    </>
  );
};

export default BookAppointment;
