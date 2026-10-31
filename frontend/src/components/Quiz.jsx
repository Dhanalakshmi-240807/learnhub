import { useState } from 'react';
import { api } from '../api.js';

export default function Quiz({ courseId, questions }) {
  const [ans, setAns] = useState([]);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState('');
  const submit = async () => {
    try { setRes(await api(`/courses/${courseId}/quiz`, { method: 'POST', body: { answers: ans } })); setErr(''); }
    catch (e) { setErr(e.message); }
  };
  return (
    <div className="card">
      <h3>Quiz</h3>
      {questions.map((q, i) => (
        <div key={q.id}><p><b>{i + 1}. {q.question}</b></p>
          {q.options.map((o, j) => (
            <label key={j} className={res ? (res.correct[i] === j ? 'ok' : ans[i] === j ? 'bad' : '') : ''}>
              <input type="radio" name={'q' + q.id} disabled={!!res} onChange={() => { const a = [...ans]; a[i] = j; setAns(a); }} /> {o}
            </label>
          ))}
        </div>
      ))}
      {err && <p className="err">{err}</p>}
      {res ? <p><b>Score: {res.score}/{res.total} ({res.percent}%)</b> <button onClick={() => { setRes(null); setAns([]); }}>Retry</button></p>
           : <button onClick={submit}>Submit answers</button>}
    </div>
  );
}
