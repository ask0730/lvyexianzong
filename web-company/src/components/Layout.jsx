const Layout = ({ children }) => {
  return (
    <div>
      <Navbar />
      <main style={{ marginTop: '64px' }}>
        {children}
      </main>
    </div>
  );
}

export default Layout; 