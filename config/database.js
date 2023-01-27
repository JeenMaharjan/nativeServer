import mongoose from "mongoose";

export const connnectDatabase = async() => {
    try {
        mongoose.set('strictQuery', true);
        const { connection } = await mongoose.connect(process.env.MONGO)

        console.log(`mongoDb connected: ${connection.host}`)
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}