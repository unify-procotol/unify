import { Layout, StudioHome } from "./components";


function App() {
  return (
    <Layout>
      {({ isConnected, baseUrl }) => (
        <StudioHome isConnected={isConnected} baseUrl={baseUrl} />
      )}
    </Layout>
  );
}

export default App; 