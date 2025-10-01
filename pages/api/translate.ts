import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { text, targetLang } = req.body;
  if (!text || !targetLang) {
    return res.status(400).json({ error: "Text and targetLang are required" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // hızlı ve ucuz model
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the user's text into ${targetLang}. Return only the translation.`,
        },
        { role: "user", content: text },
      ],
      temperature: 0,
    });

    const translatedText = completion.choices[0].message?.content || "";
    res.status(200).json({ translatedText });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || "Something went wrong" });
  }
}
