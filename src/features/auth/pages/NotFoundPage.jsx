// NotFoundPage.jsx
// Shown when a user navigates to a route that does not exist
import { Link } from "react-router-dom";
import notFoundIllustration from "../../../assets/404.svg";

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl rounded-2xl shadow-lg bg-[color:var(--color-surface)]/60 backdrop-blur p-6 md:p-10 border border-[color:var(--color-muted)]/40">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="flex items-center justify-center order-2 md:order-1">
            <img
              src={notFoundIllustration}
              alt="Page not found"
              className="w-72 md:w-96 h-auto drop-shadow"
              loading="lazy"
            />
          </div>
          <div className="order-1 md:order-2">
            <h1 className="text-3xl md:text-4xl font-semibold text-[color:var(--color-primary-text)] mb-3">
              Oops! We can't find that page
            </h1>
            <p className="text-[color:var(--color-secondary-text)] mb-6 leading-relaxed">
              The link may be broken, or the page may have been moved. Let’s get
              you back to something helpful.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[color:var(--color-primary)] text-white font-medium shadow-sm hover:opacity-95 active:opacity-90 transition"
              >
                Go to Home
              </Link>
              <Link
                to="/feed"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-[color:var(--color-muted)] text-[color:var(--color-primary-text)] bg-[color:var(--color-background)] font-medium hover:bg-[color:var(--color-surface)]/80 transition"
              >
                Explore Feed
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-[color:var(--color-muted)] text-[color:var(--color-primary-text)] bg-[color:var(--color-background)] font-medium hover:bg-[color:var(--color-surface)]/80 transition"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default NotFoundPage;
