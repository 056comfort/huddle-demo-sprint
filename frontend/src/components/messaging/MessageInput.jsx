import { useState } from "react";

function MessageInput({ onSend, disabled = false }) {
  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const cleanMessage = message.trim();

    if (!cleanMessage || disabled) {
      return;
    }

    onSend?.(cleanMessage);

    setMessage("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  return (
    <form className="composer" onSubmit={handleSubmit}>
      <div className="composer-toolbar" aria-label="Message formatting">
        <button type="button" aria-label="Add attachment">
          <span>+</span>
        </button>

        <button type="button" aria-label="Bold">
          <strong>B</strong>
        </button>

        <button type="button" aria-label="Italic">
          <em>I</em>
        </button>

        <button type="button" aria-label="Insert link">
          <span>↗</span>
        </button>

        <button type="button" aria-label="Bulleted list">
          <span>≡</span>
        </button>

        <button type="button" aria-label="Quote">
          <span>❝</span>
        </button>

        <button type="button" aria-label="Code">
          <span>&lt;/&gt;</span>
        </button>
      </div>

      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write a message..."
        rows={3}
        disabled={disabled}
      />

      <div className="composer-footer">
        <div className="composer-tools-left">
          <button type="button" aria-label="Add">
            +
          </button>

          <button type="button" aria-label="Emoji">
            ☺
          </button>

          <button type="button" aria-label="Mention">
            @
          </button>
        </div>

        <div className="composer-tools-right">
          <span className="composer-hint">Shift + Enter for a new line</span>

          <button
            type="submit"
            className="send-button"
            disabled={disabled || !message.trim()}
          >
            Send
            <span className="send-arrow">↗</span>
          </button>
        </div>
      </div>
    </form>
  );
}

export default MessageInput;
