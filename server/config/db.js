import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => console.log('DB CONNECTED'))
        await mongoose.connect(`${process.env.MONGODB_URI}/quickStay`)
    } catch (error) {
        console.log(error.message);
    }
}

export default connectDB