import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function ArrowLeftIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c.8-4 3.4-6 8-6s7.2 2 8 6" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

function PaletteIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3a9 9 0 1 0 0 18h1.2a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h2.5a6.5 6.5 0 0 0 0-13H12Z" />
      <circle cx="7.5" cy="10" r=".8" fill="currentColor" />
      <circle cx="9" cy="6.5" r=".8" fill="currentColor" />
      <circle cx="14" cy="6" r=".8" fill="currentColor" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3 20 6v6c0 5-3.2 8-8 9-4.8-1-8-4-8-9V6l8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z" />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

const themeOptions = [
  {
    id: "light",
    label: "Light",
    description: "Always use light mode",
    icon: <SunIcon />,
  },
  {
    id: "dark",
    label: "Dark",
    description: "Always use dark mode",
    icon: <MoonIcon />,
  },
  {
    id: "system",
    label: "System",
    description: "Follow your device",
    icon: <SystemIcon />,
  },
];

const accentOptions = [
  {
    id: "purple",
    label: "Purple",
    color: "#6947ff",
  },
  {
    id: "blue",
    label: "Blue",
    color: "#3977ff",
  },
  {
    id: "green",
    label: "Green",
    color: "#23a567",
  },
  {
    id: "orange",
    label: "Orange",
    color: "#ef7b2d",
  },
  {
    id: "pink",
    label: "Pink",
    color: "#e45191",
  },
];

function getStoredTheme() {
  if (typeof window === "undefined") {
    return "system";
  }

  return localStorage.getItem("huddle-theme") || "system";
}

function getStoredAccent() {
  if (typeof window === "undefined") {
    return "purple";
  }

  return localStorage.getItem("huddle-accent") || "purple";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-huddle-theme", theme);
  localStorage.setItem("huddle-theme", theme);
}

function applyAccent(accent) {
  document.documentElement.setAttribute("data-huddle-accent", accent);
  localStorage.setItem("huddle-accent", accent);
}

function SettingsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [theme, setTheme] = useState(getStoredTheme);
  const [accent, setAccent] = useState(getStoredAccent);

  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    applyAccent(accent);
  }, [accent]);

  useEffect(() => {
    document.title = "Settings · Huddle";

    return () => {
      document.title = "Huddle";
    };
  }, []);

  function handleThemeChange(nextTheme) {
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }

  function handleAccentChange(nextAccent) {
    setAccent(nextAccent);
    applyAccent(nextAccent);
  }

  function handleProfileClick() {
    navigate("/profile");
  }

  function handleEmailClick() {
    navigate("/profile?edit=email");
  }

  function handleSignOut() {
    logout();
    navigate("/login");
  }

  return (
    <div className="utility-page settings-page-scroll">
      <header className="utility-header">
        <button
          type="button"
          className="utility-back-button"
          aria-label="Go back"
          onClick={() => navigate(-1)}
        >
          <ArrowLeftIcon />
        </button>

        <div>
          <h1>Settings</h1>
          <p>Manage your Huddle preferences</p>
        </div>
      </header>

      <main className="utility-content">
        {/* ACCOUNT */}
        <section className="settings-section">
          <h2>Account</h2>

          <div className="settings-card">
            <button
              type="button"
              className="settings-row"
              onClick={handleProfileClick}
            >
              <span className="settings-row-icon">
                <UserIcon />
              </span>

              <span className="settings-row-content">
                <strong>Profile</strong>
                <span>Update your name and profile information</span>
              </span>

              <ChevronRightIcon />
            </button>

            <button
              type="button"
              className="settings-row"
              onClick={handleEmailClick}
            >
              <span className="settings-row-icon">
                <MailIcon />
              </span>

              <span className="settings-row-content">
                <strong>Email</strong>
                <span>Manage your email address</span>
              </span>

              <ChevronRightIcon />
            </button>
          </div>
        </section>

        {/* PREFERENCES */}
        <section className="settings-section">
          <h2>Preferences</h2>

          <div className="settings-card">
            <div className="settings-row settings-row-open">
              <span className="settings-row-icon">
                <PaletteIcon />
              </span>

              <span className="settings-row-content">
                <strong>Appearance</strong>
                <span>Theme and display preferences</span>
              </span>

              <ChevronRightIcon />
            </div>

            <div className="settings-expanded-panel">
              <div className="appearance-panel">
                <div className="appearance-group">
                  <div className="appearance-label">
                    <strong>Theme</strong>
                    <span>Choose how Huddle looks</span>
                  </div>

                  <div className="theme-options">
                    {themeOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className={`theme-option ${
                          theme === option.id ? "selected" : ""
                        }`}
                        onClick={() => handleThemeChange(option.id)}
                        aria-pressed={theme === option.id}
                      >
                        <span className="theme-option-icon">
                          {option.icon}
                        </span>

                        <span>{option.label}</span>

                        {theme === option.id && (
                          <span className="theme-check">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="appearance-group">
                  <div className="appearance-label">
                    <strong>Theme colour</strong>
                    <span>Choose your Huddle accent colour</span>
                  </div>

                  <div className="accent-options">
                    {accentOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className={`accent-option ${
                          accent === option.id ? "selected" : ""
                        }`}
                        style={{ background: option.color }}
                        onClick={() => handleAccentChange(option.id)}
                        aria-label={`Use ${option.label} theme colour`}
                        title={option.label}
                        aria-pressed={accent === option.id}
                      >
                        {accent === option.id ? "✓" : ""}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="settings-toggle-row">
              <div>
                <strong>Notifications</strong>
                <span>Receive Huddle notifications</span>
              </div>

              <input
                className="huddle-toggle"
                type="checkbox"
                checked={notifications}
                onChange={(event) =>
                  setNotifications(event.target.checked)
                }
                aria-label="Toggle notifications"
              />
            </div>

            <div className="settings-toggle-row">
              <div>
                <strong>Message sounds</strong>
                <span>Play a sound when new messages arrive</span>
              </div>

              <input
                className="huddle-toggle"
                type="checkbox"
                checked={sound}
                onChange={(event) => setSound(event.target.checked)}
                aria-label="Toggle message sounds"
              />
            </div>
          </div>
        </section>

        {/* SECURITY */}
        <section className="settings-section">
          <h2>Security</h2>

          <div className="settings-card">
            <button
              type="button"
              className="settings-row"
              onClick={() =>
                console.log("Password settings — backend ready.")
              }
            >
              <span className="settings-row-icon">
                <LockIcon />
              </span>

              <span className="settings-row-content">
                <strong>Password</strong>
                <span>Change your Huddle password</span>
              </span>

              <ChevronRightIcon />
            </button>

            <button
              type="button"
              className="settings-row"
              onClick={() =>
                console.log("Security settings — backend ready.")
              }
            >
              <span className="settings-row-icon">
                <ShieldIcon />
              </span>

              <span className="settings-row-content">
                <strong>Security</strong>
                <span>Manage account security options</span>
              </span>

              <ChevronRightIcon />
            </button>

            <button
              type="button"
              className="settings-row"
              onClick={() =>
                console.log("Notification settings — backend ready.")
              }
            >
              <span className="settings-row-icon">
                <BellIcon />
              </span>

              <span className="settings-row-content">
                <strong>Notification settings</strong>
                <span>Control how Huddle notifies you</span>
              </span>

              <ChevronRightIcon />
            </button>
          </div>
        </section>

        {/* SIGN OUT */}
        <section className="settings-danger-section">
          <button
            type="button"
            className="settings-signout-button"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </section>
      </main>
    </div>
  );
}

export default SettingsPage;