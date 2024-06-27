// @ts-nocheck comment
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  Stack,
  Icon,
  Heading,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import {
  HamburgerIcon,
  CloseIcon,
  AddIcon,
  WarningTwoIcon,
} from "@chakra-ui/icons";
import { ConnectKitButton } from "connectkit";

import { ethers } from "ethers";
import doctorsideabi from "../utils/abis/doctorsideabi.json";
import { Link } from "@chakra-ui/next-js";

export default function Navbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [role, setRole] = useState(-1);
  const [userid, setUserid] = useState();
  const [address, setAddress] = useState("");

  useEffect(() => {
    try {
      if (window.ethereum._state.accounts?.length !== 0) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_DOCTORSIDE_ADDRESS,
          doctorsideabi,
          signer
        );
        const accounts = provider.listAccounts();

        accounts.then((account) => {
          const res = contract.userWalletAddresstoUserId(account[0]);
          setAddress(account[0]);
          console.log("Address:", account[0]);
          let length;
          let userId;
          res.then((id) => {
            userId = id.toNumber();

            setUserid(userId);
            const role = contract.userIdtoUser(userId);
            role.then((res) => {
              let numRole = res.userRole.toNumber();
              setRole(numRole);
              console.log("Role:", numRole);
            });
          });
        });
      }
    } catch (e) {
      console.log(e);
    }
  }, [address, role, userid]);
  useEffect(() => {
    try {
      window.ethereum.on("accountsChanged", function () {
        window.location.reload();
      });
    } catch (e) {
      console.log(e);
    }
  }, [address, role]);
  return (
    <>
      <Box bg={useColorModeValue("white", "gray.800")} px={10}>
        <Flex
          h={16}
          alignItems="center"
          justifyContent="space-between"
          mx="auto"
        >
          <IconButton
            size={"md"}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={"Open Menu"}
            display={{ md: "none" }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack
            spacing={8}
            alignItems={"center"}
            fontSize="26px"
            fontWeight="0"
            ml="2"
            color="brand.00"
          >
            <Link href="/">MedETH</Link>
          </HStack>
          <Flex alignItems={"center"}>
            <div style={{ display: "flex" }}>
              {address !== "" ? (
                <>
                  {role === 0 ? (
                    <HStack
                      as={"nav"}
                      spacing={4}
                      display={{ base: "none", md: "flex" }}
                      marginRight={4}
                    >
                      <Link href="/user-registration">
                        <Button w="full" variant="ghost">
                          User Registration
                        </Button>
                      </Link>
                    </HStack>
                  ) : null}
                  {role === 0 ? (
                    <HStack
                      as={"nav"}
                      spacing={4}
                      display={{ base: "none", md: "flex" }}
                      marginRight={4}
                    >
                      <Link href="/doctor-registration">
                        <Button w="full" variant="ghost">
                          Doctor Registration
                        </Button>
                      </Link>
                    </HStack>
                  ) : null}
                  {role === 1 ? (
                    <HStack
                      as={"nav"}
                      spacing={4}
                      display={{ base: "none", md: "flex" }}
                      marginRight={4}
                    >
                      <Link href="/admin">
                        <Button w="full" variant="ghost">
                          Admin
                        </Button>
                      </Link>
                    </HStack>
                  ) : null}

                  {role === 2 ? (
                    <HStack
                      as={"nav"}
                      spacing={4}
                      display={{ base: "none", md: "flex" }}
                      marginRight={4}
                    >
                      <Link href="/doctor-profile">
                        <Button w="full" variant="ghost">
                          Doctor Profile
                        </Button>
                      </Link>
                    </HStack>
                  ) : null}

                  {role === 3 ? (
                    <HStack
                      as={"nav"}
                      spacing={4}
                      display={{ base: "none", md: "flex" }}
                      marginRight={4}
                    >
                      <Link href="/book">
                        <Button w="full" variant="ghost">
                          Book Appointment
                        </Button>
                      </Link>
                    </HStack>
                  ) : null}
                  {role === 3 ? (
                    <HStack
                      as={"nav"}
                      spacing={4}
                      display={{ base: "none", md: "flex" }}
                      marginRight={4}
                    >
                      <Link href="/profile">
                        <Button w="full" variant="ghost">
                          Profile
                        </Button>
                      </Link>
                    </HStack>
                  ) : null}
                </>
              ) : null}

              <HStack>
                <ConnectKitButton />
              </HStack>
            </div>
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: "none" }}>
            <Stack as={"nav"} spacing={4}>
              <Link href="/user-registration">
                <Button w="full" variant="ghost">
                  User Registration
                </Button>
              </Link>
            </Stack>
            <Stack as={"nav"} spacing={4}>
              <Link href="/doctor-registration">
                <Button w="full" variant="ghost">
                  Doctor Registration
                </Button>
              </Link>
            </Stack>
            <Stack as={"nav"} spacing={4}>
              <Link href="/admin">
                <Button w="full" variant="ghost">
                  Admin
                </Button>
              </Link>
            </Stack>
          </Box>
        ) : null}
      </Box>
    </>
  );
}
