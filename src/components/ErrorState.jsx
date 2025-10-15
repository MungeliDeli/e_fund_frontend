// ErrorState.jsx
// Reusable full-screen error/empty-state component aligned with theme variables
import { Link } from "react-router-dom";
import serverErrorIllustration from "../assets/server-error.svg";

function ErrorState({
  title = "Something went wrong",
  description = "We couldn’t load this section right now. Please try again.",
  illustration = serverErrorIllustration,
  retryLabel = "Try again",
  onRetry,
  primaryAction,
  secondaryAction,
  className = "",
}) {
  return (
    <div
      className={`min-h-[60vh] md:min-h-[70vh] w-full flex items-center justify-center px-4 ${className}`}
    >
      <div className="w-full max-w-3xl rounded-2xl shadow-lg  backdrop-blur p-6 md:p-10 ">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-10 items-center">
          <div className="md:col-span-2 flex items-center justify-center">
            <img
              src={illustration}
              alt="Error illustration"
              className="w-56 md:w-64 lg:w-72 h-auto drop-shadow"
              loading="lazy"
            />
          </div>
          <div className="md:col-span-3">
            <h2 className="text-2xl md:text-3xl font-semibold text-[color:var(--color-primary-text)] mb-2">
              {title}
            </h2>
            <p className="text-[color:var(--color-secondary-text)] mb-6 leading-relaxed">
              {description}
            </p>

            <div className="flex flex-wrap gap-3">
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[color:var(--color-primary)] text-white font-medium shadow-sm hover:opacity-95 active:opacity-90 transition"
                >
                  {retryLabel}
                </button>
              )}

              {primaryAction?.to && (
                <Link
                  to={primaryAction.to}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[color:var(--color-primary)] text-white font-medium shadow-sm hover:opacity-95 active:opacity-90 transition"
                >
                  {primaryAction.label}
                </Link>
              )}

              {secondaryAction?.to && (
                <Link
                  to={secondaryAction.to}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-[color:var(--color-muted)] text-[color:var(--color-primary-text)] bg-[color:var(--color-background)] font-medium hover:bg-[color:var(--color-surface)]/80 transition"
                >
                  {secondaryAction.label}
                </Link>
              )}
            </div>

            {!onRetry && !primaryAction?.to && !secondaryAction?.to && (
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[color:var(--color-primary)] text-white font-medium shadow-sm hover:opacity-95 transition"
                >
                  Go to Home
                </Link>
                <Link
                  to="/feed"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-[color:var(--color-muted)] text-[color:var(--color-primary-text)] bg-[color:var(--color-background)] font-medium hover:bg-[color:var(--color-surface)]/80 transition"
                >
                  Open Feed
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ErrorState;
