import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Landing() {
    const [data, setData] = useState(null); // Store API response data
    const navigate = useNavigate();

    const isValidURL = (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    const localhost = "http://127.0.0.1:5000";

    const handleSubmit = async (e) => {
        e.preventDefault();
        const value = e.target[0].value;

        // Validate URL
        if (!isValidURL(value)) {
            alert("Please enter a valid URL");
            return;
        }

        try {
            // Send POST request to backend
            const response = await fetch(localhost + "/api/jobs", {
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
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
                <input
                    type="text"
                    placeholder="Enter a valid job URL"
                    className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button type="submit" variant="default">
                    Submit
                </Button>
            </form>
        </div>
    );
}
