declare module "snarkjs" {
    export const groth16: {
        fullProve(
            input:   Record<string, unknown>,
            wasmPath: string,
            zkeyPath: string
        ): Promise<{ proof: unknown; publicSignals: string[] }>;
        verify(
            vkey:          unknown,
            publicSignals: string[],
            proof:         unknown
        ): Promise<boolean>;
        exportSolidityCallData(
            proof:         unknown,
            publicSignals: string[]
        ): Promise<string>;
    };
}
