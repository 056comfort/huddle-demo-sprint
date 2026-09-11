// Reusable form for Login and Register

function AuthForm({ type, onSubmit }) {
  return (
    <form onSubmit={onSubmit}>
      {/* Will add inputs here */}
      <button type="submit">
        {type === 'login' ? 'Login' : 'Register'}
      </button>
    </form>
  );
}

export default AuthForm;