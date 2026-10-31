import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Dashboard({ onOpen }) {
  const [list, setList] = useState([]);
  useEffect(() => { api('/me/enrollments').then(setList).catch(() => {}); }, []);
  return (
    <>
      <h1>My learning</h1>
      {list.length === 0 && <p>You haven't enrolled in any courses yet.</p>}
      {list.map((e) => (
        <div className="card" key={e.id}>
          <h3>{e.title}</h3><small>{e.instructor}</small>
          <div className="bar"><div style={{ width: e.progress + '%' }} /></div>
          <small>Best quiz score: {e.progress}%</small><br />
          <button onClick={() => onOpen(e.id)}>Continue</button>
        </div>
      ))}
    </>
  );
}
