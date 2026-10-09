import { ethers } from "ethers";
import path        from "path";
import fs          from "fs";

const ROOT         = path.join(__dirname, "../../..");
const deployments  = JSON.parse(fs.readFileSync(
    path.join(ROOT, "fvm-contracts/deployments/calibration.json"), "utf8"
));
const REGISTRY_ABI = JSON.parse(fs.readFileSync(
    path.join(ROOT, "fvm-contracts/artifacts/contracts/MedicalBillingRegistry.sol/MedicalBillingRegistry.json"), "utf8"
)).abi;

export class BillingService {
    private provider = new ethers.JsonRpcProvider(process.env.CALIBRATION_RPC);
    private registry = new ethers.Contract(deployments.registry, REGISTRY_ABI, this.provider);

    async getHistory(providerAddress: string, page: number, limit: number) {
        if (!providerAddress || !ethers.isAddress(providerAddress)) {
            return { invoices: [], count: 0, page, limit };
        }

        const allCommitments: string[] = await this.registry.getProviderInvoices(providerAddress);
        const total   = allCommitments.length;
        const start   = (page - 1) * limit;
        const paged   = allCommitments.slice(start, start + limit);

        const invoices = await Promise.all(
            paged.map(async (commitment) => {
                const record = await this.registry.invoices(commitment);
                return {
                    commitment,
                    ipfsCID:     record.ipfsCID,
                    submittedAt: new Date(Number(record.submittedAt) * 1000).toISOString(),
                    disputed:    record.disputed,
                };
            })
        );

        return { invoices, count: total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async getStats(providerAddress: string) {
        if (!providerAddress || !ethers.isAddress(providerAddress)) {
            return { totalInvoices: 0, disputed: 0 };
        }

        const commitments: string[] = await this.registry.getProviderInvoices(providerAddress);
        const records = await Promise.all(
            commitments.map(c => this.registry.invoices(c))
        );

        return {
            providerAddress,
            totalInvoices:  commitments.length,
            disputed:       records.filter((r: any) => r.disputed).length,
            verified:       records.filter((r: any) => !r.disputed && Number(r.submittedAt) > 0).length,
            oldestAt:       records.length > 0
                ? new Date(Math.min(...records.map((r: any) => Number(r.submittedAt))) * 1000).toISOString()
                : null,
        };
    }
}
