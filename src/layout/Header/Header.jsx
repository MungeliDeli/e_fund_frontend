import { FiMenu } from "react-icons/fi";
import { FaRegSun, FaRegMoon } from "react-icons/fa";
import SearchBar from "../../components/SearchBar/SearchBar";
import { useTheme } from "../../contexts/ThemeContext";
import { useNavigate, useLocation } from "react-router-dom";
import FundraiseLogo from "../../assets/Fundraise logo.svg";
// import GoogleIcon from "../../assets/devicon_google.svg"; // For later use

function Logo() {
  return (
    <span className="flex items-center">
      <img src={FundraiseLogo} alt="FundFlow Logo" className="w-7 h-7" />
      <span className="ml-2 font-bold text-xl text-[color:var(--color-primary)] hidden sm:inline">FundFlow</span>
    </span>
  );
}

function Header({ onMenuClick, className = "" }) {
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isSignUp = location.pathname === "/signup";
  const isLogin = location.pathname === "/login";

  return (
    <header className={`w-full flex items-center gap-2 justify-between py-2 bg-[color:var(--color-background)] border-b border-[color:var(--color-muted)] overflow-x-auto ${className}`}>
     
      <button
        className="lg:hidden p-2 rounded hover:bg-[color:var(--color-muted)] focus:outline-none shrink-0"
        onClick={onMenuClick}
        aria-label="Open sidebar"
      >
        <FiMenu className="text-2xl text-[color:var(--color-primary-text)]" />
      </button>

      
      <div className="flex items-center mr-1 shrink-0">
        <Logo />
      </div>

      <div className="flex-1 flex justify-center min-w-0 mx-1">
        <SearchBar className="w-full max-w-lg" />
      </div>

      
      <div className="flex items-center gap-1 shrink-0">
        <button
          className="p-2 rounded hover:bg-[color:var(--color-muted)] focus:outline-none"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {dark ? (
            <FaRegSun className="text-xl text-[color:var(--color-primary)]" />
          ) : (
            <FaRegMoon className="text-xl text-[color:var(--color-primary)]" />
          )}
        </button>
        {!isLogin && (
          <button
            className="px-2 py-1 rounded border border-[color:var(--color-primary)] text-[color:var(--color-primary)] font-medium text-xs sm:text-sm hover:bg-[color:var(--color-muted)] transition-colors"
            onClick={() => navigate('/login')}
          >
            Log In
          </button>
        )}
        {!isSignUp && (
          <button
            className="px-2 py-1 rounded bg-[color:var(--color-primary)] text-white font-medium text-xs sm:text-sm hover:bg-[color:var(--color-accent)] transition-colors"
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </button>
        )}
      </div>
    </header>
  );
}

export default Header; 