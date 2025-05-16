import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Paperclip } from 'lucide-react';
import { ChatMessage } from './components/ChatMessage';
import { Auth } from './components/Auth';
import { supabase } from './lib/supabase';
import { talkToLlama } from './lib/llama';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !attachment) return;

    const message = input.trim();
    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    setInput('');
    setAttachment(null);
    setIsLoading(true);
    setError('');

    try {
      let response = await talkToLlama(message);

      // 🆕 open PDF link in new tab automatically
      if (message.toLowerCase().includes('transcription')) {
        window.open('/transcription.pdf', '_blank');
      } else if (message.toLowerCase().includes('prescription')) {
        window.open('/prescription.pdf', '_blank');
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      setError('❌ Doc Bot could not respond. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAttachment(file);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <Auth onAuthSuccess={() => setIsAuthenticated(true)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white border-b py-5 px-8 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Doc Bot</h1>
          </div>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-10">
              <div className="bg-blue-100 p-4 rounded-full inline-block mb-4">
                <Bot className="w-8 h-8 text-blue-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-700">Welcome to Doc Bot!</h2>
              <p className="text-gray-500">Ask for your prescription or transcription documents.</p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${message.role === 'user' ? 'bg-gray-100 text-right' : 'bg-blue-50 text-left'}`}
            >
              {message.role === 'user' ? (
                <span>{message.content}</span>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: message.content }} />
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-center">
              <div className="flex gap-1 items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm bg-red-100 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="bg-white border-t p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-4 items-center">
          {attachment && (
            <div className="bg-blue-50 p-2 rounded flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-blue-700">{attachment.name}</span>
              <button onClick={() => setAttachment(null)} className="ml-2 text-blue-500">×</button>
            </div>
          )}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-gray-100 text-gray-600 rounded-xl p-3 hover:bg-gray-200"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <button
            type="submit"
            disabled={isLoading || (!input.trim() && !attachment)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl px-6 py-3 hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </footer>
    </div>
  );
}

export default App;
