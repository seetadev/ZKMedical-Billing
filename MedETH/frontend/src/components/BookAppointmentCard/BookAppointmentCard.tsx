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
  FormControl,
  FormLabel,
  Icon,
  Input,
  VisuallyHidden,
  chakra,
  Grid,
  GridItem,
  Tooltip,
  VStack,
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
import doctorsideabi from "../../utils/abis/doctorsideabi.json";
import BookAppointment from "../../pages/book";
import { color } from "framer-motion";
import { useRouter } from "next/navigation";

const BookAppointmentCard = ({ sysUser, signal }) => {
  const age = sysUser.userAge.toNumber();
  const role = sysUser.userRole.toNumber();
  const userId = sysUser.userId.toNumber();
  console.log(userId);
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [size, setSize] = useState("md");
  const [adharsize, setAdharSize] = useState("md");
  const [doctorInfo, setDoctorInfo] = useState({});
  const [userWalletAddress, setUserWalletAddress] = useState("");
  const [date, setDate] = useState("choosen date");
  const [timeSlots, setTimeSlots] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedSlotID, setSelectedSlotID] = useState();
  const [colorUpdate, setColorUpdate] = useState(false);
  const [slotButton, SetSlotButton] = useState(false);
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedSlots, setSelectedSlots] = useState({});
  const [numOfTokens, setNumOfTokens] = useState(0);

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

  const toast = useToast();

  const approveUser = async () => {
    try {
      if (window.ethereum._state.accounts?.length !== 0) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_DOCTORSIDE_ADDRESS,
          doctorsideabi,
          signer
        );

        const tx = await contract.approveUser(userId);
        const data = { email: email };

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
    } catch (e) {
      console.log(e);
      toast({
        title: "Registration approval failed",
        description: "Please try again",
        status: "error",
        duration: 1000,
        isClosable: true,
        position: "top-right",
      });
    }
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
  const loadTimeSlots = async (givenDate, doctorWalletAddress) => {
    console.log(givenDate);
    console.log("loadTimeSlots called");
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
      const userId = await contract.userWalletAddresstoUserId(
        doctorWalletAddress
      );

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
      const userTokens = await contract.getUserTokens();
      setNumOfTokens(userTokens / 10 ** 18);
      console.log("User tokens: ", numOfTokens);
    }
  };

  const selectTimeSlot = (slotId: number) => {
    console.log(slotId);

    const updatedSelectedSlots: { [key: number]: boolean } = {
      ...selectedSlots,
    };

    // Toggle the selected state of the slot
    updatedSelectedSlots[slotId] = !updatedSelectedSlots[slotId];

    // Set the updated selected slots
    setSelectedSlots(updatedSelectedSlots);
  };
  const handleSizeClick = (newSize: string) => {
    setSize(newSize);

    onOpen();
  };

  const BookEmergencyAppointment = async () => {
    if (window.ethereum._state.accounts?.length !== 0) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_DOCTORSIDE_ADDRESS,
          doctorsideabi,
          signer
        );
        console.log(contract);
        const accounts = await provider.listAccounts();
        setUserWalletAddress(accounts[0]);
        const balance = await provider.getBalance(accounts[0]);
        console.log("balance is: " + balance);
        if (balance > 1 * 10 ** 14) {
          console.log("f this");
          const userId = await contract.userWalletAddresstoUserId(accounts[0]);
          const userInfo = await contract.userIdtoUser(userId);
          setDoctorInfo(userInfo);

          const tx = await contract.bookAppointmentEmergency(
            date,
            startTime,
            endTime,
            subject,
            "",
            sysUser[10],
            selectedSlotID,
            { value: ethers.utils.parseEther("0.0005") }
          );
          toast({
            title: "Appoinment Request Sent!",
            description: "Please wait for the transaction to complete.",
            status: "success",
            duration: 9000,
            isClosable: true,
          });
          await tx.wait();
          router.refresh();
        }
      } catch (e) {
        toast({
          title: "10 MediTokens required",
          description:
            "Atleast 10 MediToken are required to book an emergency appointment",
          status: "error",
          duration: 1000,
          isClosable: true,
          position: "top-right",
        });
      }
    }
  };

  const BookAppointment = async () => {
    if (window.ethereum._state.accounts?.length !== 0) {
      try {
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

        const tx = await contract.bookAppointment(
          date,
          startTime,
          endTime,
          subject,
          "",
          sysUser[10],
          selectedSlotID
        );
        toast({
          title: "Appoinment Request Sent!",
          description: "Please wait for the transaction to complete.",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
        await tx.wait();
        router.refresh();
      } catch (e) {
        console.log(e);
        toast({
          title: "5 MediTokens required",
          description:
            "Atleast 5 MediToken are required to book an appointment",
          status: "error",
          duration: 1000,
          isClosable: true,
          position: "top-right",
        });
      }
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
              Book Appointment
            </Button>

            <Modal isOpen={isOpen} onClose={onClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Book Appointment</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <FormControl mr="5%">
                    <FormLabel htmlFor="subject" fontWeight={"normal"}>
                      Appointment Subject
                    </FormLabel>
                    <Input
                      id="subject"
                      placeholder="subject"
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </FormControl>
                  <FormControl mr="5%" mt="2%">
                    <FormLabel htmlFor="date" fontWeight={"normal"}>
                      Choose Date
                    </FormLabel>
                    <Input
                      placeholder="Select Date"
                      size="md"
                      type="date"
                      variant={"outline"}
                      onChange={(e) => {
                        setDate(e.target.value);
                        loadTimeSlots(e.target.value, sysUser[10]);
                      }}
                    />
                  </FormControl>

                  {date != "choosen date" && (
                    <FormControl mt="2%">
                      <FormLabel htmlFor="date" fontWeight={"normal"}>
                        Select Time Slot
                      </FormLabel>
                      <Grid
                        templateColumns={{
                          base: "repeat(1, 1fr)",
                          sm: "repeat(2, 1fr)",
                          md: "repeat(3, 1fr)",
                        }}
                        gap={{ base: "4", sm: "12", md: "4" }}
                      >
                        {timeSlots &&
                          timeSlots.map((ts) => (
                            <GridItem key={ts.slotId}>
                              {ts.isBooked ? (
                                <Button isDisabled variant="solid">
                                  {ts.startTime} - {ts.endTime}
                                </Button>
                              ) : (
                                <Tooltip hasArrow label="Select" bg="blue.600">
                                  <Button
                                    colorScheme={
                                      selectedSlots[ts.slotId] ? "blue" : "teal"
                                    }
                                    style={{
                                      transform: selectedSlots[ts.slotId]
                                        ? "scale(1.1)"
                                        : "scale(1)",
                                    }}
                                    variant="solid"
                                    onClick={() => {
                                      setStartTime(ts.startTime);
                                      setEndTime(ts.endTime);
                                      setSelectedSlotID(ts.slotId);
                                      //  setColorUpdate(!colorUpdate);
                                      selectTimeSlot(ts.slotId);

                                      // console.log(selectedSlotID.toNumber());
                                    }}
                                    // onSelect={() =>
                                    //   setColorUpdate(!colorUpdate)
                                    // }
                                  >
                                    {ts.startTime} - {ts.endTime}
                                  </Button>
                                </Tooltip>
                              )}
                            </GridItem>
                          ))}
                      </Grid>
                    </FormControl>
                  )}
                </ModalBody>

                <ModalFooter>
                  <VStack>
                    <Tooltip
                      isDisabled={numOfTokens >= 5 ? true : false}
                      hasArrow
                      label="Atleast 5 MediTokens required"
                      bg="blue.600"
                    >
                      <Button
                        onClick={BookAppointment}
                        _hover={{
                          transform: "translateY(-2px)",
                          boxShadow: "lg",
                        }}
                        isDisabled={numOfTokens < 5 ? true : false}
                        style={{
                          // align item to the right
                          marginLeft: "auto",
                        }}
                      >
                        Book Appointment
                      </Button>
                    </Tooltip>
                    <Tooltip
                      isDisabled={numOfTokens >= 10 ? true : false}
                      hasArrow
                      label="Atleast 10 MediTokens required"
                      bg="blue.600"
                    >
                      <Button
                        onClick={BookEmergencyAppointment}
                        _hover={{
                          transform: "translateY(-2px)",
                          boxShadow: "lg",
                        }}
                        isDisabled={numOfTokens < 10 ? true : false}
                        style={{
                          // align item to the right
                          marginLeft: "auto",
                        }}
                        mt={2}
                      >
                        Book Emergency Appointment
                      </Button>
                    </Tooltip>
                  </VStack>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </Box>
        </Box>
      </Center>
    </div>
  );
};

export default BookAppointmentCard;
