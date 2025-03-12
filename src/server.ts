import app from "./app";
import mongoose from 'mongoose';

type PORT = string | number;
const CONNECTION_URL:string = process.env.MONGO_URL || 'mongodb://localhost:27017/';
const PORT: PORT = process.env.PORT || 5000;

mongoose.connect(CONNECTION_URL)
    .then(() => console.log("Connected to MongoDB successfully!"))
    .then(() => app.listen(PORT, () => console.log(`Server listening on port ${PORT}`)))
    .catch((error: { message: any; }) => console.error(error.message));