
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function MoreInfo() {
    const location = useLocation();
    const name = location.state || '';
    const localhost = "http://127.0.0.1:5000";
    const navigate = useNavigate();

    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getData = async () => {
            try {
                setLoading(true);
                const response = await fetch(localhost + "/api/moreinfo", {
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

    // useEffect(() => {
    //     setInfo(example);
    //     setLoading(false);
    // }, []);



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

            {error && <p className="text-xl text-red-600 mb-6">{error}</p>}
            {info && (
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900">{info.topic}</h1>
                    <p className="text-md text-gray-700 mt-3 mb-6">{info.summary}</p>
                    {info.sections.map(renderSection)}
                </div>
            )}
        </div>

    );
}


const example = {
    "topic": "Software Development Fundamentals: Software Development Lifecycle (SDLC) Methodologies (Agile, Waterfall)",
    "summary": "This cram sheet covers the key differences and similarities between Waterfall and Agile SDLC methodologies, focusing on their core principles, terminology, and practical applications.",
    "sections": [
        {
            "heading": "Key Concepts",
            "points": [
                {
                    "point": "Overview: SDLC methodologies define the structured process for planning, creating, testing, and deploying software.  Waterfall and Agile are two prominent approaches."
                },
                {
                    "point": "Fundamental Principles: Waterfall emphasizes sequential phases; Agile prioritizes iterative development, collaboration, and flexibility."
                }
            ]
        },
        {
            "heading": "Important Terminology",
            "points": [
                {
                    "term": "Waterfall",
                    "definition": "A linear, sequential approach where each phase must be completed before the next begins.  Changes are difficult and costly to implement."
                },
                {
                    "term": "Agile",
                    "definition": "An iterative and incremental approach emphasizing flexibility, collaboration, and continuous improvement.  It involves short development cycles (sprints) and frequent feedback."
                },
                {
                    "term": "Sprint",
                    "definition": "A short, time-boxed iteration in Agile development, typically 2-4 weeks."
                },
                {
                    "term": "Scrum",
                    "definition": "A specific Agile framework using sprints, daily stand-ups, sprint reviews, and retrospectives."
                },
                {
                    "term": "Requirements Gathering",
                    "definition": "The process of defining the functionalities and features of a software project."
                },
                {
                    "term": "Testing",
                    "definition": "The process of verifying that the software meets the specified requirements and functions correctly."
                },
                {
                    "term": "Deployment",
                    "definition": "The process of releasing the software to end-users."
                },
                {
                    "term": "Backlog",
                    "definition": "An ordered list of features or tasks to be implemented in an Agile project."
                },
                {
                    "term": "Daily Stand-up",
                    "definition": "A short daily meeting in Scrum where team members discuss progress and obstacles."
                }
            ]
        },
        {
            "heading": "Syntax and Structure",
            "points": [
                {
                    "point": "Waterfall:  Requirements -> Design -> Implementation -> Testing -> Deployment -> Maintenance"
                },
                {
                    "point": "Agile: Iterative cycles of Planning -> Design -> Development -> Testing -> Review -> Retrospective (repeated until project completion)"
                }
            ]
        },
        {
            "heading": "Common Techniques or Methods",
            "points": [
                {
                    "technique": "Waterfall",
                    "description": "Sequential phases, detailed documentation upfront.",
                    "example": "Building a large-scale, fixed-scope infrastructure project"
                },
                {
                    "technique": "Agile (Scrum)",
                    "description": "Short iterations, daily stand-ups, sprint reviews.",
                    "example": "Developing a mobile app with evolving requirements"
                }
            ]
        },
        {
            "heading": "Best Practices",
            "points": [
                {
                    "point": "Waterfall: Thorough requirements analysis, detailed documentation, clear communication."
                },
                {
                    "point": "Agile: Embrace change, prioritize collaboration, focus on delivering working software frequently, conduct thorough retrospectives."
                }
            ]
        },
        {
            "heading": "Use Cases/Applications",
            "points": [
                {
                    "use_case": "Waterfall",
                    "details": "Suitable for projects with well-defined requirements, minimal anticipated changes, and where a rigid structure is beneficial."
                },
                {
                    "use_case": "Agile",
                    "details": "Best for projects with evolving requirements, requiring frequent feedback, needing quick iterations and adaptation."
                }
            ]
        },
        {
            "heading": "Resources for Further Study",
            "points": [
                {
                    "resource": "Agile Manifesto",
                    "link": "https://agilemanifesto.org/"
                },
                {
                    "resource": "Scrum Guide",
                    "link": "https://scrumguides.org/"
                },
                {
                    "resource": "Udemy/Coursera Agile courses",
                    "link": "Search for \"Agile\" or \"Scrum\" on Udemy or Coursera"
                }
            ]
        },
        {
            "heading": "Examples",
            "examples": [
                {
                    "example_1": "Waterfall: Building a bridge - the steps are largely predetermined and changes are costly."
                },
                {
                    "example_2": "Agile: Developing a social media app - user feedback is essential and features may evolve during development."
                },
                {
                    "example_3": "Agile: Developing a social media app - user feedback is essential and features may evolve during development."
                }
            ]
        },
        {
            "heading": "Additional Notes",
            "points": [
                {
                    "point": "Hybrid approaches combining elements of both Waterfall and Agile are common in practice.  The choice of methodology depends on project specifics and organizational context."
                }
            ]
        }
    ]
}