import { createServer } from "http";

function miniExpress() {
  let handlers = [];
  let errorHandlers = [];

  function router(req, res) {
    const { method, url } = req;
    // recursively call handlers until we run out
    function run(reqHandlers = handlers, error) {
      // find first handler that matches current request
      const handlerIndex = reqHandlers.findIndex(
        // .use handlers match any method/path using "*"
        h => ["*", method].includes(h.method) && ["*", url].includes(h.path)
      );
      const { handler } = reqHandlers[handlerIndex] || {};
      // next() allows handlers to pass on to next matching handler
      function next(err) {
        if (err) {
          // if next called with error skip to first error handler
          return run(errorHandlers, err);
        }
        // stop recursing if we're out of handlers
        if (!handler) return;
        // slice out current handler and re-run so we get the next matching handler
        run(reqHandlers.slice(handlerIndex + 1));
      }
      if (handler) {
        if (error) {
          // if we have an error pass it as the first argument
          handler(error, req, res, next);
        } else {
          handler(req, res, next);
        }
      } else {
        return defaultErrorHandler(req, res);
      }
    }
    run();
  }

  return {
    use: handler => {
      if (handler.length === 4) {
        errorHandlers.push({ method: "*", path: "*", handler });
      } else {
        handlers.push({ method: "*", path: "*", handler });
      }
    },
    get: (path, handler) => {
      handlers.push({ method: "GET", path, handler });
    },
    post: (path, handler) => {
      handlers.push({ method: "POST", path, handler });
    },
    put: (path, handler) => {
      handlers.push({ method: "PUT", path, handler });
    },
    delete: (path, handler) => {
      handlers.push({ method: "DELETE", path, handler });
    },
    patch: (path, handler) => {
      handlers.push({ method: "PATCH", path, handler });
    },
    listen: (port, cb) => {
      const server = createServer(router);
      server.listen(port, null, cb);
    },
  };
}

function defaultErrorHandler(req, res) {
  res.writeHead(500);
  res.end(`<h1>Server error</h1>`);
}

export default miniExpress;
