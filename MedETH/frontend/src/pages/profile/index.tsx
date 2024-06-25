// @ts-nocheck comment
import React, { useEffect, useState } from "react";
import ProfileForm from "../../components/ProfileForm/ProfileForm";
import { ethers } from "ethers";
import doctorsideabi from "../../utils/abis/doctorsideabi.json";
import {
  Card,
  CardHeader,
  Center,
  CardBody,
  CardFooter,
  Text,
  Box,
  StackDivider,
  Heading,
  Button,
  Flex,
  Link,
  ExternalLinkIcon,
  Stack,
  Divider,
  Grid,
  GridItem,
  VStack,
  chakra,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Container,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
} from "@chakra-ui/react";
import { WarningTwoIcon } from "@chakra-ui/icons";
import { useRouter } from "next/navigation";

export default function Profile() {
  const [prevRec, setPrevRec] = useState();
  const [idCheck, setIdcheck] = useState();
  const [history, setHistory] = useState([]);
  const [click, setClick] = useState(false);
  const [docs, setDocs] = useState([]);
  const [role, setRole] = useState(0);
  const [userid, setUserid] = useState();
  const [userApp, serUserApp] = useState([]);
  const [appButton, setAppButton] = useState(true);
  const [patientData, setPatientData] = useState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalAppId, setModalAppId] = useState(0);
  const [modalFeedBack, setModalFeedback] = useState("");
  const router = useRouter();
  useEffect(() => {
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

        let length;
        let userId;
        res.then((id) => {
          userId = id.toNumber();

          setUserid(userId);
          const role = contract.userIdtoUser(userId);
          role.then((res) => {
            let numRole = res.userRole.toNumber();
            setRole(numRole);
          });

          const history = contract.userIdtoPatientHistory(id.toNumber());

          let checkId;
          history.then((res) => {
            setHistory(res);
            checkId = res[0].toNumber();
            setIdcheck(checkId);
          });
        });
      });
    }
  }, []);

  const getPatientAppointments = async () => {
    if (window.ethereum._state.accounts?.length !== 0) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_DOCTORSIDE_ADDRESS,
        doctorsideabi,
        signer
      );
      const accounts = await provider.listAccounts();
      const tempUserId = await contract.userWalletAddresstoUserId(accounts[0]);
      const tempUserData = await contract.userIdtoUser(tempUserId);
      console.log(tempUserData);
      setPatientData(tempUserData);
      const appLengths = await contract.getMapping2length(tempUserId);
      let tempAppId, tempApp, tempDoc, tempDocId;
      for (let i = 0; i < appLengths; i++) {
        tempAppId = await contract.patIdtoAppointmentId(tempUserId, BigInt(i));
        tempApp = await contract.appointmentIdtoAppointment(tempAppId);
        tempDocId = await contract.userWalletAddresstoUserId(
          tempApp.doctorWalletAddress
        );
        tempDoc = await contract.userIdtoUser(tempDocId);
        console.log(tempApp);
        serUserApp((prevState) => [
          ...prevState,
          { appData: tempApp, docData: tempDoc },
        ]);
      }
      setAppButton(false);
    }
  };

  const getAllDocs = () => {
    if (window.ethereum._state.accounts?.length !== 0) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_DOCTORSIDE_ADDRESS,
        doctorsideabi,
        signer
      );
      const accounts = provider.listAccounts();
      const res = contract.userWalletAddresstoUserId(
        "0xa83A121E9957d69Fd24b133b280eBD4823380dBF"
      );

      const length = contract.getMapping4length(userid);
      length.then((res) => {
        console.log(res._hex);
        for (let i = 0; i < res.toNumber(); i++) {
          let docdata = contract.patientIdtoReport(userid, i);

          docdata.then((res) => {
            setDocs((prevState) => [...prevState, res]);
          });
        }
      });
      setClick(true);
    }
  };

  const appFeedback = async () => {
    if (window.ethereum._state.accounts?.length !== 0) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_DOCTORSIDE_ADDRESS,
        doctorsideabi,
        signer
      );
      const accounts = await provider.listAccounts();
      const tx = await contract.submitAppointmentFeedback(
        modalAppId,
        modalFeedBack
      );
      await tx.wait();
      toast({
        title: "Feedback is being submitted",
        description:
          "This feedback will be reflected on Doctor's Testimonial Page",
        status: "success",
        duration: 1000,
        isClosable: true,
        position: "top-right",
      });
      onClose();
      router.refresh();
    }
  };

  return (
    <div>
      {role !== 3 ? (
        <>
          <Box textAlign="center" py={10} px={6} mt={4}>
            <WarningTwoIcon boxSize={"50px"} color={"orange.300"} />
            <Heading as="h2" size="xl" mt={6} mb={2}>
              Only Registered user can see this page
            </Heading>
            <Text color={"gray.500"}>
              Please Login through registered user wallet address
            </Text>
          </Box>
        </>
      ) : (
        <>
          <ProfileForm />
          {click ? (
            <Center>
              <Heading mt="2%"> All Medical Documents </Heading>
            </Center>
          ) : (
            <Center>
              <Button my="3%" xl onClick={getAllDocs}>
                View All Reports{" "}
              </Button>
            </Center>
          )}

          {docs.map((item) => (
            <Card maxWidth={800} p={6} m="10px auto" mt="3%">
              <CardHeader>
                <Heading size="md"> {item[1]}</Heading>
              </CardHeader>
              <CardBody>
                <Text mt={2}>Prescribed by {item[3]}</Text>
              </CardBody>
              <CardFooter>
                <Stack align={"center"}>
                  <Button>
                    <Link
                      href={`https://gateway.lighthouse.storage/ipfs/${item[4]}`}
                      isExternal
                    >
                      View Document
                    </Link>
                  </Button>
                </Stack>
              </CardFooter>
            </Card>
          ))}
          <Divider mt={12} mb={12} />
          <Center mb={12}>
            <Heading mt="2%"> Appointments:- </Heading>
          </Center>

          <Modal blockScrollOnMount={false} isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>
                Feedback for Appointment Id - {modalAppId}
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Input
                  type="text"
                  onChange={(e) => {
                    setModalFeedback(e.target.value);
                  }}
                />
              </ModalBody>

              <ModalFooter>
                <Button colorScheme="blue" mr={3} onClick={onClose}>
                  Close
                </Button>
                <Button colorScheme="blue" onClick={appFeedback}>
                  Submit Feedback
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          {appButton ? (
            <Center>
              <Button my="3%" onClick={getPatientAppointments}>
                View All Appointments{" "}
              </Button>
            </Center>
          ) : (
            <Box as={Container} maxW="7xl" mt={14} p={4}>
              {!userApp ? (
                <>No Appointments</>
              ) : (
                <TableContainer>
                  <Table variant="simple">
                    <TableCaption>
                      All Appointments booked by {patientData.userName}
                    </TableCaption>
                    <Thead>
                      <Tr>
                        <Th>Appointment Id</Th>
                        <Th>Doctor Name</Th>
                        <Th>Appointment Subject</Th>
                        <Th>Appointment Date and Time</Th>
                        <Th>Appointment Feedback</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {userApp.map((app) => (
                        <Tr>
                          <Td>{Number(app.appData.appId)}</Td>
                          <Td>{app.docData.userName}</Td>
                          <Td>{app.appData.appSubject}</Td>
                          <Td>
                            {app.appData.appDate} ({app.appData.startTime} -{" "}
                            {app.appData.endTime})
                          </Td>
                          <Td>
                            <Button
                              onClick={() => {
                                setModalAppId(Number(app.appData.appId));
                                onOpen();
                              }}
                            >
                              Give Feedback
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </>
      )}
    </div>
  );
}
