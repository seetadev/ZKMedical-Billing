import Head from "next/head";
import { useState } from "react";
import {
    Stack,
    Text,
    Title,
    Grid,
    NumberInput,
    Button,
    Group,
    Space,
    TextInput,
    Divider,
    Badge,
    Alert,
} from "@mantine/core";
import axios, { AxiosRequestConfig } from "axios";
import { useAccount } from "wagmi";
import { notifications } from "@mantine/notifications";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { executeTransaction } from "@/lib/executeTransaction";
import { IconInfoCircle } from "@tabler/icons-react";

const NUM_ITEMS = 5;

const defaultItems = Array(NUM_ITEMS).fill(0);

export default function Home() {
    const [itemCosts, setItemCosts] = useState<number[]>(defaultItems);
    const [insuranceCoverage, setInsuranceCoverage] = useState<number>(0);
    const [patientContribution, setPatientContribution] = useState<number>(0);
    const { isConnected } = useAccount();

    const treatmentTotal = itemCosts.reduce((a, b) => a + b, 0);
    const coverageSum = insuranceCoverage + patientContribution;
    const isBalanced = coverageSum === treatmentTotal;
    const hasItems = treatmentTotal > 0;

    const updateItem = (index: number, value: number) => {
        setItemCosts((prev) => prev.map((v, i) => (i === index ? value : v)));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isBalanced) {
            notifications.show({
                message: `Insurance + Patient (${coverageSum}) must equal Treatment Total (${treatmentTotal})`,
                color: "red",
            });
            return;
        }

        const data = { itemCosts, treatmentTotal, insuranceCoverage, patientContribution };
        const config: AxiosRequestConfig = { headers: { "Content-Type": "application/json" } };

        try {
            const res = await axios.post("/api/generate_proof", data, config);
            notifications.show({
                message: "Proof generated successfully! Submitting transaction…",
                color: "green",
            });

            const { proof, publicSignals } = res.data;
            const txResult = await executeTransaction(proof, publicSignals);

            notifications.show({
                message: `Transaction succeeded! Tx Hash: ${txResult.transactionHash}`,
                color: "green",
                autoClose: false,
            });
        } catch (err: any) {
            notifications.show({
                message: `Error ${err?.response?.status}: ${err?.response?.data?.error}`,
                color: "red",
            });
        }
    };

    return (
        <>
            <Head>
                <title>ZK Medical Invoice Verifier</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Stack justify="center" align="center" w="100vw" mih="100vh" spacing={0} p="md">
                <Group w="96vw" h="10vh" position="apart" align="center">
                    <Title order={3}>ZK Medical Invoice Verifier</Title>
                    <ConnectWalletButton />
                </Group>

                <Grid w="96vw" justify="center">
                    <Grid.Col sm={10} md={8} lg={6}>
                        <Alert icon={<IconInfoCircle />} color="blue" mb="md">
                            Enter line-item costs and the insurance/patient split. A zero-knowledge
                            proof is generated locally — only the total claim amount is revealed
                            on-chain. Individual costs and the coverage split remain private.
                        </Alert>

                        <form onSubmit={handleSubmit}>
                            <Stack spacing="sm">
                                {/* Line items */}
                                <Text weight={600}>Line Items (in cents)</Text>
                                {itemCosts.map((val, i) => (
                                    <NumberInput
                                        key={i}
                                        label={`Item ${i + 1}`}
                                        placeholder="0"
                                        min={0}
                                        value={val}
                                        onChange={(v) => updateItem(i, v ?? 0)}
                                    />
                                ))}

                                <Divider my="xs" />

                                {/* Totals */}
                                <Group position="apart">
                                    <Text size="sm" color="dimmed">
                                        Treatment Total
                                    </Text>
                                    <Badge size="lg" variant="filled" color="blue">
                                        {treatmentTotal} cents
                                    </Badge>
                                </Group>

                                <Divider my="xs" />

                                {/* Coverage split */}
                                <Text weight={600}>Coverage Split (must sum to Treatment Total)</Text>
                                <NumberInput
                                    label="Insurance Coverage (cents)"
                                    placeholder="0"
                                    min={0}
                                    value={insuranceCoverage}
                                    onChange={(v) => setInsuranceCoverage(v ?? 0)}
                                />
                                <NumberInput
                                    label="Patient Contribution (cents)"
                                    placeholder="0"
                                    min={0}
                                    value={patientContribution}
                                    onChange={(v) => setPatientContribution(v ?? 0)}
                                />

                                <Group position="apart">
                                    <Text size="sm" color="dimmed">
                                        Coverage Sum
                                    </Text>
                                    <Badge
                                        size="lg"
                                        variant="filled"
                                        color={isBalanced && hasItems ? "green" : "red"}
                                    >
                                        {coverageSum} / {treatmentTotal} cents
                                    </Badge>
                                </Group>

                                <Space h={10} />

                                {!isConnected ? (
                                    <ConnectWalletButton />
                                ) : (
                                    <Button
                                        type="submit"
                                        disabled={!isBalanced || !hasItems}
                                        fullWidth
                                    >
                                        Generate ZK Proof &amp; Submit On-Chain
                                    </Button>
                                )}
                            </Stack>
                        </form>
                    </Grid.Col>
                </Grid>
            </Stack>
        </>
    );
}
