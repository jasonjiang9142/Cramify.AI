import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"


export default function Landing() {
    const [data, setData] = useState(null); // Store API response data
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const isValidURL = (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    const localhost = "http://127.0.0.1:5000";

    // Handle form submission for link 
    const handleSubmitLink = async (e) => {

        e.preventDefault();
        const value = e.target[0].value;


        // Validate URL
        if (!isValidURL(value)) {
            alert("Please enter a valid URL");
            return;
        }
        try {
            setLoading(true)
            // Send POST request to backend
            const response = await fetch(localhost + "/api/jobs/link", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url: value }),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }

            const result = await response.json();
            setData(result); // Save response data
            navigate("/mapping", { state: { treeData: result } }); // Navigate to Tree page

        } catch (error) {
            console.error("Error submitting URL:", error.message);
            alert("Failed to submit the URL. Please try again.");
        } finally {
            setLoading(false)
        }
    };

    // Handle form submission for text
    const handleSubmitText = async (e) => {
        e.preventDefault();
        const value = e.target[0].value;
        setLoading(true)

        try {
            // Send POST request to backend
            const response = await fetch(localhost + "/api/jobs/text", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url: value }),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }

            const result = await response.json();
            setData(result); // Save response data
            navigate("/mapping", { state: { treeData: result } }); // Navigate to Tree page

        } catch (error) {
            console.error("Error submitting URL:", error.message);
            alert("Failed to submit the URL. Please try again.");
        }
        finally {
            setLoading(false)
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-blue-50">
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-gray-200 animate-spin"></div>
                    </div>
                    <h1 className="text-lg font-medium text-gray-700 animate-pulse">
                        Processing your request...
                    </h1>
                    <p className="text-sm text-gray-500">
                        Sit tight! Our AI is hard at work analyzing your submission. Estimated time is 30 seconds.
                    </p>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 items-center bg-gradient-to-br from-gray-100 to-blue-50 p-8">
            {/* Heading Section */}
            <div className="flex flex-col items-center justify-center space-y-8 text-center md:text-left">
                <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 drop-shadow-lg">
                    JobsAI
                </h1>
                <p className="text-lg text-gray-700 max-w-md mx-auto md:mx-0 leading-relaxed">
                    Transform job descriptions and links into actionable insights. Leverage the power of AI to analyze and generate study sheets tailored to your career goals.
                </p>
            </div>

            {/* Form Section */}
            <div className="w-full max-w-lg bg-white shadow-xl rounded-xl p-8 space-y-8 transform transition-all hover:scale-105 duration-300">
                {/* URL Submission Form */}
                <form onSubmit={handleSubmitLink} className="space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-800">Submit Job URL</h2>
                    <Input
                        type="text"
                        placeholder="Enter a valid job URL"
                        className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Job URL Input"
                    />
                    <Button type="submit" variant="default" className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300">
                        Analyze URL
                    </Button>
                </form>

                <div className="flex items-center justify-center text-gray-500 space-x-2">
                    <span className="text-sm">OR</span>
                </div>

                {/* Text Submission Form */}
                <form onSubmit={handleSubmitText} className="space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-800">Submit Job Description</h2>
                    <Textarea
                        placeholder="Paste the job description here..."
                        className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32"
                        aria-label="Job Description Input"
                    />
                    <Button type="submit" variant="default" className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300">
                        Analyze Description
                    </Button>
                </form>
            </div>
        </div>


    );
}
