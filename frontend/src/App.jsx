import { useState } from 'react';
import Auth from './components/Auth.jsx';
import CourseList from './components/CourseList.jsx';
import CourseView from './components/CourseView.jsx';
import Dashboard from './components/Dashboard.jsx';

export default function App() {
  const [user, setUser] = useState(localStorage.getItem('name'));
  const [view, setView] = useState({ page: 'courses' });
  const logout = () => { localStorage.clear(); setUser(null); setView({ page: 'courses' }); };
  const login = (d) => { localStorage.setItem('token', d.token); localStorage.setItem('name', d.name); setUser(d.name); setView({ page: 'courses' }); };
  return (
    <>
      <nav>
        <b onClick={() => setView({ page: 'courses' })}>LearnHub</b>
        <span>
          <a onClick={() => setView({ page: 'courses' })}>Courses</a>
          {user ? <>
            <a onClick={() => setView({ page: 'dash' })}>Dashboard</a>
            <a onClick={logout}>Logout ({user})</a></>
          : <a onClick={() => setView({ page: 'auth' })}>Log in</a>}
        </span>
      </nav>
      <main>
        {view.page === 'courses' && <CourseList onOpen={(id) => setView({ page: 'course', id })} />}
        {view.page === 'course' && <CourseView id={view.id} loggedIn={!!user} onNeedLogin={() => setView({ page: 'auth' })} />}
        {view.page === 'dash' && (user ? <Dashboard onOpen={(id) => setView({ page: 'course', id })} /> : <Auth onLogin={login} />)}
        {view.page === 'auth' && <Auth onLogin={login} />}
      </main>
    </>
  );
}
