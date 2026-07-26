import {
    Html,
    Head,
    Body,
    Container,
    Heading,
    Text,
    Section,
} from "@react-email/components";

interface VerificationEmailProps {
    name: string;
    verifyCode: string;
}

export default function VerificationEmail({
    name,
    verifyCode,
}: VerificationEmailProps) {
    return (
        <Html>
            <Head />
            <Body
                style={{
                    backgroundColor: "#f4f4f4",
                    fontFamily: "Arial, sans-serif",
                }
                }
            >
                <Container
                    style={
                        {
                            backgroundColor: "#ffffff",
                            padding: "30px",
                            borderRadius: "8px",
                            maxWidth: "500px",
                            margin: "40px auto",
                        }
                    }
                >
                    <Heading>Verify your Email </Heading>

                    <Text> Hi {name}, </Text>

                    <Text>
                        Thank you for signing up.
                    </Text>

                    <Text>
                        Your verification code is:
                    </Text>

                    <Section
                        style={{
                            textAlign: "center",
                            margin: "30px 0",
                        }}
                    >
                        <Heading
                            style={
                                {
                                    letterSpacing: "8px",
                                }
                            }
                        >
                            {verifyCode}
                        </Heading>
                    </Section>

                    <Text>
                        This code will expire in 10 minutes.
                    </Text>

                    <Text>
                        If you didn't create this account,
                        you can safely ignore this email.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
}