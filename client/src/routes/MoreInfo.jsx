import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { use } from "react";
import { backendhost } from "@/lib/utils";


export default function MoreInfo() {
    const location = useLocation();
    const name = location.state || '';

    const backendhost = "http://127.0.0.1:5000";
    const navigate = useNavigate();


    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0); // Track the current section index
    const [isComprehensiveView, setIsComprehensiveView] = useState(false);


    useEffect(() => {
        const getData = async () => {
            try {
                setLoading(true);
                const response = await fetch(backendhost + "/api/moreinfo", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ name })
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch data");
                }

                const data = await response.json();
                console.log(data); // Log response to debug
                setInfo(data); // Adjust based on API response
            } catch (error) {
                console.error("Error fetching data:", error.message);
                setError("Failed to fetch the data. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        getData();
    }, [name]);

    const handlePrevious = () => {
        setCurrentSectionIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    };

    const handleNext = () => {
        setCurrentSectionIndex((prevIndex) =>
            info && prevIndex < info.sections.length - 1 ? prevIndex + 1 : prevIndex
        );
    };


    const handlePreviousPage = () => {
        navigate(-1);
    };

    const handleNextPage = () => {
        navigate(1);
    };

    const handleSwitchChange = () => {
        console.log("Switching view");
        setIsComprehensiveView(prev => !prev);
    };

    const renderSection = (section) => (
        <div key={section.heading} className="my-8">
            <h2 className="text-2xl font-semibold text-gray-900">{section.heading}</h2>
            {section.points && (
                <ul className="list-disc pl-6 mt-6 space-y-3 text-lg text-gray-800">
                    {section.points.map((point, idx) => (
                        <ul key={idx} className="hover:bg-gray-100 p-2 rounded-lg transition-all duration-300 ease-in-out">
                            {/* Check for 'term' and 'definition' */}
                            {point.term && point.definition ? (
                                <span>
                                    <span className="font-medium text-indigo-600">{point.term}: </span>
                                    <span className="text-gray-700">{point.definition}</span>
                                </span>

                            ) :
                                // Check for 'technique', 'description', and 'example'
                                point.technique && point.description && point.example ? (
                                    <span>
                                        <strong className="text-blue-600">{point.technique}</strong>: {point.description}<br />
                                        <em className="text-sm text-gray-500">Example: {point.example}</em>
                                    </span>
                                ) : point.use_case && point.details ? (
                                    <span>
                                        <span className="font-medium text-teal-600">{point.use_case}: </span>
                                        <span className="text-gray-700">{point.details}</span>
                                    </span>
                                ) : point.resource && point.link ? (
                                    <span>
                                        <span className="text-gray-700">{point.resource} - </span>
                                        <a href={point.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-all duration-200">
                                            {point.link}
                                        </a>
                                    </span>
                                ) : point.point ? (
                                    <span className='text-md text-gray-700'>
                                        {point.point}
                                    </span>
                                ) :
                                    (
                                        <span className="italic text-gray-400">Information is incomplete or not recognized</span>
                                    )}
                        </ul>
                    ))}
                </ul>
            )}
            {section.examples && (
                <ul className="list-decimal pl-6 mt-6 space-y-3 text-lg text-gray-700">
                    {section.examples.map((example, idx) => (
                        <ul key={idx} className="hover:bg-gray-100 p-2 rounded-lg transition-all duration-300 ease-in-out">
                            {/* Dynamically iterate over the properties of the example object */}
                            {Object.keys(example).map((key) => (
                                key.startsWith("example") && example[key] ? (
                                    <div key={key}>
                                        <span className="font-semibold">Example {idx + 1}: </span>
                                        <span>{example[key]}</span>
                                    </div>
                                ) : null
                            ))}
                        </ul>
                    ))}
                </ul>
            )}
            {section.resources && (
                <ul className="mt-6 space-y-3">
                    {section.resources.map((resource, idx) => (
                        <ul key={idx} className="text-blue-600 hover:text-blue-800 transition-all duration-200">
                            <a href={resource.link} target="_blank" rel="noopener noreferrer">
                                {resource.resource}
                            </a>
                        </ul>
                    ))}
                </ul>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-blue-50">
                <div className="flex flex-col items-center space-y-6 animate-fadeIn">
                    <div className="relative w-20 h-20">
                        <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-gray-200 animate-spin"></div>
                    </div>
                    <h1 className="text-2xl font-medium text-gray-700 animate-pulse">Converting {name} to a Cram Sheet</h1>
                    <p className="text-sm text-gray-500 text-center max-w-xs">
                        Sit tight! Our AI is hard at work analyzing your submission. Estimated time is 10 - 30 seconds.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-10">
            {/* Go Back Button */}
            <Button onClick={() => navigate(-1)} type="submit" variant="default" className="mb-6 inline-flex items-center justify-center px-6 py-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300">
                <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Go Back
            </Button>



            <div>
                <div className="flex justify-center space-x-2 mb-6">
                    <Switch
                        id="comprehensive-view-switch"
                        onCheckedChange={handleSwitchChange}
                    />
                    <Label htmlFor="comprehensive-view-switch">Comprehensive View</Label>

                </div>




                {info && isComprehensiveView && (
                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto">
                        <h1 className="text-3xl font-bold text-gray-900">{info.topic}</h1>
                        <p className="text-md text-gray-700 mt-3 mb-6">{info.summary}</p>
                        {info.sections.map(renderSection)}
                    </div>
                )}


                {info && !isComprehensiveView && (
                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto">
                        <h1 className="text-3xl font-bold text-gray-900">{info.topic}</h1>
                        <p className="text-md text-gray-700 mt-3 mb-6">{info.summary}</p>
                        {/* Render current section */}
                        {renderSection(info.sections[currentSectionIndex])}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-6">
                            <Button onClick={handlePrevious} disabled={currentSectionIndex === 0} variant="outline" className="px-4 py-2 text-gray-700 hover:text-white hover:bg-indigo-600 transition-all duration-300">
                                Previous
                            </Button>
                            <Button onClick={handleNext} disabled={currentSectionIndex === info.sections.length - 1} variant="outline" className="px-4 py-2 text-gray-700 hover:text-white hover:bg-indigo-600 transition-all duration-300">
                                Next
                            </Button>
                        </div>
                    </div>
                )}

            </div>




        </div>
    );
}
