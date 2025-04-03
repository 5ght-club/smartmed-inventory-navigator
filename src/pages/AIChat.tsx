
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { chatHistoryTable, inventoryTable } from "@/types/supabase-adapter";

const AIChat = () => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ query: string; response: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading || !user) return;

    const userQuery = message;
    setMessage("");
    setIsLoading(true);

    // Add user message to chat
    setChatHistory(prev => [...prev, { query: userQuery, response: "Thinking..." }]);

    try {
      // This is a placeholder response - in a real app, this would call an AI service
      const aiResponse = `This is a placeholder response to your query: "${userQuery}". In the future, this will connect to an AI service.`;
      
      // Update the last message with the AI response
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1].response = aiResponse;
        return newHistory;
      });

      // Save chat history to database
      if (user) {
        await chatHistoryTable.insert({
          user_id: user.id,
          query: userQuery,
          response: aiResponse
        });
      }
    } catch (error) {
      console.error("Error processing message:", error);
      // Update the last message with error
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1].response = "Sorry, there was an error processing your request.";
        return newHistory;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>AI Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-4">
            {chatHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Send a message to start a conversation with the AI assistant
              </div>
            ) : (
              chatHistory.map((chat, index) => (
                <div key={index} className="space-y-2">
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="font-medium">You:</p>
                    <p>{chat.query}</p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <p className="font-medium">AI:</p>
                    <p>{chat.response}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !message.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIChat;
