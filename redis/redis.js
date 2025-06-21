const Redis = require("ioredis");

// const redis = new Redis({
//     host: '172.19.0.2',
//     port: 6379,
// });

// redis.on('connect', () => {
//     console.log('✅ Redis connected');
// });

// redis.on('error', (err) => {
//     console.error('❌ Redis error:', err);
// });

async function storeOTP(email, otp) {
    console.log(`➡️ Storing OTP for ${email}: ${otp}`);
    await redis.set(`otp:${email}`, otp, "EX", 800);
    console.log(`✅ OTP stored for ${email}`);
}

async function getOTP(email) {
    const otp = await redis.get(`otp:${email}`);
    console.log(`🔍 Retrieved OTP for ${email}: ${otp}`);
    return otp;
}

async function deleteOTP(email) {
    await redis.del(`otp:${email}`);
    console.log(`🗑️ OTP deleted for ${email}`);
}

module.exports = { storeOTP, getOTP, deleteOTP };
