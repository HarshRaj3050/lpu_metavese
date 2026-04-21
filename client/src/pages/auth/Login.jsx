import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { joinMetaverse } from '../../components/SocketManager'

const BASE_URL = import.meta.env.VITE_API_URL;
import Silk from '../../components/animation/Silk'

const Login = () => {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            setError('Please fill in all fields.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await axios.post(`${BASE_URL}/api/auth/login`, formData, {
                withCredentials: true,
            });

            // Extract username from response or use email
            const userData = response.data;
            const username = userData.user?.username || formData.email.split('@')[0];
            
            // Join metaverse with username
            joinMetaverse(username, formData.email);
            
            // Navigate to metaverse
            navigate('/metaverse');

        } catch (error) {
            if (error.response) {
                setError(error.response.data.message || 'Login failed. Please try again.');
            } else {
                setError('Network error. Please check your connection.');
            }
        } finally {
            setIsLoading(false);
        }
    };

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
                                <p className="text-white/70 text-sm mb-2">Push your limits, unlock your potential.</p>
                                <h2 className="text-white text-2xl font-bold leading-snug">
                                    Push harder today,  <br />become stronger than yesterday.
                                </h2>
                            </div>

                            {/* Partners */}
                            <div className="absolute bottom-10 left-10 z-10">
                                <p className="text-white/50 text-xs mb-3">Our partners</p>
                                <div className="flex flex-wrap gap-4 items-center">
                                    {['Discord', 'Instagram', 'Spotify', 'YouTube', 'TikTok'].map((name) => (
                                        <span key={name} className="text-white/80 text-xs font-semibold">{name}</span>
                                    ))}
                                </div>
                            </div>
                    </div>

                    {/* Right Panel */}
                    <div className="sm:w-[50%] w-full flex flex-col justify-center px-14 py-12">
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back</h1>
                        <p className="text-gray-400 text-sm mb-7">Login to your account to continue.</p>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-4 py-3 mb-5">
                                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {error}
                            </div>
                        )}

                        {/* Email */}
                        <label className="text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
                        <input
                            placeholder="Enter your email..."
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 placeholder-gray-300 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all mb-4"
                        />

                        {/* Password */}
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="text-sm font-semibold text-gray-700">Password</label>
                            <a href="#" className="text-xs text-indigo-600 font-semibold hover:underline">Forgot Password?</a>
                        </div>
                        <div className="relative mb-6">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="Enter your password..."
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 placeholder-gray-300 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showPassword ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        {/* Login Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className={`w-full py-3 font-semibold rounded-lg text-sm transition-all mb-4 flex items-center justify-center gap-2
                                ${isLoading
                                    ? 'bg-indigo-300 text-white cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Logging in...
                                </>
                            ) : 'Login Your Account'}
                        </button>

                        <p className="text-center text-sm text-gray-400">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-indigo-600 font-semibold hover:underline">Sign up</Link>
                        </p>

                    </div>

                </div>
            </div>
        </>
    );
}

export default Login;