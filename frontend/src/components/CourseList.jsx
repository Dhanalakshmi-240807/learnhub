import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function CourseList({ onOpen }) {
  const [courses, setCourses] = useState([]);
  useEffect(() => { api('/courses').then(setCourses).catch(() => {}); }, []);
  return (
    <>
      <h1>Courses</h1>
      <div className="grid">
        {courses.map((c) => (
          <div className="card" key={c.id}>
            <h3>{c.title}</h3><small>{c.instructor} · {c.level}</small>
            <p>{c.description}</p>
            <button onClick={() => onOpen(c.id)}>View course</button>
          </div>
        ))}
      </div>
    </>
  );
}
