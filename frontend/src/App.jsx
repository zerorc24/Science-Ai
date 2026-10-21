import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import "katex/dist/katex.min.css";
import "./App.css";

const subjects = [
  { icon: "🧬", name: "Biology" },
  { icon: "🧪", name: "Chemistry" },
  { icon: "⚛", name: "Physics" },
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
    const currentQuestion = customQuestion ?? question;

    if (!currentQuestion.trim()) return;

    setQuestion(currentQuestion);
    setLoading(true);
    setAnswer("");
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/ai/ask/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: currentQuestion,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          errorText || "Something went wrong."
        );
      }

      if (!response.body) {
        throw new Error(
          "Streaming is not supported by this browser."
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let fullAnswer = "";

      while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, {
          stream: true,
        });

        fullAnswer += chunk;

        setAnswer(fullAnswer);
      }

      const finalChunk = decoder.decode();

      if (finalChunk) {
        fullAnswer += finalChunk;
        setAnswer(fullAnswer);
      }

    } catch (err) {
      console.error("SCIENCE AI ERROR:", err);
      setError(err.message);
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
      setQuestion(
        `Explain an important concept in ${subject}`
      );
    }
  };

  return (
    <div className="science-app">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="sidebar-brand">

          <div className="logo-mark">
            <img
              src="/science-ai.svg"
              alt="Science AI"
            />
          </div>

          <div>
            <strong>Science AI</strong>
            <span>Learning assistant</span>
          </div>

        </div>

        <button
          className="new-chat"
          onClick={newChat}
        >
          <span>＋</span>
          New conversation
        </button>

        <div className="sidebar-section">

          <span className="sidebar-label">
            EXPLORE
          </span>

          <button
            className={`sidebar-item ${
              activeSubject === "All Science"
                ? "active"
                : ""
            }`}
            onClick={() =>
              chooseSubject("All Science")
            }
          >
            <span>⌘</span>
            All Science
          </button>

          {subjects.map((subject) => (
            <button
              className={`sidebar-item ${
                activeSubject === subject.name
                  ? "active"
                  : ""
              }`}
              key={subject.name}
              onClick={() =>
                chooseSubject(subject.name)
              }
            >
              <span>{subject.icon}</span>
              {subject.name}
            </button>
          ))}

        </div>

        <div className="sidebar-section">

          <span className="sidebar-label">
            LEARNING TOOLS
          </span>

          <button className="sidebar-item">
            <span>📚</span>
            Concepts
          </button>

          <button className="sidebar-item">
            <span>∑</span>
            Formula helper
          </button>

          <button className="sidebar-item">
            <span>🧠</span>
            Practice quiz
          </button>

        </div>

        <div className="sidebar-section recent">

          <span className="sidebar-label">
            RECENT
          </span>

          {answer ? (
            <>
              <div className="recent-chat">
                <span>💬</span>

                {question.slice(0, 25)}

                {question.length > 25
                  ? "..."
                  : ""}
              </div>

              <div className="recent-chat">
                <span>💬</span>
                Science explanation
              </div>
            </>
          ) : (
            <p className="empty-history">
              Your recent conversations will
              appear here.
            </p>
          )}

        </div>

        <div className="sidebar-bottom">

          <button className="sidebar-item">
            <span>⚙</span>
            Settings
          </button>

          <div className="student-profile">

            <div className="profile-avatar">
              S
            </div>

            <div>
              <strong>Science Learner</strong>
              <span>Student account</span>
            </div>

          </div>

        </div>

      </aside>

      {/* MAIN */}
      <main className="main-area">

        <header className="topbar">

          <div className="mobile-brand">

            <img
              src="/science-ai.svg"
              alt="Science AI"
            />

            <strong>Science AI</strong>

          </div>

          <div className="topbar-right">

            <div className="online-status">
              <span></span>
              AI Online
            </div>

            <button className="help-button">
              ?
            </button>

          </div>

        </header>

        <div className="workspace">

          {/* WELCOME */}
          {!answer && !loading && (
            <section className="welcome">

              <div className="welcome-badge">
                <span>✦</span>
                AI-powered science learning
              </div>

              <h1>
                Learn science
                <br />
                <span>without limits.</span>
              </h1>

              <p>
                Ask questions, understand difficult
                concepts, explore formulas and learn
                at your own pace.
              </p>

              <div className="subject-pills">

                {subjects.map((subject) => (

                  <button
                    key={subject.name}
                    onClick={() =>
                      chooseSubject(subject.name)
                    }
                  >
                    <span>{subject.icon}</span>
                    {subject.name}
                  </button>

                ))}

              </div>

            </section>
          )}

          {/* CONVERSATION */}
          {answer && (
            <section className="conversation">

              <div className="question-bubble">

                <div className="mini-avatar user-avatar">
                  S
                </div>

                <div>

                  <span className="message-label">
                    YOUR QUESTION
                  </span>

                  <p>{question}</p>

                </div>

              </div>

              <div className="ai-response">

                <div className="response-header">

                  <div className="mini-avatar ai-avatar">
                    ✦
                  </div>

                  <div>
                    <strong>
                      Science AI
                    </strong>

                    <span>
                      AI science tutor
                    </span>
                  </div>

                  <span className="response-ready">
                    {loading
                      ? "● Generating"
                      : "● Ready"}
                  </span>

                </div>

                <div className="answer-content">

                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {answer}
                  </ReactMarkdown>

                  {loading && (
                    <span className="streaming-cursor">
                      ▌
                    </span>
                  )}

                </div>

              </div>

            </section>
          )}

          {/* INITIAL LOADING */}
          {loading && !answer && (
            <div className="loading-state">

              <div className="loading-logo">
                ✦
              </div>

              <h3>
                Science AI is thinking...
              </h3>

              <p>
                Building a clear explanation
                for your question.
              </p>

              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>

            </div>
          )}

          {/* ASK AREA */}
          <section className="ask-area">

            <form onSubmit={submitQuestion}>

              <div className="input-wrapper">

                <textarea
                  value={question}
                  onChange={(event) =>
                    setQuestion(
                      event.target.value
                    )
                  }
                  placeholder={
                    activeSubject === "All Science"
                      ? "Ask anything about science..."
                      : `Ask a ${activeSubject} question...`
                  }
                  rows="4"
                  disabled={loading}
                />

                <div className="input-bottom">

                  <span className="input-context">
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
                      disabled={
                        loading ||
                        !question.trim()
                      }
                    >
                      {loading
                        ? "Generating..."
                        : "Ask AI"}

                      <span>↑</span>
                    </button>

                  </div>

                </div>

              </div>

            </form>

            {/* SUGGESTIONS */}
            {!answer && !loading && (
              <div className="suggestions">

                <span>
                  Try one of these
                </span>

                <div>

                  {suggestions.map(
                    (suggestion) => (

                      <button
                        key={suggestion}
                        onClick={() =>
                          askScienceAI(
                            suggestion
                          )
                        }
                      >
                        {suggestion}
                      </button>

                    )
                  )}

                </div>

              </div>
            )}

            {/* ERROR */}
            {error && (
              <div className="error-message">

                <strong>
                  Something went wrong
                </strong>

                <p>{error}</p>

              </div>
            )}

          </section>

        </div>

        <footer className="main-footer">

          <span>Science AI</span>

          <span>
            AI can make mistakes. Verify important
            scientific information.
          </span>

        </footer>

      </main>

    </div>
  );
}

export default App;