// src/ChatGPTPage.jsx
import './RagChatPage.css';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
// Import languages you need
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
// Import a theme of your choice
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('python', python);

function ChatGPTPage() {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Hello! I am ChatGPT. How can I assist you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (input.trim() === '') return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');

    // Simulate assistant response
    setIsLoading(true);
    const assistantMessage = await getAssistantResponse(input);
    setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    setIsLoading(false);
  };
  
  const getAssistantResponse = async (userInput) => {
    try {
      const response = await fetch('http://localhost:8080/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userInput }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        sender: 'assistant',
        text: data.reply.trim(),
      };
    } catch (error) {
      console.error('Error fetching assistant response:', error);
      return {
        sender: 'assistant',
        text: 'Sorry, I am unable to process your request at the moment.',
      };
    }
  };

  const getAssistantResponseFake = async (userInput) => {
    // Simulate a delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate markdown content
    const responseText = `
Here is some JavaScript code:

\`\`\`javascript
function greet(name) {
  console.log('Hello, ' + name + '!');
}
\`\`\`

And here is a list:

- Item 1
- Item 2
- Item 3

**Bold Text**, *Italic Text*, and ~~Strikethrough~~.
`;

    return {
      sender: 'assistant',
      text: responseText,
    };
  };

  return (
    <div className="container">
      <div className="chat-window">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${
              msg.sender === 'user' ? 'user-message' : 'assistant-message'
            }`}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={oneDark}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {msg.text}
            </ReactMarkdown>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant-message">
            <em>Assistant is typing...</em>
          </div>
        )}
      </div>
      <div className="input-area">
        <textarea
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default ChatGPTPage;