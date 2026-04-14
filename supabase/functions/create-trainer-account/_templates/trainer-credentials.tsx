import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Hr,
} from 'https://esm.sh/@react-email/components@0.0.25';
import * as React from 'https://esm.sh/react@18.3.1';

interface TrainerCredentialsEmailProps {
  trainerName: string;
  email: string;
  temporaryPassword: string;
  loginUrl: string;
}

export const TrainerCredentialsEmail = ({
  trainerName,
  email,
  temporaryPassword,
  loginUrl,
}: TrainerCredentialsEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to SEMS Trainer Portal - Your Login Credentials</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to SEMS Trainer Portal!</Heading>
        
        <Text style={text}>
          Hello {trainerName},
        </Text>
        
        <Text style={text}>
          Your trainer account has been created. You can now access the SEMS Trainer Portal to view your assigned courses, manage attendance, and access trainee information.
        </Text>

        <Section style={credentialsBox}>
          <Text style={credentialsTitle}>Your Login Credentials</Text>
          <Text style={credentialItem}>
            <strong>Email:</strong> {email}
          </Text>
          <Text style={credentialItem}>
            <strong>Temporary Password:</strong> <code style={code}>{temporaryPassword}</code>
          </Text>
        </Section>

        <Text style={text}>
          <strong>⚠️ Important Security Notice:</strong>
        </Text>
        <Text style={warningText}>
          For security reasons, you will be required to change your password when you first log in. Please keep your new password secure and do not share it with anyone.
        </Text>

        <Link
          href={loginUrl}
          target="_blank"
          style={button}
        >
          Login to Trainer Portal
        </Link>

        <Hr style={hr} />

        <Section style={instructionsSection}>
          <Text style={instructionsTitle}>Getting Started</Text>
          <Text style={text}>
            Once you log in, you'll be able to:
          </Text>
          <ul style={list}>
            <li style={listItem}>View all courses assigned to you</li>
            <li style={listItem}>Check course schedules and locations</li>
            <li style={listItem}>Mark trainee attendance</li>
            <li style={listItem}>View trainee information and registration details</li>
          </ul>
        </Section>

        <Hr style={hr} />

        <Text style={footer}>
          If you have any questions or need assistance, please contact your administrator.
        </Text>
        
        <Text style={footer}>
          © {new Date().getFullYear()} SEMS Training. All rights reserved.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default TrainerCredentialsEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 20px',
};

const credentialsBox = {
  backgroundColor: '#f4f4f4',
  borderRadius: '8px',
  border: '1px solid #e0e0e0',
  padding: '24px',
  margin: '24px 20px',
};

const credentialsTitle = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
};

const credentialItem = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '12px 0',
};

const code = {
  display: 'inline-block',
  padding: '8px 12px',
  backgroundColor: '#ffffff',
  borderRadius: '4px',
  border: '1px solid #ddd',
  color: '#d63384',
  fontSize: '16px',
  fontFamily: 'monospace',
  fontWeight: 'bold',
};

const warningText = {
  color: '#856404',
  backgroundColor: '#fff3cd',
  border: '1px solid #ffeaa7',
  borderRadius: '4px',
  padding: '12px',
  margin: '16px 20px',
  fontSize: '14px',
  lineHeight: '20px',
};

const button = {
  backgroundColor: '#5469d4',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '14px 20px',
  margin: '24px 20px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const instructionsSection = {
  margin: '24px 20px',
};

const instructionsTitle = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const list = {
  margin: '8px 0',
  paddingLeft: '20px',
};

const listItem = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '4px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '16px 20px',
  textAlign: 'center' as const,
};
