import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./modules/auth/auth.route.js";
import { errorHandler } from "./middleware/error.middleware.js";
import userRoutes  from "./modules/user/profile.route.js";
import bookingRoutes  from "./modules/booking/booking.routes.js"
import pickerRoutes from "./modules/picker/picker.route.js";


const app = express();

app.use(express.json());
app.use(cors())
app.use(morgan("dev"));


app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/booking", bookingRoutes)
app.use("/api/picker", pickerRoutes)



app.use(errorHandler)


export default app;