import { Layout } from './components/layout/Layout';
import { Login } from './components/views/Login';
import { DataProvider, useData } from './store/DataContext';
import { ToastProvider } from './components/ui/Toast';
import { ConfirmProvider } from './components/ui/ConfirmDialog';

const Root: React.FC = () => {
  const { currentUser } = useData();
  return currentUser ? <Layout /> : <Login />;
};

export default function App() {
  return (
    <DataProvider>
      <ToastProvider>
        <ConfirmProvider>
          <Root />
        </ConfirmProvider>
      </ToastProvider>
    </DataProvider>
  );
}
