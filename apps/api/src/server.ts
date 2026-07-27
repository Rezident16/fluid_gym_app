import express from "express";
import cors from "cors";
import authRouter from "./routes/auth";
import { requireAuth, type AuthedRequest } from "./middleware/requireAuth";
import { asyncHandler } from "./middleware/asyncHandler";
import { errorHandler } from "./middleware/errorHandler";
import { findUserById } from "./db/userRepo";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);

app.get(
  "/api/me",
  requireAuth,
  asyncHandler<AuthedRequest>(async (req, res) => {
    const user = await findUserById(req.userId!);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ id: user.id, email: user.email });
  }),
);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
