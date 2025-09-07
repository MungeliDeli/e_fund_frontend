// AccessDeniedPage.jsx
// Shown when a user tries to access a page they are not authorized for
function AccessDeniedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[color:var(--color-background)] px-4 py-12">
      <div className="flex flex-col items-center w-full max-w-md bg-[color:var(--color-background)] rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-[color:var(--color-primary-text)]">Access Denied</h1>
        <p className="text-center text-[color:var(--color-secondary-text)] text-base mb-6">
          You do not have permission to view this page.<br />
          Please contact support if you believe this is an error.
        </p>
        <a href="/" className="px-6 py-2 rounded-lg bg-[color:var(--color-primary)] text-white font-semibold text-base transition text-center">Return to Home</a>
      </div>
    </div>
  );
}
export default AccessDeniedPage; 