const { express, path, cookieParser, cors } = require("./config.js");
const rateLimitMiddleware = require("./middlewares/RateLimiter");
const apiRoutes = require("./routes/api.js");

const app = express();
const PORT = 4200;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend/dist/turl/browser")));
app.use(rateLimitMiddleware);
app.use(cookieParser());
app.use("/api", apiRoutes);
app.use(
  cors({
    origin: ["http://0.0.0.0:4200", "http://0.0.0.0:3000"],
    credentials: true,
    methods: ["GET", "POST"],
  })
);

app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../frontend/dist/turl/browser/index.html")
  );
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
