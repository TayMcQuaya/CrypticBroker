import RegisterForm from '../../components/auth/RegisterForm';
import Layout from '../../components/layout/Layout';

export default function RegisterPage() {
  return (
    <Layout title="Register - CrypticBroker" description="Create a new CrypticBroker account">
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <RegisterForm />
      </div>
    </Layout>
  );
} 