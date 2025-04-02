
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Send, Bot, User, Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const mistralApiKey = "DjyJA9MFtGcViA7SvdgIp3Fg4iH7tPrW";
const huggingFaceApiKey = "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";

const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasInventoryData, setHasInventoryData] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Check if user has inventory data
  useEffect(() => {
    const checkInventoryData = async () => {
      if (!user) return;
      
      const { count, error } = await supabase
        .from('inventory_data')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error checking inventory data:', error);
        return;
      }
      
      setHasInventoryData(count !== null && count > 0);
    };
    
    checkInventoryData();
  }, [user]);

  // Scroll to bottom of messages
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const saveMessageToHistory = async (query: string, response: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('chat_history')
      .insert({
        user_id: user.id,
        query,
        response
      });
    
    if (error) {
      console.error('Error saving chat history:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    if (!user) {
      toast.error("You need to be logged in to use the chat");
      return;
    }
    
    // Add user message to chat
    const userMessageId = Date.now().toString();
    const userMessage: Message = {
      id: userMessageId,
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      // First try to get inventory-specific data
      let inventoryContext = "";
      if (hasInventoryData) {
        const { data: inventoryData, error: inventoryError } = await supabase
          .from('inventory_data')
          .select('*')
          .eq('user_id', user.id);
        
        if (!inventoryError && inventoryData) {
          inventoryContext = JSON.stringify(inventoryData);
        }
      }
      
      // Use Mistral API for the response
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mistralApiKey}`
        },
        body: JSON.stringify({
          model: "mistral-small-latest",
          messages: [
            {
              role: "system",
              content: `You are an AI medical inventory assistant. You help medical professionals manage their inventory. ${hasInventoryData ? `Here is the user's inventory data: ${inventoryContext}` : "The user has not uploaded any inventory data yet."}`
            },
            {
              role: "user",
              content: input
            }
          ],
          temperature: 0.7,
          max_tokens: 1024
        })
      });
      
      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process your request.";
      
      // Add AI response to chat
      const aiMessageId = (Date.now() + 1).toString();
      const aiMessage: Message = {
        id: aiMessageId,
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Save to chat history
      await saveMessageToHistory(input, aiResponse);
      
    } catch (error) {
      console.error('Error with AI chat:', error);
      
      // Add error message to chat
      const errorMessageId = (Date.now() + 1).toString();
      const errorMessage: Message = {
        id: errorMessageId,
        role: "assistant",
        content: "I'm sorry, I encountered an error processing your request. Please try again later.",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      toast.error("Failed to get a response from the AI. Please try again.");
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <Card className="flex-1 flex flex-col overflow-hidden border-0 rounded-none">
        <CardHeader className="bg-medical-blue text-white shadow-sm py-4">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <CardTitle>Medical AI Assistant</CardTitle>
          </div>
          <CardDescription className="text-blue-100">
            Ask questions about your medical inventory
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-muted-foreground">
              <Bot className="h-12 w-12 text-medical-blue opacity-50" />
              <div>
                <p className="text-lg font-medium">No messages yet</p>
                <p className="text-sm">Start a conversation with the AI assistant</p>
              </div>
              {!hasInventoryData && (
                <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md text-sm max-w-md">
                  <div className="flex items-start space-x-2">
                    <Upload className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Tip:</strong> Upload your inventory data first to get personalized inventory recommendations
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-2 ${
                  message.role === "assistant" ? "justify-start" : "justify-end"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="h-8 w-8 rounded-full bg-medical-blue flex items-center justify-center text-white flex-shrink-0">
                    <Bot className="h-5 w-5" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-lg max-w-[80%] ${
                    message.role === "assistant"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-medical-blue text-white ml-auto"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {message.role === "user" && (
                  <div className="h-8 w-8 rounded-full bg-medical-lightBlue flex items-center justify-center text-medical-blue flex-shrink-0">
                    <User className="h-5 w-5" />
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={endOfMessagesRef} />
        </CardContent>
        <CardFooter className="p-4 border-t bg-gray-50">
          <div className="flex w-full items-center space-x-2">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={isLoading || !input.trim()}
              className="bg-medical-blue hover:bg-medical-blue/90"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AIChat;
