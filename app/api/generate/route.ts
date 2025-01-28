import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
    baseURL: process.env.DEEPSEEK_BASE_URL,
    apiKey: process.env.DEEPSEEK_API_KEY
});

const SYSTEM_PROMPTS = {
    email: `You are an expert email writer. Write professional, concise, and effective emails based on the user's requirements.
The email should match the following parameters:
- Style: {style} (e.g., Professional, Casual, Formal)
- Purpose: {purpose} (e.g., Business, Personal, Academic)
- Recipient Age Group: {ageGroup} (if specified)
- Recipient Name: {recipientName}
- Additional Context: {context}

Format the response in markdown with the following structure:

## Subject
[Clear and concise subject line]

## Email Content
Dear {recipientName},

[Professional email content with proper body paragraphs]

[Appropriate closing],
[Your name/signature]

## Tone Analysis
- Formality: [Formal/Semi-formal/Casual]
- Purpose: [Main objective of the email]
- Key Points:
  - [Key point 1]
  - [Key point 2]
  - [Additional key points]

## Email Details
- To: {recipientName}
- Style Used: {style}
- Purpose: {purpose}
- Target Age Group: {ageGroup}`,

    youtube: `You are an expert YouTube script writer. Create engaging, well-structured video scripts based on the user's requirements.
The video should match the following parameters:
- Video Type: {videoType} (e.g., Tutorial, Review, Vlog)
- Target Audience: {targetAudience}
- Content Style: {contentStyle}
- Duration: {duration}
- Platform: {platform}
- Tone Style: {toneStyle}
- Additional Context: {context}

IMPORTANT: Strictly adhere to the specified duration:
- Short (1 min): Keep total script length to 150-175 words
- Medium (1-5 mins): Keep total script length to 750-875 words
- Long (5-10 mins): Keep total script length to 1500-1750 words
- Extended (10+ mins): Keep total script length to 2250-2500 words

Format the response in markdown with the following structure:

## Video Title
[Catchy, SEO-friendly title]

## Script Duration
Total Duration: {duration}
Estimated Word Count: [Word count]

## Script Structure
[Divide the script into appropriate sections based on duration]

## Introduction ({introTime})
[Hook and brief introduction]

## Main Content
[Content sections with timestamps]

## Conclusion ({outroTime})
[Call to action and wrap-up]

## Video Description
[YouTube description with timestamps and links]

## Tags
[Relevant hashtags and keywords]

## Script Analysis
- Target Audience: {targetAudience}
- Content Style: {contentStyle}
- Tone: {toneStyle}
- Key Moments:
  - [Timestamp] [Key moment 1]
  - [Timestamp] [Key moment 2]`,

    default: "You are a helpful assistant."
};

type SystemPromptKey = keyof typeof SYSTEM_PROMPTS;

function isSystemPromptKey(key: string): key is SystemPromptKey {
    return Object.keys(SYSTEM_PROMPTS).includes(key);
}

interface RequestBody {
    message: string;
    type?: string;
    emailOptions?: {
        style?: string;
        purpose?: string;
        ageGroup?: string;
        recipientName?: string;
        context?: string;
    };
    youtubeOptions?: {
        videoType?: string;
        targetAudience?: string;
        contentStyle?: string;
        duration?: string;
        platform?: string;
        toneStyle?: string;
        context?: string;
    };
}

export async function POST(request: Request) {
    try {
        const body = await request.json() as RequestBody;

        if (!body.message) {
            return NextResponse.json(
                { error: "Message is required." },
                { status: 400 }
            );
        }

        // Validate and determine prompt type
        const promptType = body.type && isSystemPromptKey(body.type) 
            ? body.type 
            : 'default';

        let systemPrompt = SYSTEM_PROMPTS[promptType];

        // Handle email parameters
        if (promptType === 'email' && body.emailOptions) {
            const recipientName = body.emailOptions.recipientName?.trim() || 'Valued Recipient';
            systemPrompt = systemPrompt
                .replace(/{style}/g, body.emailOptions.style || 'Professional')
                .replace(/{purpose}/g, body.emailOptions.purpose || 'Business')
                .replace(/{ageGroup}/g, body.emailOptions.ageGroup || 'Adult')
                .replace(/{recipientName}/g, recipientName)
                .replace(/{context}/g, body.emailOptions.context || 'Standard communication');
        }

        // Handle YouTube parameters
        if (promptType === 'youtube' && body.youtubeOptions) {
            const { 
                videoType = 'Tutorial',
                targetAudience = 'General',
                contentStyle = 'Informative',
                duration = 'Medium',
                platform = 'YouTube',
                toneStyle = 'Casual',
                context = ''
            } = body.youtubeOptions;

            let introTime, outroTime;
            switch(duration.toLowerCase()) {
                case 'short':
                    introTime = '0:00-0:10';
                    outroTime = '0:50-1:00';
                    break;
                case 'medium':
                    introTime = '0:00-0:30';
                    outroTime = 'Last 30 seconds';
                    break;
                case 'long':
                    introTime = '0:00-1:00';
                    outroTime = 'Last 1 minute';
                    break;
                case 'extended':
                    introTime = '0:00-1:30';
                    outroTime = 'Last 1-2 minutes';
                    break;
                default:
                    introTime = '0:00-0:30';
                    outroTime = 'Last 30 seconds';
            }

            systemPrompt = systemPrompt
                .replace(/{videoType}/g, videoType)
                .replace(/{targetAudience}/g, targetAudience)
                .replace(/{contentStyle}/g, contentStyle)
                .replace(/{duration}/g, duration)
                .replace(/{platform}/g, platform)
                .replace(/{toneStyle}/g, toneStyle)
                .replace(/{context}/g, context)
                .replace(/{introTime}/g, introTime)
                .replace(/{outroTime}/g, outroTime);
        }

        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: body.message }
            ],
            model: "deepseek-chat",
            stream: true
        });

        const encoder = new TextEncoder();

        const stream = new ReadableStream({
            async start(controller) {
                let isStreamClosed = false;

                const closeStream = () => {
                    if (!isStreamClosed) {
                        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
                        controller.close();
                        isStreamClosed = true;
                    }
                };

                try {
                    for await (const chunk of completion) {
                        if (isStreamClosed) break;
                        
                        const content = chunk.choices[0]?.delta?.content || '';
                        if (content) {
                            controller.enqueue(encoder.encode(
                                `data: ${JSON.stringify({ content })}\n\n`
                            ));
                        }
                    }
                    closeStream();
                } catch (error) {
                    console.error("Stream error:", error);
                    if (!isStreamClosed) {
                        controller.error(error);
                    }
                }
            }
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache, no-transform",
                "Connection": "keep-alive"
            }
        });
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json(
            { error: "Failed to generate response. Please try again." },
            { status: 500 }
        );
    }
}