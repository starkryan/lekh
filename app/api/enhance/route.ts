import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_BASE_URL
})

export async function POST(req: Request) {
  try {
    const { prompt, type } = await req.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    const systemPrompt = type === 'email' 
      ? "You are an AI assistant that helps improve text. Your task is to enhance the user's input by making it more descriptive and detailed. Do NOT write an email or add any formatting. Simply improve the text while keeping its original meaning. Example: If user writes 'meeting tomorrow', you might enhance it to 'discuss quarterly sales targets and team performance in tomorrow's 2-hour meeting'. Keep it natural and concise."
      : "You are an AI assistant that helps improve text. Your task is to enhance the user's input by making it more descriptive and detailed. Do NOT write a script or add any formatting. Simply improve the text while keeping its original meaning. Example: If user writes 'video about cooking pasta', you might enhance it to 'demonstrate easy Italian pasta cooking techniques for beginners, including sauce preparation and plating tips'. Keep it natural and concise."

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `Enhance this text by adding more details while keeping it natural: "${prompt}"`
        }
      ],
      temperature: 0.7,
      max_tokens: 200,
    })

    let enhancedPrompt = completion.choices[0].message.content?.trim()

    if (!enhancedPrompt) {
      throw new Error('Failed to enhance text')
    }

    // Remove any formatting or special characters that might have been added
    enhancedPrompt = enhancedPrompt
      .replace(/^["']|["']$/g, '') // Remove quotes
      .replace(/^(Subject|Title|Email|Content):.*/gi, '') // Remove any email-like formatting
      .replace(/^[-*•]/g, '') // Remove list markers
      .trim()

    return NextResponse.json({ enhancedPrompt })
  } catch (error) {
    console.error('Error in enhance route:', error)
    return NextResponse.json(
      { error: 'Failed to enhance text' },
      { status: 500 }
    )
  }
}
