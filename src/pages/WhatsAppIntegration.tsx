import React, { useState } from 'react';
import {
  Send,
  Phone,
  Video,
  MoreVertical,
  CheckCheck,
  ArrowRight
} from 'lucide-react';


interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
}

export const WhatsAppIntegration: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'bot', text: 'Namaste! Welcome to *Setu Hub AI Agent*. 📦 How can I help you today? \n\nReply with number:\n*1* - Register Account\n*2* - Create Parcel Request\n*3* - Track active Order\n*4* - Talk to Support', time: '17:21', status: 'read' },
  ]);
  const [inputValue, setInputValue] = useState('');

  const chatFlowOptions = [
    { label: 'Register Account', text: '1' },
    { label: 'Create Order Sweets Sehore to Bhopal', text: 'Sweets from Agrawal Sweets Sehore to Indrapuri Bhopal for Neha Gupta 9111222334' },
    { label: 'Track Order SH-2931', text: 'Track SH-2931' },
    { label: 'Contact Support Helpline', text: '4' },
  ];

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      sender: 'user',
      text: textToSend,
      time: timeString,
      status: 'read',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');

    // Simulate Bot response
    setTimeout(() => {
      let botResponse = '';
      const normText = textToSend.toLowerCase().trim();

      if (normText === '1') {
        botResponse = '👤 *Setu Hub Profile Registration*\n\nPlease reply with your Role and Name.\nExample: *Shopkeeper - Vijay Kirana*';
      } else if (normText.includes('sweets') || normText.includes('sehore')) {
        botResponse = '🎉 *Order Parsed Successfully by Setu AI Agent*\n\n📦 *Item:* Food Sweets\n📍 *Origin:* Sehore, MP\n🏁 *Destination:* Indrapuri Bhopal, MP\n👤 *Recipient:* Neha Gupta\n💰 *Compensation Payout:* ₹220\n\nWe have registered *SH-1024* in the active matching database. You will receive an alert as soon as a commuter accepts!';
      } else if (normText.includes('track')) {
        botResponse = '🔍 *Live Parcel Status: SH-2931*\n\n📍 *Current Zone:* Cruising on Highway Route (near Checkpoint-B)\n📦 *Category:* Medicines\n👤 *Commuter:* Vikram Singh\n🏁 *Est. Arrival:* 25 mins';
      } else if (normText === '4') {
        botResponse = '📞 *Setu Hub Helpdesk*\n\nYour query has been escalated to the Super Admin Node. A support specialist will call you shortly. (Dispute ID: *DISP-103*)';
      } else {
        botResponse = 'Command not recognized. Please choose from: \n*1* - Register Account\n*2* - Create Parcel\n*3* - Track Order\n*4* - Support';
      }

      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: botResponse, time: timeString, status: 'read' },
      ]);
    }, 1200);
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-73px)] font-sans">
      <div className="pb-4 border-b border-cardBorder mb-8">
        <h2 className="text-xl font-bold font-display tracking-wide text-fgApp uppercase">WhatsApp AI Engine</h2>
        <p className="text-xs text-mutedApp">Interact with Setu Hub completely through WhatsApp chat commands.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Features & Explanations */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-cardBorder space-y-4">
            <span className="text-[10px] font-bold text-green-400 bg-green-400/10 border border-green-400/25 px-2.5 py-1 rounded">
              WhatsApp Integration Beta
            </span>

            <h3 className="text-lg font-bold font-display leading-snug">
              No Application Installs Needed. Just Chat.
            </h3>

            <p className="text-xs text-mutedApp leading-relaxed">
              We built Setu Hub for rural retailers who find complex mobile apps confusing. Our NLP parser parses normal speech in regional dialects, extracting locations, names, and phone numbers instantly.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex gap-3 text-xs">
                <span className="text-green-500 font-bold shrink-0">✓</span>
                <p className="text-mutedApp">
                  <strong className="text-fgApp">Automatic OCR:</strong> Upload an invoice photo, and the AI extracts items and customer coordinates.
                </p>
              </div>
              <div className="flex gap-3 text-xs">
                <span className="text-green-500 font-bold shrink-0">✓</span>
                <p className="text-mutedApp">
                  <strong className="text-fgApp">Dialect support:</strong> Conversational Hindi, Marathi, and Tamil inputs.
                </p>
              </div>
              <div className="flex gap-3 text-xs">
                <span className="text-green-500 font-bold shrink-0">✓</span>
                <p className="text-mutedApp">
                  <strong className="text-fgApp">Crypto OTP Delivery:</strong> Delivery completion OTP codes dispatched straight through chat channels.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Simulation shortcuts */}
          <div className="glass-panel p-5 rounded-3xl border border-cardBorder space-y-3">
            <h4 className="text-[9px] font-bold text-mutedApp uppercase tracking-widest">Simulated Speech Scripts</h4>
            <p className="text-[10px] text-mutedApp">Click a prompt script to trigger conversational logistics parsing:</p>
            <div className="flex flex-col gap-2 pt-1">
              {chatFlowOptions.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(opt.text)}
                  className="w-full text-left bg-cardBg border border-cardBorder hover:border-green-500 rounded-xl p-3 text-xs font-semibold text-fgApp hover:bg-green-500/5 transition-all flex justify-between items-center"
                >
                  <span className="truncate">{opt.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-green-500 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Phone Frame & Mockup UI */}
        <div className="lg:col-span-7 flex justify-center items-center">
          <div className="w-full max-w-[340px] h-[580px] bg-[#0b141a] rounded-[40px] border-[12px] border-zinc-800 shadow-2xl relative flex flex-col justify-between overflow-hidden">
            {/* Phone Top Camera Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-5 bg-zinc-800 rounded-b-2xl z-20 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-800" />
            </div>

            {/* Chat header */}
            <div className="bg-[#1f2c34] pt-6 pb-2.5 px-4 flex items-center justify-between text-white border-b border-[#121b22] shrink-0">
              <div className="flex items-center gap-2.5 mt-2">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-black font-extrabold text-xs">
                  S
                </div>
                <div>
                  <h4 className="font-bold text-xs">Setu Hub Bot</h4>
                  <p className="text-[8px] text-green-400">online</p>
                </div>
              </div>
              <div className="flex items-center gap-3.5 text-zinc-400 mt-2">
                <Video className="w-4 h-4" />
                <Phone className="w-4 h-4" />
                <MoreVertical className="w-4 h-4" />
              </div>
            </div>

            {/* Message Thread Area */}
            <div className="flex-1 p-3 overflow-y-auto space-y-3.5 flex flex-col bg-[#0b141a] scrollbar-thin">
              {messages.map((m, idx) => {
                const isBot = m.sender === 'bot';
                return (
                  <div
                    key={idx}
                    className={`max-w-[85%] rounded-2xl p-2.5 text-xs relative flex flex-col ${
                      isBot
                        ? 'bg-[#1f2c34] text-white self-start rounded-tl-none'
                        : 'bg-[#005c4b] text-white self-end rounded-tr-none'
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-line">{m.text}</p>
                    <span className="text-[8px] text-zinc-400 text-right self-end mt-1.5 flex items-center gap-1">
                      {m.time}
                      {!isBot && <CheckCheck className="w-3 h-3 text-sky-400" />}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Input Bar */}
            <div className="bg-[#1f2c34] p-3 flex items-center gap-2 border-t border-[#121b22] shrink-0">
              <input
                type="text"
                placeholder="Type response code..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage(inputValue);
                }}
                className="flex-1 bg-[#2a3942] text-white rounded-full py-2 px-4 text-xs focus:outline-none focus:ring-0"
              />
              <button
                onClick={() => handleSendMessage(inputValue)}
                className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-black hover:bg-green-600 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
