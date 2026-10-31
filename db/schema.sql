CREATE DATABASE IF NOT EXISTS learnhub;
USE learnhub;
CREATE TABLE users(id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL, email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(100) NOT NULL, token VARCHAR(64) UNIQUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE courses(id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(150) NOT NULL, description TEXT, instructor VARCHAR(100), level VARCHAR(20), content TEXT);
CREATE TABLE quiz_questions(id INT AUTO_INCREMENT PRIMARY KEY, course_id INT NOT NULL, question VARCHAR(300) NOT NULL,
  options VARCHAR(500) NOT NULL COMMENT 'pipe separated', correct_index INT NOT NULL, FOREIGN KEY(course_id) REFERENCES courses(id));
CREATE TABLE enrollments(user_id INT, course_id INT, progress INT DEFAULT 0 COMMENT 'best quiz %', enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(user_id,course_id), FOREIGN KEY(user_id) REFERENCES users(id), FOREIGN KEY(course_id) REFERENCES courses(id));
INSERT INTO courses(title,description,instructor,level,content) VALUES
('Java Fundamentals','Syntax, OOP and collections.','A. Rao','Beginner','Java is statically typed and object oriented. Classes define objects; interfaces define contracts; collections store groups of objects.'),
('React Essentials','Components, props, state and hooks.','S. Khan','Intermediate','React builds UIs from components. Props flow down, state lives in components, hooks like useState add behavior to functions.');
INSERT INTO quiz_questions(course_id,question,options,correct_index) VALUES
(1,'Which keyword creates an object?','new|make|alloc|create',0),
(1,'Which collection keeps unique items?','List|Set|Queue|Array',1),
(2,'Which hook holds component state?','useState|useMap|useData|useVar',0),
(2,'Props flow...','Up|Down|Sideways|Nowhere',1);
