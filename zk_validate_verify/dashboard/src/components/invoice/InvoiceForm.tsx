import { useState }                               from "react";
import { useInvoiceSubmit, InvoiceFormData }       from "../../hooks/useInvoiceSubmit";
import { PipelineProgress }                        from "./PipelineProgress";

const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", fontSize: 14,
    border: "0.5px solid #d0cfca", borderRadius: 8,
    background: "#fff", outline: "none", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
    fontSize: 12, color: "#73726c", display: "block", marginBottom: 4,
};

export function InvoiceForm() {
    const { submit, step, result, error, reset } = useInvoiceSubmit();

    const [form, setForm] = useState<InvoiceFormData>({
        patientId:          "PAT-987654321",
        amountCents:        250000,
        cptCode:            99213,
        providerId:         "1234567890",
        coverageLimitCents: 500000,
    });

    const [serviceDate, setServiceDate] = useState("05/10/2025");

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value, type } = e.target;
        setForm(f => ({ ...f, [name]: type === "number" ? Number(value) : value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        await submit(form);
    }

    if (step !== "idle" && step !== "error") {
        return (
            <div style={{ padding: "8px 0" }}>
                <PipelineProgress currentStep={step} result={result} />
                {result && (
                    <button
                        onClick={reset}
                        style={{
                            marginTop: 16, width: "100%", padding: "10px",
                            border: "0.5px solid #d0cfca", borderRadius: 8,
                            background: "#fff", cursor: "pointer", fontSize: 13,
                        }}
                    >
                        Submit another invoice
                    </button>
                )}
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                    <label style={labelStyle}>Patient ID</label>
                    <input style={inputStyle} name="patientId" value={form.patientId}
                        onChange={handleChange} required placeholder="PAT-987654321" />
                </div>
                <div>
                    <label style={labelStyle}>Provider NPI</label>
                    <input style={inputStyle} name="providerId" value={form.providerId}
                        onChange={handleChange} required placeholder="1234567890" />
                </div>
                <div>
                    <label style={labelStyle}>CPT service code</label>
                    <input style={inputStyle} type="number" name="cptCode" value={form.cptCode}
                        onChange={handleChange} min={1000} max={9999} required />
                </div>
                <div>
                    <label style={labelStyle}>Billed amount (₹)</label>
                    <input style={inputStyle} type="number" name="amountCents" value={form.amountCents / 100}
                        onChange={e => setForm(f => ({ ...f, amountCents: Number(e.target.value) * 100 }))}
                        min={1} required placeholder="2500" />
                </div>
                <div>
                    <label style={labelStyle}>Coverage limit (₹)</label>
                    <input style={inputStyle} type="number" name="coverageLimitCents"
                        value={form.coverageLimitCents / 100}
                        onChange={e => setForm(f => ({ ...f, coverageLimitCents: Number(e.target.value) * 100 }))}
                        min={1} required placeholder="5000" />
                </div>
                <div>
                    <label style={labelStyle}>Service date</label>
                    <input style={inputStyle} type="date" value={serviceDate}
                        onChange={e => setServiceDate(e.target.value)} />
                </div>
            </div>

            {error && (
                <p style={{ color: "#c0392b", fontSize: 13, marginTop: 10 }}>{error}</p>
            )}

            <button
                type="submit"
                style={{
                    width: "100%", marginTop: 14, padding: "11px",
                    border: "0.5px solid #d0cfca", borderRadius: 8,
                    background: "#fff", cursor: "pointer", fontSize: 14,
                    fontWeight: 500,
                }}
            >
                Generate ZK proof and submit invoice
            </button>
        </form>
    );
}
