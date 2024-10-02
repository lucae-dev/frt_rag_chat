// src/ChatGPTPage.jsx
import './RagChatPage.css';

import React, { useState, useRef } from 'react';
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

  const [selectedFile, setSelectedFile] = useState(null);
  const [showConfirmButton, setShowConfirmButton] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const hiddenFileInput = useRef(null);
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

  const handleFileSelectClick = () => {
    hiddenFileInput.current.click();
  };

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
    setShowConfirmButton(true);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      setSelectedFile(event.dataTransfer.files[0]);
      setShowConfirmButton(true);
      event.dataTransfer.clearData();
    }
  };

  const handleFileConfirm = async () => {
    if (selectedFile) {
      await sendFileMessage(selectedFile);
      setSelectedFile(null);
      setShowConfirmButton(false);
    }
  };

  const handleFileCancel = () => {
    setSelectedFile(null);
    setShowConfirmButton(false);
  };

  const sendFileMessage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8080/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Update chat messages to include the file upload message
      const userMessage = {
        sender: 'user',
        text: `Uploaded a file: ${file.name}`,
      };
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      // Optionally, handle the assistant's response if needed
      // const assistantMessage = await getAssistantResponse(file.name);
      // setMessages((prevMessages) => [...prevMessages, assistantMessage]);

    } catch (error) {
      console.error('Error uploading file:', error);
      // Handle error appropriately
    }
      // Update chat messages to include the file upload message with a link
  const userMessage = {
    sender: 'user',
    text: `Uploaded a file: [${file.name}](#)`,
  };
  setMessages((prevMessages) => [...prevMessages, userMessage]);
  };

  return (
    <div className="chat-container">
      <div
        className={`chat-window ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
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

      {selectedFile && (
        <div className="file-preview">
          <p>Selected File: {selectedFile.name}</p>
          <button onClick={handleFileConfirm}>Confirm and Send</button>
          <button onClick={handleFileCancel}>Cancel</button>
        </div>
      )}

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
        <button onClick={handleFileSelectClick}>Upload File</button>
        <input
          type="file"
          ref={hiddenFileInput}
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
      </div>
    </div>
  );
}

export default ChatGPTPage;