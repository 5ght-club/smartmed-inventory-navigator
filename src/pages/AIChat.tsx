
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useInventoryStore } from "@/stores/inventoryStore";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AIChat = () => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ query: string; response: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { inventory } = useInventoryStore();
  const [isInitialized, setIsInitialized] = useState(false);

  // Load chat history on component mount
  useEffect(() => {
    if (user && !isInitialized) {
      loadChatHistory();
      setIsInitialized(true);
    }
  }, [user]);

  const loadChatHistory = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      // @ts-ignore - Ignore type errors for Supabase query
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error("Error loading chat history:", error);
        return;
      }
      
      if (data && data.length > 0) {
        // Transform and set chat history
        const history = data.map(item => ({
          query: item.query,
          response: item.response
        })).reverse();
        
        setChatHistory(history);
      }
    } catch (error) {
      console.error("Error in loadChatHistory:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading || !user) return;

    const userQuery = message;
    setMessage("");
    setIsLoading(true);

    // Add user message to chat
    setChatHistory(prev => [...prev, { query: userQuery, response: "Thinking..." }]);

    try {
      // Process the query and generate a response based on inventory data
      const aiResponse = generateResponse(userQuery);
      
      // Update the last message with the AI response
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1].response = aiResponse;
        return newHistory;
      });

      // Save chat history to database
      if (user) {
        // @ts-ignore - Ignore type errors for Supabase query
        await supabase
          .from('chat_history')
          .insert({
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

  // Function to generate AI responses based on inventory data
  const generateResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    // Count inventory items
    if (lowerQuery.includes("how many") || lowerQuery.includes("count") || lowerQuery.includes("total items")) {
      return `There are currently ${inventory.length} different items in your inventory.`;
    }
    
    // Low stock items
    if (lowerQuery.includes("low stock") || lowerQuery.includes("needs restocking")) {
      const lowStockItems = inventory.filter(item => item.currentStock <= item.minimumStock);
      if (lowStockItems.length === 0) {
        return "Great news! You don't have any items that need restocking at the moment.";
      } else {
        const itemNames = lowStockItems.map(item => item.name).join(", ");
        return `You have ${lowStockItems.length} items that need restocking: ${itemNames}.`;
      }
    }
    
    // Expiring items
    if (lowerQuery.includes("expir") || lowerQuery.includes("expire") || lowerQuery.includes("expiration")) {
      const expiringItems = inventory.filter(item => {
        if (!item.expiryDate) return false;
        const expiry = new Date(item.expiryDate);
        const today = new Date();
        // Items expiring in the next 30 days
        return expiry > today && (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24) <= 30;
      });
      
      if (expiringItems.length === 0) {
        return "Good news! You don't have any items expiring soon.";
      } else {
        const itemDetails = expiringItems.map(item => 
          `${item.name} (expires ${item.expiryDate})`
        ).join(", ");
        return `You have ${expiringItems.length} items expiring soon: ${itemDetails}.`;
      }
    }
    
    // Inventory value
    if (lowerQuery.includes("value") || lowerQuery.includes("worth")) {
      const totalValue = inventory.reduce((sum, item) => {
        const price = typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice) : item.unitPrice;
        return sum + (item.currentStock * price);
      }, 0).toFixed(2);
      
      return `Your current inventory is valued at $${totalValue}.`;
    }
    
    // Category information
    if (lowerQuery.includes("category") || lowerQuery.includes("categories")) {
      const categories = Array.from(new Set(inventory.map(item => item.category)));
      return `Your inventory is organized into ${categories.length} categories: ${categories.join(", ")}.`;
    }
    
    // Specific item lookup
    for (const item of inventory) {
      if (lowerQuery.includes(item.name.toLowerCase())) {
        return `${item.name}: You have ${item.currentStock} units in stock (minimum level: ${item.minimumStock}). 
                Each unit costs $${typeof item.unitPrice === 'string' ? item.unitPrice : item.unitPrice.toFixed(2)}.
                ${item.expiryDate ? `This item expires on ${item.expiryDate}.` : ''}
                ${item.supplier ? `Supplier: ${item.supplier}` : ''}
                ${item.location ? `Location: ${item.location}` : ''}`;
      }
    }
    
    // Default response if no specific patterns matched
    return `I'm your inventory assistant. You can ask me about:
            - Total number of items in inventory
            - Items with low stock levels
            - Items expiring soon
            - Total inventory value
            - Category information
            - Details about specific items`;
  };

  return (
    <div className="container mx-auto max-w-4xl">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>AI Inventory Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          {(!user || inventory.length === 0) && (
            <Alert variant="warning" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {!user 
                  ? "Please log in to use the AI assistant."
                  : "No inventory data found. Please upload inventory data for more helpful responses."}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4 mb-4 max-h-[500px] overflow-y-auto p-2">
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
              disabled={isLoading || !user}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !message.trim() || !user}>
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
