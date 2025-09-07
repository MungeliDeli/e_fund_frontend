// NotFoundPage.jsx
// Shown when a user navigates to a route that does not exist
function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[color:var(--color-background)] px-4 py-12">
      <div className="flex flex-col items-center w-full max-w-md bg-[color:var(--color-background)] rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-[color:var(--color-primary-text)]">404 - Page Not Found</h1>
        <p className="text-center text-[color:var(--color-secondary-text)] text-base mb-6">
          Sorry, the page you are looking for does not exist.<br />
          Please check the URL or return to the home page.
        </p>
        <a href="/" className="px-6 py-2 rounded-lg bg-[color:var(--color-primary)] text-white font-semibold text-base transition text-center">Return to Home</a>
      </div>
    </div>
  );
}
export default NotFoundPage; 