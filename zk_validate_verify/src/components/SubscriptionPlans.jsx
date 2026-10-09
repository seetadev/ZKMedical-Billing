import { useState } from "react";
import { Card, Text, Button, Group, Badge, Stack, Title, Alert } from "@mantine/core";
import { usePPT, useSubscribe } from "../hooks/usePPT";
import { PLANS, PLAN_NAMES } from "../ppt/pptService";

const PLAN_DETAILS = [
    {
        plan:        PLANS.BASIC,
        name:        "Basic",
        price:       "100 PPT/month",
        features:    ["Up to 50 invoice submissions/month", "Filecoin/IPFS storage", "ZK proof generation"],
    },
    {
        plan:        PLANS.PRO,
        name:        "Pro",
        price:       "500 PPT/month",
        features:    ["Unlimited invoice submissions", "Priority processing", "Insurer access grants", "Dispute resolution"],
    },
    {
        plan:        PLANS.ENTERPRISE,
        name:        "Enterprise",
        price:       "2000 PPT/month",
        features:    ["Everything in Pro", "Batch submissions", "API access", "Dedicated support"],
    },
];

function PlanCard({ planDetail, currentPlan, onSubscribe, loading }) {
    const isActive    = currentPlan === planDetail.plan;
    const isLoading   = loading && !isActive;

    return (
        <Card
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
            style={{
                border: isActive ? "2px solid #228be6" : undefined,
                flex:   1,
                minWidth: 220,
            }}
        >
            <Stack spacing="sm">
                <Group position="apart">
                    <Title order={4}>{planDetail.name}</Title>
                    {isActive && <Badge color="blue">Active</Badge>}
                </Group>

                <Text weight={700} size="xl" color="blue">
                    {planDetail.price}
                </Text>

                <Stack spacing={4}>
                    {planDetail.features.map((f) => (
                        <Text key={f} size="sm" color="dimmed">
                            ✓ {f}
                        </Text>
                    ))}
                </Stack>

                <Button
                    fullWidth
                    variant={isActive ? "light" : "filled"}
                    disabled={isActive}
                    loading={isLoading}
                    onClick={() => onSubscribe(planDetail.plan)}
                    mt="auto"
                >
                    {isActive ? "Current Plan" : "Subscribe"}
                </Button>
            </Stack>
        </Card>
    );
}

export function SubscriptionPlans() {
    const { balance, fee, hasAccess, preflight, loading: dataLoading, error: dataError, refresh } = usePPT();
    const { subscribe, loading: subLoading, error: subError, txHash } = useSubscribe();

    const [currentPlan, setCurrentPlan] = useState(PLANS.NONE);

    async function handleSubscribe(plan) {
        await subscribe(plan);
        setCurrentPlan(plan);
        refresh();
    }

    return (
        <Stack spacing="lg">
            <Title order={2}>PPT Subscription Plans</Title>

            {/* Wallet status */}
            <Card withBorder padding="md" radius="md">
                <Group position="apart">
                    <Stack spacing={2}>
                        <Text size="sm" color="dimmed">PPT Balance</Text>
                        <Text weight={700}>{balance ?? "—"} PPT</Text>
                    </Stack>
                    <Stack spacing={2}>
                        <Text size="sm" color="dimmed">Invoice Fee</Text>
                        <Text weight={700}>{fee ?? "—"} PPT</Text>
                    </Stack>
                    <Stack spacing={2}>
                        <Text size="sm" color="dimmed">Access Status</Text>
                        <Badge color={hasAccess ? "green" : "red"}>
                            {hasAccess ? "Active" : "No Access"}
                        </Badge>
                    </Stack>
                    {preflight && !preflight.canSubmit && (
                        <Stack spacing={2}>
                            <Text size="sm" color="dimmed">Action Needed</Text>
                            <Text size="sm" color="orange">
                                {!preflight.hasSufficientFunds
                                    ? "Insufficient PPT — use faucet"
                                    : !preflight.hasSufficientApproval
                                    ? "Approve PPT spend"
                                    : "Purchase a plan"}
                            </Text>
                        </Stack>
                    )}
                </Group>
            </Card>

            {/* Error/success alerts */}
            {(dataError || subError) && (
                <Alert color="red" title="Error">
                    {dataError || subError}
                </Alert>
            )}
            {txHash && (
                <Alert color="green" title="Subscription purchased!">
                    Transaction: {txHash.slice(0, 10)}...{txHash.slice(-8)}
                </Alert>
            )}

            {/* Plan cards */}
            <Group align="flex-start" grow>
                {PLAN_DETAILS.map((pd) => (
                    <PlanCard
                        key={pd.plan}
                        planDetail={pd}
                        currentPlan={currentPlan}
                        onSubscribe={handleSubscribe}
                        loading={subLoading}
                    />
                ))}
            </Group>
        </Stack>
    );
}
