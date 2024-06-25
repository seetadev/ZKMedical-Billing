// @ts-nocheck comment
import React, { useState, useEffect, useRef } from "react";
import { HuddleIframe } from "@huddle01/iframe";
import axios from "axios";
import { Textarea } from "@chakra-ui/react";
import { ethers } from "ethers";
import doctorsideabi from "../../utils/abis/doctorsideabi.json";
import spinner from "@/components/Spinner/Spinner";
import {
  Box,
  VStack,
  Button,
  Flex,
  Divider,
  chakra,
  Grid,
  GridItem,
  Container,
  Center,
  Input,
  Text,
  ButtonGroup,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  VisuallyHidden,
  Stack,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import lighthouse from "@lighthouse-web3/sdk";

interface DataProps {
  heading: string;
  text: string;
}

const Feature = ({ heading, text }: DataProps) => {
  return (
    <GridItem>
      <chakra.h3 fontSize="xl" fontWeight="600">
        {heading}
      </chakra.h3>
      <chakra.p>{text}</chakra.p>
    </GridItem>
  );
};

const index = () => {
  const [loading, setLoading] = useState(true);
  const [userWalletAddress, setUserWalletAddress] = useState("");
  const [doctorInfo, setDoctorInfo] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [access, setAccess] = useState(true);
  const [date, setDate] = useState("choosen date");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [signal, setSignal] = useState(false);
  const [meetLink, setMeetLink] = useState();
  const toast = useToast();
  const router = useRouter();
  const [appSignal, setAppSignal] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const inputRef = useRef(null);
  const [ipfsUrl, setIpfsUrl] = useState("");
  const [reportName, setReportName] = useState("");
  const [clientMail, setClientMail] = useState("");
  const [aptDate, setAptDate] = useState("");
  const [aptstartTime, setaptStartTime] = useState("");
  const [aptendTime, setaptEndTime] = useState("");
  const [modalPatientName, setModalPatientName] = useState("");
  const [modalAppointmentDateTime, setModalAppointmentDateTime] = useState("");
  const [modalPatientWallet, setModalPatientWallet] = useState("");

  // doctor email: - doctorInfo.userEmail
  // patient email: -

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
      title: "Prescription Uploaded to the IPFS.",
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

  const loadDoctorinfo = async () => {
    if (window.ethereum._state.accounts?.length !== 0) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_DOCTORSIDE_ADDRESS,
        doctorsideabi,
        signer
      );
      const accounts = await provider.listAccounts();
      setUserWalletAddress(accounts[0]);
      const userId = await contract.userWalletAddresstoUserId(accounts[0]);
      const userInfo = await contract.userIdtoUser(userId);
      setDoctorInfo(userInfo);
      if (Number(userInfo.userRole) === 2) {
        setLoading(false);
        setAccess(true);
      } else {
        setLoading(false);
        setAccess(false);
      }
    } else {
      return <div>Wallet not connected</div>;
    }
  };

  const loadAppointmentData = async () => {
    if (window.ethereum._state.accounts?.length !== 0) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_DOCTORSIDE_ADDRESS,
        doctorsideabi,
        signer
      );
      const accounts = await provider.listAccounts();
      setUserWalletAddress(accounts[0]);
      const userId = await contract.userWalletAddresstoUserId(accounts[0]);
      const userInfo = await contract.userIdtoUser(userId);

      if (Number(userInfo.userRole) === 2) {
        setLoading(false);
        setAccess(true);
        const totAppointments = await contract.getMapping1length(userId);
        console.log("Total appointments are: " + totAppointments);
        let tempAppointmentId, tempAppointment, appPatId, appPat;
        for (let i = totAppointments - 1; i >= 0; i--) {
          tempAppointmentId = await contract.docIdtoAppointmentId(userId, i);
          tempAppointment = await contract.appointmentIdtoAppointment(
            tempAppointmentId
          );
          console.log(tempAppointment);

          setAptDate(tempAppointment[1]);
          setaptStartTime(tempAppointment[2]);
          setaptEndTime(tempAppointment[3]);
          appPatId = await contract.userWalletAddresstoUserId(
            tempAppointment.patientWalletAddress
          );
          appPat = await contract.userIdtoUser(appPatId);

          setAppointments((prevState) => [
            ...prevState,
            { appPayload: tempAppointment, patPayload: appPat },
          ]);
          setAppSignal(true);
        }
      } else {
        setLoading(false);
        setAccess(false);
      }
    } else {
      return <div>Wallet not connected</div>;
    }
  };

  const loadTimeSlots = async (givenDate) => {
    console.log(givenDate);
    if (window.ethereum._state.accounts?.length !== 0) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_DOCTORSIDE_ADDRESS,
        doctorsideabi,
        signer
      );
      const accounts = await provider.listAccounts();
      setUserWalletAddress(accounts[0]);
      const userId = await contract.userWalletAddresstoUserId(accounts[0]);
      const userInfo = await contract.userIdtoUser(userId);
      setDoctorInfo(userInfo);
      const totalSlots = await contract.getMapping3length(userId, givenDate);
      console.log(`Total slots on ${givenDate} are ${totalSlots}`);
      let tempTimeSlot;
      for (let i = 0; i < totalSlots; i++) {
        tempTimeSlot = await contract.doctorIdtoDatetoTimeSlot(
          userId,
          givenDate,
          i
        );
        console.log(tempTimeSlot);
        setTimeSlots((prevState) => [...prevState, tempTimeSlot]);
      }
      setSignal(true);
    }
  };

  const openTimeSlot = async () => {
    if (window.ethereum._state.accounts?.length !== 0) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_DOCTORSIDE_ADDRESS,
        doctorsideabi,
        signer
      );
      const accounts = await provider.listAccounts();
      setUserWalletAddress(accounts[0]);
      const tx = await contract.openTimeslots(date, startTime, endTime);
      toast({
        title: "Time Slot Opened",
        description: "Please wait for the transaction to be confirmed",
        status: "info",
        duration: 1000,
        isClosable: true,
        position: "top-right",
      });
      await tx.wait();
      router.refresh();
    }
  };

  const getLink = async (ptemail) => {
    const response = await axios.post(
      "https://api.huddle01.com/api/v1/create-iframe-room",
      {
        title: "Consulatation meet",
        roomLocked: false,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "zmBzpDcHjwa1IkbJhUaPw4OmS7BJtIPu",
        },
      }
    );
    const meet1 = response.data.data.meetingLink;
    console.log(aptDate);
    console.log(meet1);
    console.log(aptstartTime);
    console.log(aptendTime);
    console.log(ptemail);
    console.log(doctorInfo.userEmail);

    const data = {
      email: ptemail,
      link: meet1,
      date: aptDate,
      startTime: aptstartTime,
      endTime: aptendTime,
    };
    fetch("http://localhost:5000/patient-link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.error("Error:", error));

    const data2 = {
      email: doctorInfo.userEmail,
      link: meet1,
      date: aptDate,
      startTime: aptstartTime,
      endTime: aptendTime,
    };

    fetch("http://localhost:5000/doctor-link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data2),
    })
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.error("Error:", error));

    toast({
      title: "Meet Link sent on mail.",
      description:
        "We have sent meet link to both your mail as well as patients mail ",
      status: "success",
      duration: 1000,
      isClosable: true,
      position: "top-right",
    });

    setMeetLink(response.data.data.meetingLink);
  };

  const approveAppointment = async (givenAppId) => {
    if (window.ethereum._state.accounts?.length !== 0) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_DOCTORSIDE_ADDRESS,
        doctorsideabi,
        signer
      );
      const accounts = await provider.listAccounts();
      setUserWalletAddress(accounts[0]);
      const tx = await contract.approveAppointment(givenAppId);
      toast({
        title: "Appointment Approved",
        description:
          "A confirmation mail will be sent to the associated patient",
        status: "info",
        duration: 1000,
        isClosable: true,
        position: "top-right",
      });
      await tx.wait();
      router.refresh();
    }
  };

  const uploadPatientReport = async (patientWallet, doctorWallet) => {
    if (window.ethereum._state.accounts?.length !== 0) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_DOCTORSIDE_ADDRESS,
        doctorsideabi,
        signer
      );
      const accounts = await provider.listAccounts();
      setUserWalletAddress(accounts[0]);

      const tx = await contract.uploadMedicalReprt(
        reportName,
        patientWallet,
        doctorWallet,
        ipfsUrl
      );
      toast({
        title: "Document is being uploaded",
        description:
          "A confirmation mail will be sent to the associated patient",
        status: "info",
        duration: 1000,
        isClosable: true,
        position: "top-right",
      });
      await tx.wait();
      onClose();
      router.refresh();
    }
  };

  useEffect(() => {
    loadDoctorinfo();
  }, []);

  if (loading) {
    return <div>loading...</div>;
  } else if (!access) {
    return (
      <div>
        User is not a verified doctor. Only verified doctors can access this
        page.
      </div>
    );
  }

  console.log(appointments);

  return (
    <div>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload Report</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              {/* <FormLabel>Appointment Id</FormLabel>
                                <Input
                                  type="text"
                                  value={Number(appoint.appPayload.appId)}
                                /> */}

              <FormLabel>Patient Name</FormLabel>
              <Input type="text" value={modalPatientName} />

              {/* <FormLabel>Doctor Name</FormLabel>
                                <Input
                                  type="text"
                                  value={doctorInfo.userName}
                                /> */}

              {/* <FormLabel>Patient Wallet Address</FormLabel>
                                <Input
                                  type="text"
                                  value={
                                    appoint.appPayload.patientWalletAddress
                                  }
                                /> */}

              {/* <FormLabel>Doctor Wallet Address</FormLabel>
                                <Input
                                  type="text"
                                  value={appoint.appPayload.doctorWalletAddress}
                                /> */}

              <FormLabel>Appointment Date and time</FormLabel>
              <Input type="text" value={modalAppointmentDateTime} />

              <FormLabel>Report Name</FormLabel>
              <Input
                type="text"
                onChange={(e) => {
                  setReportName(e.target.value);
                }}
                value={reportName}
              />

              <FormLabel mt={2}>Upload Document</FormLabel>
              <Input onChange={(e) => uploadFile(e.target.files)} type="file" />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                uploadPatientReport(
                  modalPatientWallet,
                  doctorInfo.userWalletAddress
                );
              }}
            >
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Box as={Container} maxW="7xl" mt={14} p={4}>
        <Grid
          templateColumns={{
            base: "repeat(1, 1fr)",
            sm: "repeat(2, 1fr)",
            md: "repeat(2, 1fr)",
          }}
          gap={4}
        >
          <GridItem colSpan={3}>
            <VStack alignItems="flex-start" spacing="20px">
              <chakra.h2 fontSize="3xl" fontWeight="700">
                Welcome, {doctorInfo.userName} to your personalised dashboard!
              </chakra.h2>
            </VStack>
          </GridItem>
        </Grid>
        <Divider mt={12} mb={12} />
        <Grid
          templateColumns={{
            base: "repeat(1, 1fr)",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          }}
          gap={{ base: "8", sm: "12", md: "16" }}
        >
          <Feature heading={"Name"} text={doctorInfo.userName} />
          <Feature heading={"License No."} text={doctorInfo.userLicenseNo} />
          <Feature
            heading={"Years of experience"}
            text={doctorInfo.userAge.toString()}
          />
          <Feature heading={"Email"} text={doctorInfo.userEmail} />
          <Feature heading={"Speciality"} text={doctorInfo.userSpeciality} />
          <Feature
            heading={"Wallet Address"}
            text={doctorInfo.userWalletAddress}
          />
        </Grid>
        <Divider mt={12} mb={12} />
        <Grid
          templateColumns={{
            base: "repeat(1, 1fr)",
            sm: "repeat(2, 1fr)",
            md: "repeat(2, 1fr)",
          }}
          gap={4}
        >
          <GridItem colSpan={3}>
            <VStack alignItems="flex-start" spacing="20px">
              <chakra.h2 fontSize="3xl" fontWeight="700">
                Open Timeslots
              </chakra.h2>
            </VStack>
          </GridItem>
        </Grid>
        <Divider mt={12} mb={12} />
        <Grid
          templateColumns={{
            base: "repeat(1, 1fr)",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          }}
          gap={{ base: "8", sm: "12", md: "16" }}
        >
          <GridItem>
            <Text mb="8px">Choose appropriate Date: </Text>
            <Input
              placeholder="Select Date"
              size="md"
              type="date"
              variant={"filled"}
              onChange={(e) => {
                setDate(e.target.value);
                loadTimeSlots(e.target.value);
              }}
            />
          </GridItem>
          <GridItem>
            <Text mb="8px">Choose appropriate Time: </Text>
            <Input
              placeholder="Select Time"
              size="md"
              type="time"
              variant={"filled"}
              onChange={(e) => {
                setStartTime(e.target.value);
              }}
            />
          </GridItem>
          <GridItem>
            <Text mb="8px">Choose appropriate Time: </Text>
            <Input
              placeholder="Select Time"
              size="md"
              type="time"
              variant={"filled"}
              onChange={(e) => {
                setEndTime(e.target.value);
              }}
            />
          </GridItem>
        </Grid>
        <Grid
          mt={4}
          templateColumns={{
            base: "repeat(1, 1fr)",
            sm: "repeat(1, 1fr)",
            md: "repeat(1, 1fr)",
          }}
          gap={4}
        >
          <Button
            onClick={() => {
              openTimeSlot();
            }}
          >
            Open New Slot
          </Button>
        </Grid>
        <Divider mt={6} mb={6} />
        <Grid
          templateColumns={{
            base: "repeat(1, 1fr)",
            sm: "repeat(2, 1fr)",
            md: "repeat(2, 1fr)",
          }}
          gap={4}
        >
          <GridItem colSpan={3}>
            <VStack alignItems="flex-start" spacing="20px">
              <chakra.h4 fontSize="3xl" fontWeight="700">
                Open slots on {date} are :
              </chakra.h4>
            </VStack>
          </GridItem>
        </Grid>
        <Divider mt={6} mb={6} />
        <Grid
          templateColumns={{
            base: "repeat(1, 1fr)",
            sm: "repeat(2, 1fr)",
            md: "repeat(8, 1fr)",
          }}
          gap={{ base: "8", sm: "12", md: "16" }}
        >
          {timeSlots &&
            timeSlots
              .filter((ts) => ts.isBooked == false)
              .map((ts) => (
                <GridItem>
                  <Button colorScheme="teal" variant="solid">
                    {ts.startTime} - {ts.endTime}
                  </Button>
                </GridItem>
              ))}
        </Grid>
        <Divider mt={12} mb={12} />
        <Grid
          templateColumns={{
            base: "repeat(1, 1fr)",
            sm: "repeat(2, 1fr)",
            md: "repeat(2, 1fr)",
          }}
          gap={4}
        >
          <GridItem colSpan={3}>
            <VStack alignItems="flex-start" spacing="20px">
              <chakra.h4 fontSize="3xl" fontWeight="700">
                Appointments: -
              </chakra.h4>
            </VStack>
          </GridItem>
        </Grid>
        <Divider mt={12} mb={12} />
        <Grid
          templateColumns={{
            base: "repeat(1, 1fr)",
            sm: "repeat(1, 1fr)",
            md: "repeat(1, 1fr)",
          }}
          gap={4}
        >
          <GridItem colSpan={3}>
            {appSignal ? (
              <Tabs>
                <TabList>
                  <Tab>All</Tab>
                  <Tab>Normal</Tab>
                  <Tab>Emergency</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <TableContainer>
                      <Table variant="simple">
                        <TableCaption>All Appointments</TableCaption>
                        <Thead>
                          <Tr>
                            <Th>App Id.</Th>
                            <Th>Patient Name</Th>
                            <Th>Patient Age</Th>
                            <Th>App Subject</Th>
                            <Th>App date</Th>
                            <Th>App Time</Th>
                            <Th>App Status</Th>
                            <Th>Upload User Report</Th>
                            <Th>Generate Meeting</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {appointments.map((appoint) => (
                            <Tr>
                              <Td isNumeric>
                                {Number(appoint.appPayload.appId)}
                              </Td>
                              <Td>{appoint.patPayload.userName}</Td>
                              <Td>
                                {Number(appoint.patPayload.userAge)} years
                              </Td>
                              <Td>
                                <Textarea
                                  width="300px"
                                  rows={3} // Set the number of rows (height)
                                  // Set the number of columns (width)
                                  resize="none" // Prevent resizing
                                  value={appoint.appPayload[4]}
                                />
                              </Td>
                              <Td>{appoint.appPayload.appDate}</Td>
                              <Td>
                                {appoint.appPayload.startTime} -{" "}
                                {appoint.appPayload.endTime}
                              </Td>
                              {appoint.appPayload.isApproved ? (
                                <Td>Approved</Td>
                              ) : (
                                <Td>
                                  <Button
                                    onClick={() => {
                                      approveAppointment(
                                        appoint.appPayload.appId
                                      );
                                    }}
                                  >
                                    Approve
                                  </Button>
                                </Td>
                              )}
                              <Td>
                                <Button
                                  onClick={() => {
                                    setModalPatientName(
                                      appoint.patPayload.userName
                                    );
                                    setModalAppointmentDateTime(
                                      `${appoint.appPayload.appDate} (${appoint.appPayload.startTime} - ${appoint.appPayload.endTime})`
                                    );
                                    setModalPatientWallet(
                                      appoint.patPayload.userWalletAddress
                                    );
                                    onOpen();
                                  }}
                                >
                                  Upload Prescription
                                </Button>
                              </Td>
                              <Td>
                                <Button
                                  onClick={() => {
                                    getLink(appoint.patPayload[5]);
                                  }}
                                >
                                  Generate Link
                                </Button>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </TabPanel>
                  <TabPanel>
                    <TableContainer>
                      <Table variant="simple">
                        <TableCaption>All Appointments</TableCaption>
                        <Thead>
                          <Tr>
                            <Th>App Id.</Th>
                            <Th>Patient Name</Th>
                            <Th>Patient Age</Th>
                            <Th>App Subject</Th>
                            <Th>App date</Th>
                            <Th>App Time</Th>
                            <Th>App Status</Th>
                            <Th>Upload User Report</Th>
                            <Th>Generate Meeting</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {appointments
                            .filter(
                              (appoint) => appoint.appPayload.appType == 0
                            )
                            .map((appoint) => (
                              <Tr>
                                <Td isNumeric>
                                  {Number(appoint.appPayload.appId)}
                                </Td>
                                <Td>{appoint.patPayload.userName}</Td>
                                <Td>
                                  {Number(appoint.patPayload.userAge)} years
                                </Td>
                                <Td>
                                  <Textarea
                                    width="300px"
                                    rows={3} // Set the number of rows (height)
                                    // Set the number of columns (width)
                                    resize="none" // Prevent resizing
                                    value={appoint.appPayload[4]}
                                  />
                                </Td>
                                <Td>{appoint.appPayload.appDate}</Td>
                                <Td>
                                  {appoint.appPayload.startTime} -{" "}
                                  {appoint.appPayload.endTime}
                                </Td>
                                {appoint.appPayload.isApproved ? (
                                  <Td>Approved</Td>
                                ) : (
                                  <Td>
                                    <Button
                                      onClick={() => {
                                        approveAppointment(
                                          appoint.appPayload.appId
                                        );
                                      }}
                                    >
                                      Approve
                                    </Button>
                                  </Td>
                                )}
                                <Td>
                                  <Button
                                    onClick={() => {
                                      setModalPatientName(
                                        appoint.patPayload.userName
                                      );
                                      setModalAppointmentDateTime(
                                        `${appoint.appPayload.appDate} (${appoint.appPayload.startTime} - ${appoint.appPayload.endTime})`
                                      );
                                      setModalPatientWallet(
                                        appoint.patPayload.userWalletAddress
                                      );
                                      onOpen();
                                    }}
                                  >
                                    Upload Prescription
                                  </Button>
                                </Td>
                                <Td>
                                  <Button
                                    onClick={() => {
                                      getLink(appoint.patPayload[5]);
                                    }}
                                  >
                                    Generate Link
                                  </Button>
                                </Td>
                              </Tr>
                            ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </TabPanel>
                  <TabPanel>
                    <TableContainer>
                      <Table variant="simple">
                        <TableCaption>All Appointments</TableCaption>
                        <Thead>
                          <Tr>
                            <Th>App Id.</Th>
                            <Th>Patient Name</Th>
                            <Th>Patient Age</Th>
                            <Th>App Subject</Th>
                            <Th>App date</Th>
                            <Th>App Time</Th>
                            <Th>App Status</Th>
                            <Th>Upload User Report</Th>
                            <Th>Generate Meeting</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {appointments
                            .filter(
                              (appoint) => appoint.appPayload.appType == 1
                            )
                            .map((appoint) => (
                              <Tr>
                                <Td isNumeric>
                                  {Number(appoint.appPayload.appId)}
                                </Td>
                                <Td>{appoint.patPayload.userName}</Td>
                                <Td>
                                  {Number(appoint.patPayload.userAge)} years
                                </Td>
                                <Td>
                                  <Textarea
                                    width="300px"
                                    rows={3} // Set the number of rows (height)
                                    // Set the number of columns (width)
                                    resize="none" // Prevent resizing
                                    value={appoint.appPayload[4]}
                                  />
                                </Td>
                                <Td>{appoint.appPayload.appDate}</Td>
                                <Td>
                                  {appoint.appPayload.startTime} -{" "}
                                  {appoint.appPayload.endTime}
                                </Td>
                                {appoint.appPayload.isApproved ? (
                                  <Td>Approved</Td>
                                ) : (
                                  <Td>
                                    <Button
                                      onClick={() => {
                                        approveAppointment(
                                          appoint.appPayload.appId
                                        );
                                      }}
                                    >
                                      Approve
                                    </Button>
                                  </Td>
                                )}
                                <Td>
                                  <Button
                                    onClick={() => {
                                      setModalPatientName(
                                        appoint.patPayload.userName
                                      );
                                      setModalAppointmentDateTime(
                                        `${appoint.appPayload.appDate} (${appoint.appPayload.startTime} - ${appoint.appPayload.endTime})`
                                      );
                                      setModalPatientWallet(
                                        appoint.patPayload.userWalletAddress
                                      );
                                      onOpen();
                                    }}
                                  >
                                    Upload Prescription
                                  </Button>
                                </Td>
                                <Td>
                                  <Button
                                    onClick={() => {
                                      getLink(appoint.patPayload[5]);
                                    }}
                                  >
                                    Generate Link
                                  </Button>
                                </Td>
                              </Tr>
                            ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            ) : (
              <Button
                onClick={() => {
                  loadAppointmentData();
                }}
              >
                Load Appointment Data
              </Button>
            )}
          </GridItem>
        </Grid>
      </Box>
    </div>
  );
};

export default index;
