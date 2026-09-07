function MessageItem({ avatar, user, message, time }) {
  return (
    <article className="message">
      <div className="message-avatar">{avatar}</div>

      <div className="message-content">
        <div className="message-meta">
          <strong>{user}</strong>
          <time>{time}</time>
        </div>

        <p>{message}</p>
      </div>
    </article>
  );
}

export default MessageItem;
