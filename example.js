import miniExpress from "./mini-express.js";

const app = miniExpress();

const logger = (req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
};

app.use(logger);

app.use((req, res, next) => {
  if (req.headers.cookie) {
    const [, name] = req.headers.cookie.split("=");
    req.user = { name };
  }
  next();
});

app.get("/", (request, response) => {
  if (request.user) {
    response.end(
      `<h1>Hello ${request.user.name}</h1><a href="/logout">Log out</a>`
    );
  } else {
    response.end(`<p>Please <a href="/login">Log in</a></p>`);
  }
});

app.get("/login", (req, res, next) => {
  res.writeHead(302, { location: "/", "set-cookie": "user=oli" });
  res.end();
});

app.get("/logout", (req, res) => {
  res.writeHead(302, { location: "/", "set-cookie": "user=0; Max-Age=0" });
  res.end();
});

app.use((_req, res) => {
  res.writeHead(404);
  res.end(`<h1>Page not found</h1>`);
});

app.use((error, _req, res, next) => {
  console.log(error);
  res.writeHead(error.status || 500);
  res.end(`<h1>Error ${error.status || 500}: ${error.message}</h1>`);
});

app.listen(3333, () => console.log(`Running on https://localhost:3333`));
