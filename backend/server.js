const { express, cookieParser, cors } = require("./config.js");
const rateLimitMiddleware = require("./middlewares/RateLimiter");
const apiRoutes = require("./routes/api.js");

const app = express();
app.set("trust proxy", 1);

app.use(
  cors({
    origin: ["https://eturl.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
  })
);

app.use(express.json());
app.use(rateLimitMiddleware);
app.use(cookieParser());

app.use("/", apiRoutes);

module.exports = app;
