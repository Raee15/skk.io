 const aiChatBtn = document.getElementById('ai-chat-btn');
  const aiChatWindow = document.getElementById('ai-chat-window');
  const aiChatInput = document.getElementById('ai-chat-input');
  const aiSendBtn = document.getElementById('ai-send-btn');
  const aiChatLogs = document.getElementById('ai-chat-logs');

  // Toggle Chat Window Visibility
  aiChatBtn.addEventListener('click', () => {
      if (aiChatWindow.style.display === 'none' || aiChatWindow.style.display === '') {
          aiChatWindow.style.display = 'flex';
          aiChatBtn.style.transform = 'scale(0.9)';
      } else {
          aiChatWindow.style.display = 'none';
          aiChatBtn.style.transform = 'scale(1)';
      }
  });

  // Main Function to Connect to Google Gemini
  async function sendAiMessage() {
      const promptText = aiChatInput.value.trim();
      if (!promptText) return;

      // 1. Render User Message immediately
      aiChatLogs.innerHTML += `<div style="margin-bottom: 12px; text-align: right;"><span style="background: #e8f0fe; color: #1a73e8; padding: 8px 12px; border-radius: 12px; display: inline-block; max-width: 80%; word-break: break-word;"><b>You:</b> ${promptText}</span></div>`;
      aiChatInput.value = '';
      aiChatLogs.scrollTop = aiChatLogs.scrollHeight;

      // 2. Put a temporary 'thinking' placeholder
      const thinkingId = 'thinking-' + Date.now();
      aiChatLogs.innerHTML += `<div id="${thinkingId}" style="margin-bottom: 12px; color: #888;"><i>Bot is thinking...</i></div>`;
      aiChatLogs.scrollTop = aiChatLogs.scrollHeight;

      // 3. Insert your free Google Gemini API key here
      const API_KEY = 'AQ.Ab8RN6LD2Lm3jIzbLkyFgyTS8tan1aEbV22fMu9dTPTKkSZoig'; 
      
      // Using the free gemini-2.5-flash model
      const url = `https://googleapis.com{API_KEY}`;

      try {
          const response = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  contents: [{ parts: [{ text: promptText }] }]
              })
          });

          const data = await response.json();
          
          // Remove the thinking text
          if (document.getElementById(thinkingId)) {
              document.getElementById(thinkingId).remove();
          }

          // Extract response text or fallback if empty
          const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process that response.";

          // 4. Render the AI Response
          aiChatLogs.innerHTML += `<div style="margin-bottom: 12px; text-align: left;"><span style="background: white; border: 1px solid #e0e0e0; padding: 8px 12px; border-radius: 12px; display: inline-block; max-width: 80%; word-break: break-word;"><b>Bot:</b> ${replyText}</span></div>`;
      } catch (error) {
          if (document.getElementById(thinkingId)) {
              document.getElementById(thinkingId).remove();
          }
          aiChatLogs.innerHTML += `<div style="margin-bottom: 12px; color: red;"><b>Error:</b> Could not reach AI. Check your API key or network.</div>`;
          console.error(error);
      }
      
      aiChatLogs.scrollTop = aiChatLogs.scrollHeight;
  }

  // Trigger actions on click or hitting Enter
  aiSendBtn.addEventListener('click', sendAiMessage);
  aiChatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendAiMessage(); });