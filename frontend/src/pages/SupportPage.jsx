import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ArrowLeftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function MessageCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.8 9.8 0 0 1-4-.8L3 21l1.8-4.3A8.4 8.4 0 0 1 3 11.5a8.4 8.4 0 0 1 9-8.5 8.4 8.4 0 0 1 9 8.5z" />
    </svg>
  );
}

function LifeBuoyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" />
      <path d="m5.6 5.6 4.3 4.3" />
      <path d="m14.1 14.1 4.3 4.3" />
      <path d="m18.4 5.6-4.3 4.3" />
      <path d="m9.9 14.1-4.3 4.3" />
    </svg>
  );
}

function SupportPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const articles = [
    {
      title: "Getting started",
      description: "Learn the basics of Huddle",
      icon: <BookIcon />,
    },
    {
      title: "Channels & messages",
      description: "Learn about channels and messaging",
      icon: <MessageCircleIcon />,
    },
    {
      title: "Account & workspace",
      description: "Manage your Huddle workspace",
      icon: <LifeBuoyIcon />,
    },
  ];

  const filteredArticles = articles.filter((article) =>
    `${article.title} ${article.description}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="utility-page">
      <header className="utility-header">
        <button
          type="button"
          className="utility-back-button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          title="Go back"
        >
          <ArrowLeftIcon />
        </button>

        <div>
          <h1>Support</h1>
          <p>Find answers and get help with Huddle</p>
        </div>
      </header>

      <main className="support-page-content support-page-scroll">
        <section className="support-hero">
          <div className="support-hero-icon">
            <LifeBuoyIcon />
          </div>

          <h2>How can we help?</h2>

          <p>
            Search our help resources or find answers to
            common Huddle questions.
          </p>

          <div className="support-search">
            <SearchIcon />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search help articles"
              aria-label="Search help articles"
            />
          </div>
        </section>

        <section className="support-section">
          <h2>Help &amp; Resources</h2>

          <div className="support-card">
            {filteredArticles.length > 0 ? (
              filteredArticles.map((article) => (
                <button
                  key={article.title}
                  type="button"
                  className="support-row"
                  onClick={() =>
                    console.log(
                      "Support article selected:",
                      article.title
                    )
                  }
                >
                  <span className="support-row-icon">
                    {article.icon}
                  </span>

                  <span className="support-row-content">
                    <strong>{article.title}</strong>
                    <span>{article.description}</span>
                  </span>

                  <ChevronIcon />
                </button>
              ))
            ) : (
              <div className="support-no-results">
                <strong>No articles found</strong>
                <span>
                  Try searching for something else.
                </span>
              </div>
            )}
          </div>
        </section>

        <section className="support-contact-card">
          <div className="support-contact-icon">
            <MessageCircleIcon />
          </div>

          <div className="support-contact-content">
            <h2>Still need help?</h2>
            <p>
              Contact the Huddle team and we'll help you
              out.
            </p>
          </div>

          <button
            type="button"
            className="support-contact-button"
            onClick={() =>
              console.log(
                "Contact support ready for backend"
              )
            }
          >
            Contact support
          </button>
        </section>

        <p className="support-version">
          Huddle · Support
        </p>
      </main>
    </div>
  );
}

export default SupportPage;