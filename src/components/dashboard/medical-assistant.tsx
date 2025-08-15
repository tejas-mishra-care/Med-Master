'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, User, BrainCircuit, Send } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  disclaimer?: string;
}

type GetMedicalExplanationOutput = {
  answer: string;
  sources: string[];
  tokens_used: number;
  disclaimer: string;
};

export default function MedicalAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/medical-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `Request failed with ${res.status}`);
      }
      const assistantResponse: GetMedicalExplanationOutput = await res.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: assistantResponse.answer,
        sources: assistantResponse.sources,
        disclaimer: assistantResponse.disclaimer,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError('Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-[calc(100vh-8rem)] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className='flex items-center gap-2'>
          <BrainCircuit className="w-6 h-6 text-primary" />
          <CardTitle className="font-headline">AI Medical Assistant</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.length === 0 && !isLoading && (
              <div className="text-center p-8">
                <h2 className="text-2xl font-bold mb-2">Your AI Medical Assistant</h2>
                <p className="text-muted-foreground mb-6">Ask me anything about medical conditions, treatments, or drugs.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" onClick={() => setInput('What are the symptoms of diabetes?')}>What are the symptoms of diabetes?</Button>
                  <Button variant="outline" onClick={() => setInput('Explain the side effects of metformin.')}>Explain the side effects of metformin.</Button>
                  <Button variant="outline" onClick={() => setInput('What is the treatment for a common cold?')}>What is the treatment for a common cold?</Button>
                  <Button variant="outline" onClick={() => setInput('Summarize the latest research on Alzheimer\'s.')}>Summarize the latest research on Alzheimer's.</Button>
                </div>
              </div>
            )}
            {messages.map((message, index) => (
              <div key={index} className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role === 'assistant' && <Bot className="w-8 h-8 text-primary flex-shrink-0" />}
                <div
                  className={`rounded-lg p-3 max-w-lg ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                   {message.sources && message.sources.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-xs font-bold mb-1">Sources:</h4>
                      <ul className="list-disc list-inside text-xs">
                        {message.sources.map((source, i) => (
                          <li key={i}><a href={source} target="_blank" rel="noopener noreferrer" className="underline">{source}</a></li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {message.disclaimer && <p className="text-xs mt-2 italic">{message.disclaimer}</p>}
                </div>
                {message.role === 'user' && <User className="w-8 h-8 flex-shrink-0" />}
              </div>
            ))}
             {isLoading && (
                <div className="flex items-start gap-4">
                  <Bot className="w-8 h-8 text-primary flex-shrink-0" />
                  <div className="rounded-lg p-3 bg-muted flex items-center space-x-2">
                    <span className="h-2 w-2 bg-primary rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-primary rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-primary rounded-full animate-pulse"></span>
                  </div>
                </div>
            )}
            {error && (
               <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
          </div>
        </ScrollArea>
        <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t pt-4">
          <Input
            id="medical-assistant-input"
            name="medical-assistant-input"
            aria-label="Ask medical assistant"
            value={input}
            onChange={handleInputChange}
            placeholder="Ask a medical question..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading} className="gap-2">
            Send
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
