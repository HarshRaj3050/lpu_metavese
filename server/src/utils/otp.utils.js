function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function getOtpHtml(otp) {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>OTP Code</title>
        </head>
        <body>
            <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                <h2 style="color: #333;">Your OTP Code</h2>
                <p style="font-size: 18px; color: #555;">Use the following OTP to complete your action:</p>
                <div style="font-size: 24px; font-weight: bold; color: #007BFF; margin: 20px 0;">${otp}</div>
                <p style="font-size: 14px; color: #999;">This OTP is valid for 10 minutes.</p>
            </div>
        </body>
        </html>
    `;
}


module.exports = {generateOtp, getOtpHtml}