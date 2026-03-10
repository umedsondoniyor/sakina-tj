import { RouterProvider } from 'react-router-dom';
import AppProviders from './AppProviders';
import { createAppRouter } from './router/createAppRouter';

const router = createAppRouter();

function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}

export default App;
