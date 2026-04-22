import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_URL || 'https://lpu-metavese.onrender.com';
import Silk from '../../components/animation/Silk'

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 300; // 5 minutes in seconds

const VerifyEmail = () => {
    const navigate = useNavigate();

    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
    const [timeLeft, setTimeLeft] = useState(RESEND_COOLDOWN);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const inputRefs = useRef([]);

    // Countdown timer
    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const m = String(Math.floor(seconds / 60)).padStart(2, '0');
        const s = String(seconds % 60).padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleChange = (index, value) => {
        const digit = value.replace(/\D/g, '').slice(-1);
        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);
        setError('');

        if (digit && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            if (otp[index]) {
                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
            } else if (index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
        if (!pasted) return;
        const newOtp = Array(OTP_LENGTH).fill('');
        pasted.split('').forEach((char, i) => { newOtp[i] = char; });
        setOtp(newOtp);
        const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
        inputRefs.current[focusIndex]?.focus();
    };

    const handleVerify = async () => {
        const code = otp.join('');
        if (code.length < OTP_LENGTH) {
            setError('Please enter the complete 6-digit code.');
            return;
        }

        const email = localStorage.getItem('pendingVerificationEmail');
        if (!email) {
            setError('Session expired. Please sign up again.');
            navigate('/signup');
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const { data } = await axios.post(`${BASE_URL}/api/auth/verify-email`, { otp: code, email }, {
                withCredentials: true,
            });

            setSuccess(data?.message || 'Email verified successfully! Redirecting...');
            localStorage.removeItem('pendingVerificationEmail');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            const message = err.response?.data?.message || 'Verification failed. Please try again.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (timeLeft > 0 || isResending) return;

        setIsResending(true);
        setError('');
        setSuccess('');

        try {
            const { data } = await axios.post(`${BASE_URL}/api/auth/resendVerificationEmail`, { email: storedEmail }, {
                withCredentials: true,
            });

            setOtp(Array(OTP_LENGTH).fill(''));
            setTimeLeft(RESEND_COOLDOWN);
            setSuccess(data?.message || 'A new verification code has been sent.');
            inputRefs.current[0]?.focus();
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to resend code. Please try again.';
            setError(message);
        } finally {
            setIsResending(false);
        }
    };

    const storedEmail = localStorage.getItem('pendingVerificationEmail') || 'your email';
    const isOtpComplete = otp.every((d) => d !== '');

    return (
        <>
            <div className="flex justify-center items-center min-h-dvh bg-gray-100">
                <div className="flex w-full min-h-dvh overflow-hidden shadow-2xl bg-white">

                    {/* Left Panel */}
                    <div className="sm:w-[50%] hidden relative sm:flex flex-col justify-between  overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, #1a0a6e 0%, #2d1fc7 30%, #3a6bdb 60%, #1ecbe1 100%)' }}>
                        <Silk
                            speed={5}
                            scale={1}
                            color="#004cff"
                            noiseIntensity={0}
                            rotation={0}
                        ></Silk>
                        {/* Blobs */}
                        <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full opacity-40 blur-3xl"
                            style={{ background: 'rgba(100,120,255,0.5)' }} />
                        <div className="absolute bottom-16 -left-8 w-44 h-44 rounded-full blur-3xl"
                            style={{ background: 'rgba(30,200,230,0.3)' }} />

                        {/* Top Text */}
                        <div className="absolute left-10 top-10 z-10 ">
                            <p className="text-white/70 text-sm mb-2">Connect beyond classrooms.</p>
                            <h2 className="text-white text-2xl font-bold leading-snug">
                               Join a virtual world designed <br/> for student connection and growth
                            </h2>
                        </div>

                        {/* Partners */}
                        <div className="absolute bottom-10 left-10 z-10">
                            <p className="text-white/50 text-xs mb-2">Our partners</p>
                            <div className="flex flex-wrap gap-4 items-center">
                                {["Lovely Professional University"].map((name) => (
                                    <span key={name} className="text-white/80 text-xs font-semibold">{name}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - OTP */}
                    <div className="sm:w-[50%] w-full flex flex-col justify-center px-14 py-12">

                        {/* Back Button */}
                        <Link
                            className="flex items-center gap-2 text-sm text-gray-400 hover:text-indigo-600 transition-colors mb-8 w-fit"
                            to="/signup"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                            Back
                        </Link>

                        {/* Icon */}
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6">
                            <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 mb-1">Check your email</h1>
                        <p className="text-gray-400 text-sm mb-1">We sent a verification code to</p>
                        <p className="text-indigo-600 text-sm font-semibold mb-8">{storedEmail}</p>

                        {/* OTP Inputs */}
                        <label className="text-sm font-semibold text-gray-700 mb-3">Enter verification code</label>
                        <div className="flex gap-3 mb-3" onPaste={handlePaste}>
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={(el) => (inputRefs.current[i] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(i, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(i, e)}
                                    className={`w-12 h-12 text-center text-lg font-bold text-gray-800 border rounded-xl outline-none transition-all
                                        ${error ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                                            : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'}
                                        ${digit ? 'bg-indigo-50 border-indigo-300' : 'bg-white'}
                                    `}
                                />
                            ))}
                        </div>

                        {/* Error / Success Messages */}
                        {error && (
                            <p className="text-xs text-red-500 mb-4 flex items-center gap-1">
                                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </p>
                        )}
                        {success && (
                            <p className="text-xs text-green-600 mb-4 flex items-center gap-1">
                                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                {success}
                            </p>
                        )}

                        {/* Timer + Resend */}
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-xs text-gray-400">
                                {timeLeft > 0
                                    ? <>Code expires in <span className="text-gray-600 font-semibold">{formatTime(timeLeft)}</span></>
                                    : <span className="text-red-400">Code expired</span>
                                }
                            </p>
                            <button
                                onClick={handleResend}
                                disabled={timeLeft > 0 || isResending}
                                className={`text-xs font-semibold transition-colors ${timeLeft > 0 || isResending
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'text-indigo-600 hover:underline cursor-pointer'
                                    }`}
                            >
                                {isResending ? 'Sending...' : 'Resend code'}
                            </button>
                        </div>

                        {/* Verify Button */}
                        <button
                            onClick={handleVerify}
                            disabled={isLoading || !isOtpComplete}
                            className={`w-full py-3 font-semibold rounded-lg text-sm transition-all mb-4 flex items-center justify-center gap-2
                                ${isOtpComplete && !isLoading
                                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                                    : 'bg-indigo-200 text-white cursor-not-allowed'
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Verifying...
                                </>
                            ) : 'Verify Email'}
                        </button>

                        <p className="text-center text-sm text-gray-400">
                            Already have an account?{' '}
                            <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Log in</Link>
                        </p>

                    </div>
                </div>
            </div>
        </>
    );
};

export default VerifyEmail;