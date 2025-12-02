import OpenAI from "openai";
const client = new OpenAI({ apiKey: "test" });
console.log("Client keys:", Object.keys(client).filter(k => k.includes("beta") || k.includes("vector") || k.includes("assistant")));
console.log("Has beta?", !!client.beta);
if (client.beta) {
  console.log("Beta keys:", Object.keys(client.beta));
}
