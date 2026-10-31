import { useState } from 'react';
import { api } from '../api.js';

export default function Auth({ onLogin }) {
  const [reg, setReg] = useState(false);
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async () => {
    try { onLogin(await api(reg ? '/auth/register' : '/auth/login', { method: 'POST', body: f })); }
    catch (e) { setErr(e.message); }
  };
  return (
    <div className="card narrow">
      <h2>{reg ? 'Create account' : 'Log in'}</h2>
      {reg && <input placeholder="Name" value={f.name} onChange={set('name')} />}
      <input placeholder="Email" value={f.email} onChange={set('email')} />
      <input type="password" placeholder="Password" value={f.password} onChange={set('password')} />
      {err && <p className="err">{err}</p>}
      <button onClick={submit}>{reg ? 'Sign up' : 'Log in'}</button>
      <p><a onClick={() => { setReg(!reg); setErr(''); }}>{reg ? 'Have an account? Log in' : 'New here? Sign up'}</a></p>
    </div>
  );
}
