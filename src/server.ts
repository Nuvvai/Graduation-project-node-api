import app from "./app";
import mongoose from 'mongoose';


//Section for development phase only
import dotenv from 'dotenv';

dotenv.config();
//

type PORT = string | number;
const CONNECTION_URL:string = process.env.MONGO_URL || 'mongodb://localhost:27017/';
const PORT: PORT = process.env.PORT || 5000;

mongoose.connect(CONNECTION_URL)
    .then(() => console.log("Connected to MongoDB successfully!"))
    .then(() => app.listen(PORT, () => console.log(`Server listening on port ${PORT}`)))
    .catch((error: { message: string; }) => console.error(error.message));