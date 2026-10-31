import { useEffect, useState } from 'react';
import { api } from '../api.js';
import Quiz from './Quiz.jsx';

export default function CourseView({ id, loggedIn, onNeedLogin }) {
  const [c, setC] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  useEffect(() => {
    api('/courses/' + id).then(setC);
    if (loggedIn) api('/me/enrollments').then((l) => setEnrolled(l.some((e) => e.id === id))).catch(() => {});
  }, [id, loggedIn]);
  const enroll = async () => { if (!loggedIn) return onNeedLogin(); await api(`/courses/${id}/enroll`, { method: 'POST' }); setEnrolled(true); };
  if (!c) return <p>Loading…</p>;
  return (
    <>
      <h1>{c.title}</h1><small>{c.instructor} · {c.level}</small>
      <div className="card"><p>{c.content}</p>
        {enrolled ? <span className="ok">✓ Enrolled</span> : <button onClick={enroll}>Enroll</button>}</div>
      {enrolled && <Quiz courseId={id} questions={c.questions} />}
    </>
  );
}
