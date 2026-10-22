import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import "katex/dist/katex.min.css";
import "./App.css";

const API_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://science-ai-backend-092b.onrender.com"
).replace(/\/+$/, "");

const AI_ENDPOINT = `${API_URL}/api/ai/ask/`;

const subjects = [
  { icon: "🧬", name: "Biology", description: "Life & organisms" },
  { icon: "🧪", name: "Chemistry", description: "Matter & reactions" },
  { icon: "⚛️", name: "Physics", description: "Energy & motion" },
];

const suggestions = [
  "Explain photosynthesis simply",
  "What is Newton's second law?",
  "How does DNA replication work?",
  "Explain the periodic table",
];

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeSubject, setActiveSubject] = useState("All Science");

  const askScienceAI = async (customQuestion = null) => {
    const currentQuestion = (customQuestion ?? question).trim();

    if (!currentQuestion || loading) return;

    setQuestion(currentQuestion);
    setLoading(true);
    setAnswer("");
    setError("");

    try {
      const response = await fetch(AI_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/plain, */*",
        },
        body: JSON.stringify({
          question: currentQuestion,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();

        let message = errorText || "Something went wrong.";

        try {
          const errorData = JSON.parse(errorText);
          message =
            errorData.error ||
            errorData.detail ||
            errorData.message ||
            message;
        } catch {
          // Non-JSON response.
        }

        throw new Error(
          typeof message === "string"
            ? message
            : "The AI request failed. Please try again."
        );
      }

      const contentType = response.headers.get("content-type") || "";

      if (
        contentType.includes("application/json") ||
        contentType.includes("+json")
      ) {
        const data = await response.json();

        const result =
          data.answer ??
          data.response ??
          data.result;

        if (typeof result !== "string") {
          throw new Error(
            "The server response did not contain an answer."
          );
        }

        setAnswer(result);
      } else {
        if (!response.body) {
          throw new Error(
            "Your browser could not read the AI response."
          );
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let fullAnswer = "";

        while (true) {
          const { value, done } = await reader.read();

          if (done) break;

          fullAnswer += decoder.decode(value, {
            stream: true,
          });

          setAnswer(fullAnswer);
        }

        fullAnswer += decoder.decode();

        if (fullAnswer) {
          setAnswer(fullAnswer);
        }

        if (!fullAnswer.trim()) {
          throw new Error(
            "The AI returned an empty answer. Please try again."
          );
        }
      }
    } catch (err) {
      console.error("IMENA AI ERROR:", err);

      setError(
        err instanceof TypeError
          ? "We couldn't reach Imena AI. Please check your connection and try again."
          : err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const submitQuestion = (event) => {
    event.preventDefault();
    askScienceAI();
  };

  const newChat = () => {
    setQuestion("");
    setAnswer("");
    setError("");
  };

  const chooseSubject = (subject) => {
    setActiveSubject(subject);

    if (subject === "All Science") {
      setQuestion("");
    } else {
      setQuestion(`Explain an important concept in ${subject}`);
    }

    setAnswer("");
    setError("");
  };

  const activeSubjectData = subjects.find(
    (subject) => subject.name === activeSubject
  );

  return (
    <div className="imena-app">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="sidebar-brand">
            <div className="logo-mark">
              <span>✦</span>
            </div>

            <div className="brand-copy">
              <strong>Imena AI</strong>
              <span>Science, understood.</span>
            </div>
          </div>

          <button className="new-chat" onClick={newChat}>
            <span className="new-chat-icon">＋</span>
            <span>New conversation</span>
          </button>

          <div className="sidebar-section">
            <span className="sidebar-label">DISCOVER</span>

            <button
              className={`sidebar-item ${
                activeSubject === "All Science" ? "active" : ""
              }`}
              onClick={() => chooseSubject("All Science")}
            >
              <span className="nav-icon">✦</span>
              <span>All Science</span>
            </button>

            {subjects.map((subject) => (
              <button
                className={`sidebar-item ${
                  activeSubject === subject.name ? "active" : ""
                }`}
                key={subject.name}
                onClick={() => chooseSubject(subject.name)}
              >
                <span className="nav-icon">{subject.icon}</span>
                <span>{subject.name}</span>
              </button>
            ))}
          </div>

          <div className="sidebar-section">
            <span className="sidebar-label">TOOLS</span>

            <button
              className="sidebar-item"
              onClick={() =>
                askScienceAI(
                  "Explain five important science concepts every student should know."
                )
              }
              disabled={loading}
            >
              <span className="nav-icon">◈</span>
              <span>Explore concepts</span>
            </button>

            <button
              className="sidebar-item"
              onClick={() =>
                askScienceAI(
                  "Give me an important science formula, explain every variable, and show a simple example."
                )
              }
              disabled={loading}
            >
              <span className="nav-icon">∑</span>
              <span>Formula helper</span>
            </button>

            <button
              className="sidebar-item"
              onClick={() =>
                askScienceAI(
                  `Create a five-question science practice quiz${
                    activeSubject !== "All Science"
                      ? ` about ${activeSubject}`
                      : ""
                  }. Include answers and brief explanations after the questions.`
                )
              }
              disabled={loading}
            >
              <span className="nav-icon">◇</span>
              <span>Practice quiz</span>
            </button>
          </div>
        </div>

        <div className="sidebar-session">
          <span className="sidebar-label">CURRENT SESSION</span>

          {question ? (
            <div className="recent-chat">
              <div className="recent-icon">↗</div>
              <span>{question}</span>
            </div>
          ) : (
            <p className="empty-history">
              Your conversation will appear here.
            </p>
          )}
        </div>

        <div className="student-profile">
          <div className="profile-avatar">S</div>

          <div>
            <strong>Science Student</strong>
            <span>Learning with Imena</span>
          </div>

          <span className="profile-dot" />
        </div>
      </aside>

      {/* MAIN */}
      <main className="main-area">
        <header className="topbar">
          <div className="mobile-brand">
            <div className="mobile-logo">✦</div>

            <div>
              <strong>Imena AI</strong>
              <span>Science, understood.</span>
            </div>
          </div>

          <div className="topbar-right">
            <div className="status-pill">
              <span className="status-dot" />
              AI tutor online
            </div>

            <div className="version-pill">
              BETA
            </div>
          </div>
        </header>

        <div className="workspace">
          {/* WELCOME */}
          {!answer && !loading && (
            <section className="welcome">
              <div className="welcome-badge">
                <span className="badge-spark">✦</span>
                INTELLIGENT SCIENCE LEARNING
              </div>

              <h1>
                Learn science.
                <br />
                <span>Without the confusion.</span>
              </h1>

              <p className="welcome-description">
                Ask questions, break down difficult concepts, understand
                formulas, and explore Biology, Chemistry, and Physics with
                your personal AI tutor.
              </p>

              <div className="subject-cards">
                {subjects.map((subject) => (
                  <button
                    key={subject.name}
                    className="subject-card"
                    onClick={() => chooseSubject(subject.name)}
                  >
                    <span className="subject-icon">
                      {subject.icon}
                    </span>

                    <span className="subject-info">
                      <strong>{subject.name}</strong>
                      <small>{subject.description}</small>
                    </span>

                    <span className="subject-arrow">↗</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* RESPONSE */}
          {answer && (
            <section className="conversation">
              <div className="question-card">
                <div className="question-avatar">S</div>

                <div className="question-content">
                  <span className="message-label">YOUR QUESTION</span>
                  <p>{question}</p>
                </div>
              </div>

              <div className="ai-response">
                <div className="response-header">
                  <div className="ai-avatar">
                    <span>✦</span>
                  </div>

                  <div className="ai-identity">
                    <strong>Imena AI</strong>
                    <span>
                      {activeSubjectData
                        ? `${activeSubjectData.name} tutor`
                        : "Science tutor"}
                    </span>
                  </div>

                  <div className="response-ready">
                    <span />
                    {loading ? "Generating" : "Answer ready"}
                  </div>
                </div>

                <div className="answer-content">
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {answer}
                  </ReactMarkdown>
                </div>

                {!loading && (
                  <div className="response-footer">
                    <span>✦ Generated by Imena AI</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(answer);
                      }}
                    >
                      Copy answer
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* LOADING */}
          {loading && !answer && (
            <div className="loading-state">
              <div className="loading-orb">
                <div>✦</div>
              </div>

              <h3>Imena is thinking</h3>
              <p>Building a clear explanation for you...</p>

              <div className="loading-dots">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}

          {/* ASK */}
          <section className="ask-area">
            <form onSubmit={submitQuestion}>
              <div className="input-wrapper">
                <div className="input-glow" />

                <textarea
                  value={question}
                  onChange={(event) =>
                    setQuestion(event.target.value)
                  }
                  placeholder={
                    activeSubject === "All Science"
                      ? "Ask Imena anything about science..."
                      : `Ask a ${activeSubject} question...`
                  }
                  rows={4}
                  disabled={loading}
                  aria-label="Your science question"
                />

                <div className="input-bottom">
                  <div className="input-context">
                    <span>✦</span>

                    {activeSubject === "All Science"
                      ? "All Science"
                      : `${activeSubject} mode`}
                  </div>

                  <div className="input-actions">
                    {question && !loading && (
                      <button
                        type="button"
                        className="clear-btn"
                        onClick={newChat}
                      >
                        Clear
                      </button>
                    )}

                    <button
                      type="submit"
                      className="send-btn"
                      disabled={loading || !question.trim()}
                    >
                      <span>
                        {loading ? "Thinking" : "Ask Imena"}
                      </span>
                      <span className="send-arrow">↑</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {error && (
              <div className="error-message" role="alert">
                <div className="error-icon">!</div>

                <div>
                  <strong>Something went wrong</strong>
                  <p>{error}</p>
                </div>

                <button
                  type="button"
                  className="retry-btn"
                  onClick={() => askScienceAI()}
                  disabled={loading || !question.trim()}
                >
                  Try again
                </button>
              </div>
            )}

            {!answer && !loading && (
              <div className="suggestions">
                <span className="suggestion-label">
                  TRY ASKING
                </span>

                <div className="suggestion-list">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => askScienceAI(suggestion)}
                    >
                      {suggestion}
                      <span>↗</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        <footer className="main-footer">
          <div className="footer-brand">
            <span>✦</span>
            Imena AI
          </div>

          <div className="footer-center">
            Built for curious minds.
          </div>

          <div className="footer-note">
            AI can make mistakes. Verify important information.
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
