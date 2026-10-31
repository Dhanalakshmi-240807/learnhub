package com.learn;

import jakarta.servlet.http.*;
import java.util.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.config.annotation.*;
import org.springframework.web.servlet.HandlerInterceptor;

@SpringBootApplication
public class App implements WebMvcConfigurer {
  public static void main(String[] a) { SpringApplication.run(App.class, a); }
  @Autowired JdbcTemplate db;

  @Override public void addCorsMappings(CorsRegistry r) {
    r.addMapping("/api/**").allowedOrigins("http://localhost:5173").allowedMethods("*");
  }

  /** Token auth: protects /api/me, enroll and quiz submission. */
  @Override public void addInterceptors(InterceptorRegistry reg) {
    reg.addInterceptor(new HandlerInterceptor() {
      public boolean preHandle(HttpServletRequest q, HttpServletResponse s, Object h) {
        String p = q.getRequestURI();
        boolean secured = p.startsWith("/api/me") || p.endsWith("/enroll") || p.endsWith("/quiz");
        if (!secured || "OPTIONS".equals(q.getMethod())) return true;
        String t = Optional.ofNullable(q.getHeader("Authorization")).orElse("").replace("Bearer ", "");
        List<Integer> ids = db.queryForList("SELECT id FROM users WHERE token=?", Integer.class, t);
        if (t.isEmpty() || ids.isEmpty()) { s.setStatus(401); return false; }
        q.setAttribute("uid", ids.get(0));
        return true;
      }
    }).addPathPatterns("/api/**");
  }
}

@RestController @RequestMapping("/api/auth")
class AuthController {
  @Autowired JdbcTemplate db;
  BCryptPasswordEncoder enc = new BCryptPasswordEncoder();

  @PostMapping("/register") Map<String, Object> register(@RequestBody Map<String, String> b) {
    if (b.getOrDefault("password", "").length() < 6) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be 6+ characters");
    try {
      db.update("INSERT INTO users(name,email,password_hash) VALUES(?,?,?)", b.get("name"), b.get("email"), enc.encode(b.get("password")));
    } catch (DuplicateKeyException e) { throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered"); }
    return login(b);
  }

  @PostMapping("/login") Map<String, Object> login(@RequestBody Map<String, String> b) {
    List<Map<String, Object>> u = db.queryForList("SELECT id,name,password_hash FROM users WHERE email=?", b.get("email"));
    if (u.isEmpty() || !enc.matches(b.get("password"), (String) u.get(0).get("password_hash")))
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
    String token = UUID.randomUUID().toString().replace("-", "");
    db.update("UPDATE users SET token=? WHERE id=?", token, u.get(0).get("id"));
    return Map.of("token", token, "name", u.get(0).get("name"));
  }
}

@RestController @RequestMapping("/api")
class CourseController {
  @Autowired JdbcTemplate db;

  @GetMapping("/courses") List<Map<String, Object>> list() {
    return db.queryForList("SELECT id,title,description,instructor,level FROM courses");
  }

  @GetMapping("/courses/{id}") Map<String, Object> detail(@PathVariable int id) {
    List<Map<String, Object>> c = db.queryForList("SELECT * FROM courses WHERE id=?", id);
    if (c.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found");
    Map<String, Object> out = new HashMap<>(c.get(0));
    List<Map<String, Object>> qs = new ArrayList<>();
    for (Map<String, Object> r : db.queryForList("SELECT id,question,options FROM quiz_questions WHERE course_id=? ORDER BY id", id))
      qs.add(Map.of("id", r.get("id"), "question", r.get("question"), "options", ((String) r.get("options")).split("\\|")));
    out.put("questions", qs);
    return out;
  }

  @PostMapping("/courses/{id}/enroll") Map<String, Object> enroll(@PathVariable int id, @RequestAttribute int uid) {
    db.update("INSERT IGNORE INTO enrollments(user_id,course_id) VALUES(?,?)", uid, id);
    return Map.of("enrolled", true);
  }

  @PostMapping("/courses/{id}/quiz") Map<String, Object> submit(@PathVariable int id, @RequestAttribute int uid, @RequestBody Map<String, List<Integer>> b) {
    List<Integer> key = db.queryForList("SELECT correct_index FROM quiz_questions WHERE course_id=? ORDER BY id", Integer.class, id);
    List<Integer> ans = b.getOrDefault("answers", List.of());
    int score = 0;
    for (int i = 0; i < key.size(); i++) if (i < ans.size() && key.get(i).equals(ans.get(i))) score++;
    int pct = key.isEmpty() ? 0 : score * 100 / key.size();
    if (db.update("UPDATE enrollments SET progress=GREATEST(progress,?) WHERE user_id=? AND course_id=?", pct, uid, id) == 0)
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Enroll in the course first");
    return Map.of("score", score, "total", key.size(), "percent", pct, "correct", key);
  }

  @GetMapping("/me/enrollments") List<Map<String, Object>> mine(@RequestAttribute int uid) {
    return db.queryForList("SELECT c.id,c.title,c.instructor,e.progress FROM enrollments e JOIN courses c ON c.id=e.course_id WHERE e.user_id=? ORDER BY e.enrolled_at DESC", uid);
  }
}
