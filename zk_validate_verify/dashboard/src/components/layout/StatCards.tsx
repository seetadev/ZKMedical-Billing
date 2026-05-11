interface StatCard {
    label:   string;
    value:   string | number;
    sub?:    string;
    accent?: boolean;
}

interface Props {
    cards: StatCard[];
}

export function StatCards({ cards }: Props) {
    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 1,
            background: "var(--color-border-secondary, #e5e5e4)",
            border: "0.5px solid var(--color-border-secondary, #e5e5e4)",
            borderRadius: 10,
            overflow: "hidden",
            marginBottom: 20,
        }}>
            {cards.map((card, i) => (
                <div key={i} style={{
                    background: "var(--color-background-primary, #fff)",
                    padding: "18px 20px",
                }}>
                    <p style={{ fontSize: 12, color: "var(--color-text-secondary, #73726c)", margin: 0, marginBottom: 6 }}>
                        {card.label}
                    </p>
                    <p style={{
                        fontSize: 28, fontWeight: 600,
                        color: card.accent ? "#0F6E56" : "var(--color-text-primary, #1a1a1a)",
                        margin: 0, lineHeight: 1.1,
                    }}>
                        {card.value}
                    </p>
                    {card.sub && (
                        <p style={{ fontSize: 12, color: "var(--color-text-tertiary, #999)", margin: 0, marginTop: 4 }}>
                            {card.sub}
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
}
