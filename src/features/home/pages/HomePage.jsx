// HomePage.jsx
// This file defines the HomePage component, which serves as the landing page for the FundFlow app.
// It welcomes users and provides a brief introduction to the platform.

function HomePage() {
  return (
    <div className="w-full flex flex-col items-center justify-center py-8 ">
      <h2 className="text-2xl font-bold text-[color:var(--color-primary)] mb-2">Welcome to FundFlow</h2>
      <p className="text-base text-[color:var(--color-text)] text-center max-w-md">
        This is the home page. Here you will see the latest campaigns, events, and updates from the FundFlow community.
      </p>
    </div>
  );
}

export default HomePage; 