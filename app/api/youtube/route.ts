import OpenAI from "openai";
import { NextResponse } from "next/server";
import { ReadableStream } from "web-streams-polyfill";
import { TextEncoder } from "util";

// Define types for better type safety
type YoutubeOptions = {
    language?: string;
    videoType?: string;
    targetAudience?: string;
    contentStyle?: string;
    duration?: string;
    platform?: string;
    toneStyle?: string;
    context?: string;
};

type RequestBody = {
    message: string;
    youtubeOptions: YoutubeOptions;
};

type SupportedLanguage = 'english' | 'hindi' | 'hinglish';

const openai = new OpenAI({
    baseURL: process.env.DEEPSEEK_BASE_URL,
    apiKey: process.env.DEEPSEEK_API_KEY
});

const handleUserInput = (message: string) => {
    // Language-specific greetings
    const greetings = {
        english: ['hi', 'hello', 'hey', 'hola', 'bonjour', 'ciao'],
        hindi: ['नमस्ते', 'नमस्कार', 'प्रणाम'],
        hinglish: ['namaste', 'namaskar', 'pranaam', 'hii', 'hey', 'hello']
    } as const;
    
    // Language-specific question words
    const questions = {
        english: ['what', 'how', 'why', 'can', 'could', 'help', '?'],
        hindi: ['क्या', 'कैसे', 'क्यों', 'कब', 'कहाँ', 'मदद', '?'],
        hinglish: ['kya', 'kaise', 'kyun', 'kab', 'kahan', 'help', 'madad', '?']
    } as const;
    
    // Language-specific script keywords
    const scriptKeywords = {
        english: ['script', 'video', 'youtube', 'content'],
        hindi: ['स्क्रिप्ट', 'वीडियो', 'यूट्यूब', 'कंटेंट', 'कॉन्टेंट'],
        hinglish: ['script', 'video', 'youtube', 'content', 'likhna', 'banao']
    } as const;

    const msg = message.toLowerCase().trim();
    
    // Detect message language
    const detectLanguage = (text: string): SupportedLanguage => {
        // Check for Devanagari script (Hindi)
        if (/[\u0900-\u097F]/.test(text)) {
            return 'hindi';
        }
        
        // Check for Hinglish patterns
        const hinglishPatterns = ['kya', 'kaise', 'kyun', 'hai', 'hain', 'ko', 'ka', 'ki', 'ke'];
        if (hinglishPatterns.some(pattern => text.includes(pattern))) {
            return 'hinglish';
        }
        
        return 'english';
    };

    const messageLanguage = detectLanguage(msg);
    
    // Check for greetings, questions, and script keywords in the detected language
    if (greetings[messageLanguage].some(g => msg.includes(g))) {
        return { type: 'greeting' as const, language: messageLanguage };
    }
    
    if (questions[messageLanguage].some(q => msg.includes(q))) {
        return { type: 'question' as const, language: messageLanguage };
    }

    if (scriptKeywords[messageLanguage].some(k => msg.includes(k))) {
        return { type: 'script' as const, language: messageLanguage };
    }
    
    return { type: 'general' as const, language: messageLanguage };
};

const getLanguageInstructions = (language: string) => {
    const languageMap = {
        'english': {
            instruction: 'Write the script in English',
            titleNote: 'Create an engaging English title',
            descNote: 'Write description in English',
            defaultPrompt: 'Create an engaging tutorial video script about productivity tips'
        },
        'hindi': {
            instruction: 'स्क्रिप्ट को पूरी तरह से हिंदी में लिखें (देवनागरी लिपि का उपयोग करें)',
            titleNote: 'आकर्षक हिंदी शीर्षक बनाएं',
            descNote: 'विवरण हिंदी में लिखें',
            defaultPrompt: 'प्रोडक्टिविटी टिप्स पर एक आकर्षक ट्यूटोरियल वीडियो स्क्रिप्ट बनाएं'
        },
        'hinglish': {
            instruction: 'Script ko Hinglish mein likhein (Hindi + English ka natural mix)',
            titleNote: 'Attractive Hinglish title banayein',
            descNote: 'Description Hinglish mein likhein',
            defaultPrompt: 'Productivity tips ke liye ek engaging tutorial video script banayein'
        }
    } as const;

    return languageMap[language as keyof typeof languageMap] || languageMap['english'];
};

type ResponseType = 'greeting' | 'question' | 'general';

interface LanguageResponse {
    greeting: string;
    question: string;
    general: string;
}

interface ResponseMap {
    [key: string]: LanguageResponse;
}

const responses: ResponseMap = {
    'english': {
        greeting: `Hi! I'm your YouTube script assistant. I can help you create amazing video content!

## What I Can Do
1. Write scripts for various video types:
   - Tutorials and How-tos
   - Reviews and Comparisons
   - Vlogs and Stories
   - Educational Content

## Script Features
- Engaging hooks and intros
- Clear section transitions
- Call-to-action suggestions
- SEO-optimized descriptions

Just tell me what type of video you want to create!`,
        question: `I can help you with all aspects of YouTube script writing:

## Script Writing Help
- Creating engaging introductions
- Structuring your content
- Writing compelling calls-to-action
- Optimizing for different video lengths
- Crafting clickable titles

What would you like to know more about?`,
        general: `Let me help you create a great YouTube script! Here are some popular formats:

1. Tutorial: "How to [solve a problem] in [X] minutes"
2. Review: "Honest review of [product/service]"
3. Vlog: "A day in the life of [profession/activity]"

Tell me your video idea and I'll help craft the perfect script!`
    },
    'hindi': {
        greeting: `नमस्ते! मैं आपका YouTube स्क्रिप्ट असिस्टेंट हूं। मैं शानदार वीडियो कंटेंट बनाने में आपकी मदद कर सकता हूं!

## मैं क्या कर सकता हूं
1. विभिन्न प्रकार की वीडियो के लिए स्क्रिप्ट:
   - ट्यूटोरियल और हाउ-टू
   - रिव्यू और तुलना
   - व्लॉग और कहानियां
   - शैक्षिक कंटेंट

बताइए आप किस तरह की वीडियो बनाना चाहते हैं!`,
        question: `मैं YouTube स्क्रिप्ट लेखन के सभी पहलुओं में आपकी मदद कर सकता हूं:

## स्क्रिप्ट लेखन सहायता
- आकर्षक परिचय लिखना
- कंटेंट स्ट्रक्चरिंग
- प्रभावशाली कॉल-टू-एक्शन

आप किस बारे में और जानना चाहेंगे?`,
        general: `मैं आपको एक बेहतरीन YouTube स्क्रिप्ट बनाने में मदद करूं! कुछ लोकप्रिय फॉर्मेट:

1. ट्यूटोरियल: "[समस्या] को [X] मिनट में कैसे हल करें"
2. रिव्यू: "[प्रोडक्ट/सर्विस] की समीक्षा"
3. व्लॉग: "[प्रोफेशन/एक्टिविटी] का एक दिन"`
    },
    'hinglish': {
        greeting: `Hello! Main aapka YouTube script assistant hun. Main amazing video content create karne mein help kar sakta hun!

## Main Kya Kar Sakta Hun
1. Different types ki videos ke liye scripts:
   - Tutorials aur How-tos
   - Reviews aur Comparisons
   - Vlogs aur Stories
   - Educational Content

Batao aap kis type ki video banana chahte ho!`,
        question: `Main YouTube script writing ke har aspect mein help kar sakta hun:

## Script Writing Help
- Engaging introductions create karna
- Content ko structure karna
- Calls-to-action likhna

Aap kiske bare mein aur janna chahenge?`,
        general: `Main aapko ek great YouTube script banane mein help karta hun! Yeh hain kuch popular formats:

1. Tutorial: "[problem] ko [X] minutes mein kaise solve karein"
2. Review: "[product/service] ka review"
3. Vlog: "[profession/activity] ka ek din"`
    }
};

const getAssistantResponse = (language: string, type: string) => {
    const defaultResponse = responses['english'][type as ResponseType] || responses['english']['greeting'];
    return responses[language as keyof typeof responses]?.[type as ResponseType] || defaultResponse;
};

export async function POST(request: Request) {
    try {
        // Check for internet connectivity with a timeout
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
            
            await fetch('https://www.google.com/favicon.ico', { 
                mode: 'no-cors',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
        } catch (connectError) {
            const isAborted = connectError instanceof Error && 
                            connectError.name === 'AbortError';
            
            return NextResponse.json(
                { 
                    error: isAborted 
                        ? "Connection is very slow. Please check your internet speed and try again."
                        : "Unable to connect. Please check if you're connected to the internet.",
                    code: isAborted ? "SLOW_CONNECTION" : "NO_INTERNET",
                    friendly: true
                },
                { status: 503 }
            );
        }

        let body: RequestBody;
        try {
            body = await request.json();
        } catch (parseError) {
            return NextResponse.json(
                { 
                    error: "We couldn't process your request. Please try again.",
                    code: "INVALID_REQUEST",
                    friendly: true
                },
                { status: 400 }
            );
        }

        const { message, youtubeOptions = {} } = body;

        if (!message) {
            const defaultPrompt = getLanguageInstructions(youtubeOptions?.language || 'english').defaultPrompt;
            return NextResponse.json(
                { defaultPrompt },
                { status: 200 }
            );
        }

        if (!youtubeOptions?.language) {
            return NextResponse.json(
                { 
                    error: "Please select your preferred language before continuing.",
                    code: "LANGUAGE_REQUIRED",
                    friendly: true
                },
                { status: 400 }
            );
        }

        const { type: inputType, language: detectedLanguage } = handleUserInput(message);
        
        // Use detected language if it matches the supported languages, otherwise use the specified language
        const supportedLanguages = ['hindi', 'hinglish', 'english'] as const;
        const responseLanguage = supportedLanguages.includes(detectedLanguage as typeof supportedLanguages[number]) 
            ? detectedLanguage 
            : youtubeOptions.language;

        const systemPrompt = inputType !== 'script'
            ? getAssistantResponse(responseLanguage, inputType)
            : `You are a professional YouTube script writer. Write a script based on the user's request.
                ${getLanguageInstructions(responseLanguage).instruction}

                Follow these guidelines:
                - Video Type: ${youtubeOptions?.videoType || "tutorial"}
                - Target Audience: ${youtubeOptions?.targetAudience || "general"}
                - Content Style: ${youtubeOptions?.contentStyle || "informative"}
                - Duration: ${youtubeOptions?.duration || "medium"}
                - Platform: ${youtubeOptions?.platform || "YouTube"}
                - Tone: ${youtubeOptions?.toneStyle || "casual"}
                ${youtubeOptions.context ? `- Additional Context: ${youtubeOptions.context}` : ''}

                Format the response in markdown with the following sections:
                ## Title
                ${getLanguageInstructions(responseLanguage).titleNote}
                [Create a catchy, SEO-friendly title]

                ## Hook (First ${youtubeOptions?.duration === 'short' ? '10' : '30'} seconds)
                [Write an attention-grabbing opening]

                ## Script
                [Write the main script content with clear section markers]
                - [Intro]
                - [Main Points]
                - [Examples/Demonstrations]
                - [Call to Action]
                - [Outro]

                ## Description
                ${getLanguageInstructions(responseLanguage).descNote}
                [Write an SEO-optimized description with timestamps]

                ## Tags
                [Include relevant tags in both selected language and English]

                ## Thumbnail Ideas
                [Suggest 2-3 thumbnail concepts that would work well]`;

        try {
            const response = await openai.chat.completions.create({
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message }
                ],
                stream: true,
                temperature: 0.7,
                max_tokens: 2000,
            });

            const stream = new ReadableStream({
                async start(controller) {
                    try {
                        for await (const chunk of response) {
                            const content = chunk.choices[0]?.delta?.content || "";
                            if (content) {
                                controller.enqueue(
                                    new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`)
                                );
                            }
                        }
                        controller.enqueue(
                            new TextEncoder().encode("data: [DONE]\n\n")
                        );
                        controller.close();
                    } catch (streamError) {
                        console.error("Stream processing error:", streamError);
                        controller.error(new Error("Failed to process response stream. Please try again."));
                    }
                },
            });

            return new Response(stream, {
                headers: {
                    "Content-Type": "text/event-stream",
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                },
            });
        } catch (apiError: any) {
            console.error("API error:", apiError);
            let errorMessage = "";
            let errorCode = "API_ERROR";

            if (apiError.status === 429) {
                errorMessage = "We're getting a lot of requests right now. Please try again in a minute.";
                errorCode = "RATE_LIMIT";
            } else if (apiError.status === 401 || apiError.status === 403) {
                errorMessage = "We're having trouble connecting to our services. Please try again.";
                errorCode = "AUTH_ERROR";
            } else if (apiError.status >= 500) {
                errorMessage = "We're doing some quick maintenance. Please try again in a minute.";
                errorCode = "SERVER_ERROR";
            } else if (apiError.code === 'ECONNABORTED') {
                errorMessage = "The connection is taking too long. Please check your internet.";
                errorCode = "TIMEOUT";
            } else {
                errorMessage = "Something's not working right now. Please try again in a moment.";
            }

            return NextResponse.json(
                { 
                    error: errorMessage, 
                    code: errorCode,
                    friendly: true
                },
                { status: apiError.status || 500 }
            );
        }
    } catch (error: any) {
        console.error("General error in YouTube script generation:", error);
        return NextResponse.json(
            { 
                error: "We ran into a problem. Please try again in a moment.",
                code: "UNKNOWN_ERROR",
                friendly: true
            },
            { status: 500 }
        );
    }
}
