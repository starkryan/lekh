// Install OpenAI SDK first: `npm install openai`

import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
    baseURL: process.env.DEEPSEEK_BASE_URL,
    apiKey: process.env.DEEPSEEK_API_KEY
});


export async function POST(request: Request) {
    try {
        const { message, emailOptions = {} } = await request.json();

        if (!message) {
            return NextResponse.json(
                { error: "No message provided" },
                { status: 400 }
            );
        }

        const getLanguageInstructions = (language: string) => {
            const languageMap = {
              'english': {
                instruction: 'Respond in English',
                analysis: 'Provide analysis in English',
                style: 'Follow formal English writing style',
                defaultPrompt: 'Write a professional email to schedule a team meeting for project discussion'
              },
              'hindi': {
                instruction: 'पूरा ईमेल हिंदी में लिखें (देवनागरी लिपि का उपयोग करें)',
                analysis: 'विश्लेषण भी हिंदी में प्रदान करें',
                style: 'औपचारिक हिंदी लेखन शैली का पालन करें',
                defaultPrompt: 'कार्यालय में दिवाली समारोह के लिए एक निमंत्रण ईमेल लिखें'
              },
              'hinglish': {
                instruction: `Write in Hinglish (conversational Hindi written in Roman script mixed with English).
                Follow these Hinglish writing guidelines:
                1. Use Roman script for Hindi words (e.g., "aap", "namaste", "dhanyavaad")
                2. Mix Hindi and English naturally like spoken conversation
                3. Use common Hinglish greetings and phrases
                4. Keep formal words in English (e.g., "meeting", "deadline", "confirm")
                5. Cultural terms should be in Hindi (e.g., "pooja", "shubh", "namaste")
                
                Examples of good Hinglish:
                - "Meeting ke liye aapka bahut dhanyavaad"
                - "Deadline tak response zaroor bhej dein"
                - "Team ke sabhi members ko invite kiya hai"`,
                analysis: 'Analysis bhi Hinglish mein hi provide karein, mixing professional terms in English',
                style: 'Use natural conversational Hinglish tone',
                defaultPrompt: 'Office mein hone wali Diwali celebration ke liye ek invitation email likhiye'
              },
              'spanish': {
                instruction: 'Responder completamente en español',
                analysis: 'Proporcionar análisis en español',
                style: 'Seguir el estilo de escritura formal en español',
                defaultPrompt: 'Escribir un correo para invitar al equipo a una reunión de proyecto'
              },
              'french': {
                instruction: 'Répondre entièrement en français',
                analysis: 'Fournir une analyse en français',
                style: 'Suivre le style d\'écriture formel en français',
                defaultPrompt: 'Écrire un e-mail pour organiser une réunion d\'équipe'
              },
              'german': {
                instruction: 'Vollständig auf Deutsch antworten',
                analysis: 'Analyse auf Deutsch bereitstellen',
                style: 'Formellen deutschen Schreibstil befolgen',
                defaultPrompt: 'Schreiben Sie eine E-Mail, um ein Teammeeting zu planen'
              },
              'italian': {
                instruction: 'Rispondere completamente in italiano',
                analysis: 'Fornire analisi in italiano',
                style: 'Seguire lo stile di scrittura formale in italiano',
                defaultPrompt: 'Scrivere un\'email per organizzare una riunione di team'
              }
            };

            return languageMap[language as keyof typeof languageMap] || languageMap['english'];
        };



        const handleUserInput = (message: string) => {
            const greetings = ['hi', 'hello', 'hey', 'namaste', 'hola', 'bonjour', 'ciao'];
            const questions = ['what', 'how', 'why', 'can', 'could', 'help', '?'];
            
            if (greetings.some(g => message.toLowerCase().trim().includes(g.toLowerCase()))) {
                return 'greeting';
            }
            
            if (questions.some(q => message.toLowerCase().trim().includes(q.toLowerCase()))) {
                return 'question';
            }
            
            return 'email';
        };

        const getAssistantResponse = (language: 'english' | 'hindi' | 'hinglish', type: 'greeting' | 'question') => {
            const responses = {
                'english': {
                    greeting: `I notice you've sent a simple greeting. I'm your AI email assistant! I can help you with:

## Email Writing
1. "Write a professional email to schedule a team meeting"
2. "Send a thank you email to a client"
3. "Draft an email to request time off"

## General Questions
- Ask me how to write better emails
- Get help with email etiquette
- Learn about professional communication

Just tell me what you need help with!`,
                    question: `I'm here to help! I can assist you with:

## Email Writing Tasks
- Writing professional emails
- Crafting perfect subject lines
- Following email etiquette
- Using appropriate tone and style

## Language Support
- Write emails in multiple languages
- Get cultural context for international communication
- Translate email content

Just ask your question or describe what you need!`
                },
                'hindi': {
                    greeting: `मैं आपका AI सहायक हूं! मैं आपकी इन चीज़ों में मदद कर सकता हूं:

## ईमेल लेखन
1. "टीम मीटिंग के लिए प्रोफेशनल ईमेल लिखें"
2. "क्लाइंट को धन्यवाद ईमेल भेजें"
3. "छुट्टी के लिए ईमेल ड्राफ्ट करें"

## सामान्य प्रश्न
- बेहतर ईमेल कैसे लिखें
- ईमेल एटिकेट के बारे में जानें
- प्रोफेशनल कम्युनिकेशन सीखें

बताइए आपको किस तरह की मदद चाहिए!`,
                    question: `मैं आपकी मदद के लिए हाज़िर हूं! मैं इन चीज़ों में मदद कर सकता हूं:

## ईमेल लेखन कार्य
- प्रोफेशनल ईमेल लिखना
- परफेक्ट सब्जेक्ट लाइन बनाना
- ईमेल एटिकेट का पालन करना
- उचित टोन और स्टाइल का उपयोग

बस अपना सवाल पूछिए या बताइए आपको क्या चाहिए!`
                },
                'hinglish': {
                    greeting: `Main aapka AI assistant hun! Main aapki in cheezon mein help kar sakta hun:

## Email Writing
1. "Team meeting ke liye professional email likhein"
2. "Client ko thank you email bhejein"
3. "Leave ke liye email draft karein"

## General Questions
- Better emails kaise likhein
- Email etiquette ke bare mein janein
- Professional communication seekhein

Bas bataiye aapko kis type ki help chahiye!`,
                    question: `Main aapki help ke liye ready hun! Main in cheezon mein help kar sakta hun:

## Email Writing Tasks
- Professional emails likhna
- Perfect subject lines banana
- Email etiquette follow karna
- Sahi tone aur style use karna

Bas apna question puchiye ya bataiye aapko kya chahiye!`
                }
            };
            
            // Add similar translations for other languages...
            
            const defaultResponse = responses['english'][type] || responses['english']['greeting'];
            return responses[language]?.[type] || defaultResponse;
        };

        const inputType = handleUserInput(message);
        const systemPrompt = inputType !== 'email'
            ? getAssistantResponse(emailOptions.language || 'english', inputType as 'greeting' | 'question')
            : `You are a professional email writer. Write an email based on the user's request.
                ${getLanguageInstructions(emailOptions.language || 'english').instruction}

                Follow these guidelines:
                - Writing Style: ${getLanguageInstructions(emailOptions.language || 'english').style}
                - Email Style: ${emailOptions.style || 'Professional'}
                - Purpose: ${emailOptions.purpose || 'General'}
                - Target Age Group: ${emailOptions.ageGroup || 'Not specified'}
                ${emailOptions.recipientName ? `- Recipient Name: ${emailOptions.recipientName}` : ''}
                ${emailOptions.context ? `- Additional Context: ${emailOptions.context}` : ''}

                Format the response in markdown with the following sections:
                ## Subject
                [Write a concise subject line appropriate for the selected language]

                ## Email Content
                [Write the email content following the language-specific guidelines]

                ## Analysis
                ${getLanguageInstructions(emailOptions.language || 'english').analysis}
                Formality: [Indicate formality level]
                Purpose: [State the purpose]
                Key Points:
                - [List key points]
                `;

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
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });
    } catch (error: any) {
        console.error("Error in email generation:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate email" },
            { status: 500 }
        );
    }
}
