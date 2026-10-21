
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
  { icon: "🧬", name: "Biology" },
  { icon: "🧪", name: "Chemistry" },
  { icon: "⚛️", name: "Physics" },
];

const suggestions = [
  "Explain photosynthesis",
  "What is Newton's second law?",
  "Explain the periodic table",
  "How does DNA replication work?",
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
          // The server returned a non-JSON error.
        }

        throw new Error(
          typeof message === "string"
            ? message
            : "The AI request failed. Please try again."
        );
      }

      const contentType =
        response.headers.get("content-type") || "";

      // Handle a normal Django JSON response.
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
        // Handle a streamed or plain-text response.
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
          ? "Could not connect to Imena AI. Check your internet connection and backend CORS settings."
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

  return (
    <div className="science-app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="logo-mark">
            <div className="brand-symbol">✦</div>
          </div>

          <div>
            <strong>Imena AI</strong>
            <span>Your science companion</span>
          </div>
        </div>

        <button className="new-chat" onClick={newChat}>
          <span>＋</span>
          New conversation
        </button>

        <div className="sidebar-section">
          <span className="sidebar-label">EXPLORE</span>

          <button
            className={`sidebar-item ${
              activeSubject === "All Science" ? "active" : ""
            }`}
            onClick={() => chooseSubject("All Science")}
          >
            <span>⌘</span>
            All Science
          </button>

          {subjects.map((subject) => (
            <button
              className={`sidebar-item ${
                activeSubject === subject.name ? "active" : ""
              }`}
              key={subject.name}
              onClick={() => chooseSubject(subject.name)}
            >
              <span>{subject.icon}</span>
              {subject.name}
            </button>
          ))}
        </div>

        <div className="sidebar-section">
          <span className="sidebar-label">LEARNING TOOLS</span>

          <button
            className="sidebar-item"
            onClick={() =>
              askScienceAI("Explain five important science concepts.")
            }
            disabled={loading}
          >
            <span>📚</span>
            Explore concepts
          </button>

          <button
            className="sidebar-item"
            onClick={() =>
              askScienceAI(
                "Give me an important science formula, explain its variables, and show an example."
              )
            }
            disabled={loading}
          >
            <span>∑</span>
            Formula helper
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
            <span>🧠</span>
            Practice quiz
          </button>
        </div>

        <div className="sidebar-section recent">
          <span className="sidebar-label">CURRENT SESSION</span>

          {question ? (
            <div className="recent-chat">
              <span>💬</span>
              <span className="recent-question">{question}</span>
            </div>
          ) : (
            <p className="empty-history">
              Start a conversation to explore science.
            </p>
          )}
        </div>

        <div className="sidebar-bottom">
          <div className="student-profile">
            <div className="profile-avatar">S</div>
            <div>
              <strong>Science Student</strong>
              <span>Learning with Imena</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="mobile-brand">
            <div className="mobile-logo">✦</div>
            <strong>Imena AI</strong>
          </div>

          <div className="topbar-right">
            <div className="online-status">
              <span />
              AI learning assistant
            </div>
          </div>
        </header>

        <div className="workspace">
          {!answer && !loading && (
            <section className="welcome">
              <div className="welcome-badge">
                <span>✦</span>
                YOUR AI-POWERED SCIENCE COMPANION
              </div>

              <h1>
                Discover science.
                <br />
                <span>Understand more.</span>
              </h1>

              <p>
                Welcome to Imena AI. Explore Biology, Chemistry, and
                Physics, understand difficult concepts, and learn at
                your own pace with your personal AI science tutor.
              </p>

              <div className="subject-pills">
                {subjects.map((subject) => (
                  <button
                    key={subject.name}
                    onClick={() => chooseSubject(subject.name)}
                  >
                    <span>{subject.icon}</span>
                    {subject.name}
                  </button>
                ))}
              </div>
            </section>
          )}

          {answer && (
            <section className="conversation">
              <div className="question-bubble">
                <div className="mini-avatar user-avatar">S</div>

                <div className="message-body">
                  <span className="message-label">YOUR QUESTION</span>
                  <p>{question}</p>
                </div>
              </div>

              <div className="ai-response">
                <div className="response-header">
                  <div className="mini-avatar ai-avatar">✦</div>

                  <div>
                    <strong>Imena AI</strong>
                    <span>Your AI science tutor</span>
                  </div>

                  <span className="response-ready">
                    {loading ? "● Generating" : "● Answer ready"}
                  </span>
                </div>

                <div className="answer-content">
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {answer}
                  </ReactMarkdown>
                </div>
              </div>
            </section>
          )}

          {loading && !answer && (
            <div className="loading-state">
              <div className="loading-logo">✦</div>
              <h3>Imena AI is thinking...</h3>
              <p>Preparing an explanation just for you.</p>

              <div className="loading-dots">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}

          <section className="ask-area">
            <form onSubmit={submitQuestion}>
              <div className="input-wrapper">
                <textarea
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder={
                    activeSubject === "All Science"
                      ? "Ask Imena AI anything about science..."
                      : `Ask a ${activeSubject} question...`
                  }
                  rows={4}
                  disabled={loading}
                  aria-label="Your science question"
                />

                <div className="input-bottom">
                  <span className="input-context">
                    ✦{" "}
                    {activeSubject === "All Science"
                      ? "All Science"
                      : `${activeSubject} mode`}
                  </span>

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
                      {loading ? "Thinking..." : "Ask Imena"}
                      <span>↑</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {error && (
              <div className="error-message" role="alert">
                <strong>We couldn't get an answer</strong>
                <p>{error}</p>

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
                <span>TRY ASKING</span>

                <div>
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => askScienceAI(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        <footer className="main-footer">
          <span className="footer-brand">✦ Imena AI</span>
          <span>
            AI can make mistakes. Verify important scientific information.
          </span>
        </footer>
      </main>
    </div>
  );
}

export default App;
