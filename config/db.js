import mongoose from 'mongoose'

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_CONNECT_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log("Mongodb successfully connected")
    } catch (error) {
        console.log("Database connection failed", error.message)
    }
}

export default connectDB