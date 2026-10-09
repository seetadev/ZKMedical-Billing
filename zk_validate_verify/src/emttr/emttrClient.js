import axios from "axios";

export class EMTTRClient {
    constructor() {
        this.http = axios.create({
            baseURL: process.env.EMTTR_API_URL,
            headers: {
                "Authorization": `Bearer ${process.env.EMTTR_API_KEY}`,
                "Content-Type":  "application/json",
            },
            timeout: 15000,
        });
    }

    async getPendingBillingRecords(limit = 50) {
        const { data } = await this.http.get("/trial-records", {
            params: {
                billing_status: "pending",
                limit,
                sort: "created_at:asc",
            },
        });
        return data.records;
    }

    async getRecord(recordId) {
        const { data } = await this.http.get(`/trial-records/${recordId}`);
        return data.record;
    }

    async getTestResults(trialId) {
        const { data } = await this.http.get(`/trials/${trialId}/test-results`);
        return data.results;
    }

    async getCoveragePolicy(patientId) {
        const { data } = await this.http.get(`/patients/${patientId}/coverage`);
        return data.policy;
    }

    async updateBillingStatus(recordId, billingResult) {
        const { data } = await this.http.patch(
            `/trial-records/${recordId}/billing`,
            {
                billing_status: "billed",
                zk_commitment:  billingResult.commitment,
                ipfs_cid:       billingResult.ipfsCID,
                fvm_tx_hash:    billingResult.txHash,
                billed_at:      new Date().toISOString(),
            }
        );
        return data;
    }

    async markBillingFailed(recordId, reason) {
        await this.http.patch(`/trial-records/${recordId}/billing`, {
            billing_status: "failed",
            failure_reason: reason,
            failed_at:      new Date().toISOString(),
        });
    }
}
