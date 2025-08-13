'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, User, BrainCircuit } from 'lucide-react';
import { getMedicalExplanation, GetMedicalExplanationInput, GetMedicalExplanationOutput } from '@/ai/flows/medical-assistant';
import { ScrollArea } from '../ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  disclaimer?: string;
}

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
      const assistantResponse: GetMedicalExplanationOutput = await getMedicalExplanation({ prompt: input });
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
    <Card className="h-[calc(100vh-10rem)] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className='flex items-center gap-2'>
          <BrainCircuit className="w-6 h-6 text-primary" />
          <CardTitle className="font-headline">AI Medical Assistant</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
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
                <Bot className="w-8 h-8 text-primary" />
                <div className="rounded-lg p-3 bg-muted">
                  <p className="text-sm">Thinking...</p>
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
            value={input}
            onChange={handleInputChange}
            placeholder="Ask a medical question..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            Send
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
