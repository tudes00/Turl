const { express, cookieParser, cors } = require("./config.js");
const rateLimitMiddleware = require("./middlewares/RateLimiter");
const apiRoutes = require("./routes/api.js");

const app = express();

const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
  app.set("trust proxy", 1);
}

app.use(
  cors({
    origin: isProduction ? ["https://eturl.vercel.app"] : ["http://localhost:4200"],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
  })
);

app.use(express.json());
app.use(rateLimitMiddleware);
app.use(cookieParser());

app.use("/", apiRoutes);

if (!isProduction) {
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
