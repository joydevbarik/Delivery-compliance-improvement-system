import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import AIChatbot from '../components/AIChatbot';
import {
  MessageSquare,
  Send,
  CheckCircle,
  Clock,
  Search,
  PlusCircle,
  HelpCircle,
  User,
  AlertCircle,
  RefreshCw,
  Folder,
  Check,
  ChevronRight
} from 'lucide-react';

const HelpDesk = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  
  // New ticket state
  const [showNewForm, setShowNewForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [newMessageBody, setNewMessageBody] = useState('');
  
  // Reply state
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const isOperator = user?.userId === 'tata_operator' || user?.userId === 'operator1';

  const fetchMessages = async (selectFirst = false) => {
    setLoading(true);
    try {
      const data = await api.getHelpMessages();
      // Filter for regular users to only see their own tickets
      const userMessages = isOperator
        ? data
        : data.filter(msg => msg.fromUserId === user?.userId);
      
      setMessages(userMessages);
      setError('');

      if (userMessages.length > 0) {
        if (selectFirst) {
          setSelectedMessage(userMessages[0]);
          setShowNewForm(false);
        } else if (selectedMessage) {
          // Keep current message selected and refresh its data
          const updated = userMessages.find(m => m._id === selectedMessage._id);
          if (updated) {
            setSelectedMessage(updated);
          }
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load help messages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(true);
  }, [user]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !newMessageBody.trim()) {
      setError('Both subject and message are required.');
      return;
    }

    try {
      const newMsg = await api.createHelpMessage(subject, newMessageBody);
      setSuccess('Help request submitted successfully.');
      setSubject('');
      setNewMessageBody('');
      setShowNewForm(false);
      
      // Reload messages and select the newly created one
      await fetchMessages(false);
      setSelectedMessage(newMsg);
    } catch (err) {
      setError(err.message || 'Failed to submit help message.');
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedMessage) return;

    setSendingReply(true);
    try {
      const updated = await api.replyHelpMessage(selectedMessage._id, replyText);
      setReplyText('');
      
      // Update local states
      setSelectedMessage(updated);
      setMessages(prev => prev.map(m => m._id === updated._id ? updated : m));
    } catch (err) {
      setError(err.message || 'Failed to send reply.');
    } finally {
      setSendingReply(false);
    }
  };

  const handleCloseTicket = async (msgId) => {
    try {
      const updated = await api.closeHelpMessage(msgId);
      setSelectedMessage(updated);
      setMessages(prev => prev.map(m => m._id === updated._id ? updated : m));
      setSuccess('Ticket closed successfully.');
    } catch (err) {
      setError(err.message || 'Failed to close ticket.');
    }
  };

  // Filter messages
  const filteredMessages = messages.filter(msg => {
    const matchesSearch =
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.fromUserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      msg.status === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 glassmorphism-card rounded-2xl border border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center space-x-2">
              <MessageSquare className="w-6 h-6 text-blue-500" />
              <span>Help Desk Support Portal</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {isOperator 
                ? 'Operator Inbox: Directly communicate with users logged into the system and handle their questions.' 
                : 'Directly communicate with operators Rajesh Kumar and Aditya Sen for system compliance assistance.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isOperator && (
              <button
                onClick={() => {
                  setShowNewForm(true);
                  setSelectedMessage(null);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-lg shadow-blue-500/20 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>New Request</span>
              </button>
            )}

            <button
              onClick={() => fetchMessages(false)}
              className="p-2.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl transition-all flex items-center justify-center cursor-pointer"
              title="Refresh Messages"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-start space-x-3 text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
            <div className="text-sm font-semibold">{error}</div>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 rounded-xl flex items-start space-x-3 text-emerald-700 dark:text-emerald-300">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-400" />
            <div className="text-sm font-semibold">{success}</div>
          </div>
        )}

        {/* Main Work Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[500px]">
          
          {/* Left Column: Tickets List */}
          <div className="lg:col-span-4 flex flex-col glassmorphism-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900/40">
            {/* Search and Filters */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-455">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search subject or user..."
                  className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="flex gap-2">
                {['ALL', 'OPEN', 'REPLIED', 'CLOSED'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`flex-1 py-1 px-1.5 rounded-md text-[9px] font-bold tracking-wider uppercase border transition-all cursor-pointer ${
                      statusFilter === status
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-105'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* List Body */}
            <div className="flex-1 overflow-y-auto max-h-[500px] divide-y divide-slate-100 dark:divide-slate-800/50">
              {loading && messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                  <span className="text-[10px] uppercase font-bold text-slate-550">Loading conversations...</span>
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="py-20 text-center text-slate-500 space-y-2">
                  <HelpCircle className="w-10 h-10 mx-auto opacity-20" />
                  <p className="text-xs font-bold">No requests found</p>
                  <p className="text-[10px]">Use the filters or create a new request.</p>
                </div>
              ) : (
                filteredMessages.map((msg) => {
                  const isSelected = selectedMessage?._id === msg._id;
                  
                  let badgeColor = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
                  if (msg.status === 'open') {
                    badgeColor = 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/30 border';
                  } else if (msg.status === 'replied') {
                    badgeColor = 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-900/30 border';
                  } else if (msg.status === 'closed') {
                    badgeColor = 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30 border';
                  }

                  return (
                    <div
                      key={msg._id}
                      onClick={() => {
                        setSelectedMessage(msg);
                        setShowNewForm(false);
                        setError('');
                        setSuccess('');
                      }}
                      className={`p-4 cursor-pointer transition-all flex flex-col justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30 ${
                        isSelected 
                          ? 'bg-blue-50/50 dark:bg-slate-800/50 border-l-4 border-blue-500' 
                          : 'border-l-4 border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                          {isOperator ? msg.fromUserName : 'Operator Mailbox'}
                        </span>
                        <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${badgeColor}`}>
                          {msg.status}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-800 dark:text-white mt-1 line-clamp-1">
                        {msg.subject}
                      </h4>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {msg.message}
                      </p>

                      <div className="flex items-center justify-between mt-3 text-[9px] text-slate-400">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(msg.createdAt).toLocaleDateString()}</span>
                        </span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Chat Box / Creation Form */}
          <div className="lg:col-span-8 flex flex-col glassmorphism-card rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 overflow-hidden">
            
            {showNewForm ? (
              /* New Ticket Form (Only for standard users) */
              <div className="p-6 flex flex-col h-full justify-between">
                <div className="space-y-4">
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                      <Folder className="w-4 h-4 text-blue-500" />
                      <span>Create Support Request Ticket</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Submit your query below. Our operators Rajesh Kumar and Aditya Sen will receive and review it.
                    </p>
                  </div>

                  <form onSubmit={handleCreateTicket} className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Subject / Issue Category
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g. Delayed Delivery calculation for ORD-2026-002"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Detailed Description
                      </label>
                      <textarea
                        value={newMessageBody}
                        onChange={(e) => setNewMessageBody(e.target.value)}
                        placeholder="Explain the stock shortage, order conflict, or system error you are encountering..."
                        rows={6}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none resize-none"
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewForm(false);
                          if (messages.length > 0) {
                            setSelectedMessage(messages[0]);
                          }
                        }}
                        className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
                      >
                        Submit Ticket
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : selectedMessage ? (
              /* Chat Box / Detailed Thread */
              <div className="flex flex-col h-full justify-between min-h-[500px]">
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 dark:text-white">
                        {selectedMessage.subject}
                      </h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Opened by <strong className="text-slate-700 dark:text-slate-300">{selectedMessage.fromUserName}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Only operators can close tickets */}
                    {isOperator && selectedMessage.status !== 'closed' && (
                      <button
                        onClick={() => handleCloseTicket(selectedMessage._id)}
                        className="px-3 py-1.5 border border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center space-x-1"
                        title="Close Support Ticket"
                      >
                        <Check className="w-3 h-3" />
                        <span>Close Ticket</span>
                      </button>
                    )}
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-1 rounded border ${
                      selectedMessage.status === 'open' 
                        ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/30' 
                        : selectedMessage.status === 'replied' 
                        ? 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-900/30' 
                        : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30'
                    }`}>
                      {selectedMessage.status}
                    </span>
                  </div>
                </div>

                {/* Chat Message Thread */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-[400px] bg-slate-50/20 dark:bg-slate-950/10">
                  
                  {/* Build a unified, time-sorted message list */}
                  {(() => {
                    // Combine the initial user message + all replies into one sorted list
                    const allMessages = [
                      {
                        id: selectedMessage._id + '_init',
                        senderType: 'user',
                        fromUserId: selectedMessage.fromUserId,
                        fromUserName: selectedMessage.fromUserName,
                        message: selectedMessage.message,
                        createdAt: selectedMessage.createdAt,
                        isInitial: true,
                      },
                      ...(selectedMessage.replies || []).map((rep, idx) => ({
                        id: rep._id || `reply_${idx}`,
                        // Use senderType if present (new), else fall back to checking fromOperator (legacy)
                        senderType: rep.senderType || (rep.fromOperator && rep.fromOperator.trim().length > 0 ? 'operator' : 'user'),
                        fromUserId: rep.fromUserId || '',
                        fromUserName: rep.fromUserName || rep.fromOperator || selectedMessage.fromUserName,
                        fromOperator: rep.fromOperator || '',
                        message: rep.message,
                        createdAt: rep.createdAt,
                        isInitial: false,
                      })),
                    ];

                    return allMessages.map((msg) => {
                      // "isMine" = the currently logged-in user sent this message
                      const isMine =
                        (isOperator && msg.senderType === 'operator') ||
                        (!isOperator && msg.senderType === 'user');

                      const avatarLetter = msg.fromUserName ? msg.fromUserName.charAt(0).toUpperCase() : '?';
                      const senderLabel = msg.senderType === 'operator'
                        ? `Operator: ${msg.fromUserName}`
                        : msg.fromUserName;

                      return (
                        <div
                          key={msg.id}
                          className={`flex items-end gap-2.5 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                          {/* Avatar */}
                          <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border text-[11px] font-bold uppercase ${
                            msg.senderType === 'operator'
                              ? 'bg-purple-100 dark:bg-purple-950 border-purple-200 dark:border-purple-900 text-purple-600 dark:text-purple-400'
                              : 'bg-blue-100 dark:bg-blue-950 border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400'
                          }`}>
                            {avatarLetter}
                          </div>

                          {/* Bubble */}
                          <div className={`max-w-[75%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                            {/* Sender name */}
                            <span className={`text-[9px] font-black uppercase tracking-wider mb-1 px-1 ${
                              msg.senderType === 'operator'
                                ? 'text-purple-500 dark:text-purple-400'
                                : 'text-blue-500 dark:text-blue-400'
                            }`}>
                              {senderLabel}
                            </span>

                            {/* Message bubble */}
                            <div className={`px-4 py-2.5 text-xs leading-relaxed font-medium ${
                              isMine
                                ? msg.senderType === 'operator'
                                  ? 'bg-purple-600 text-white rounded-2xl rounded-br-sm shadow-md shadow-purple-500/20'
                                  : 'bg-blue-600 text-white rounded-2xl rounded-br-sm shadow-md shadow-blue-500/20'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60 rounded-2xl rounded-bl-sm'
                            }`}>
                              {msg.message}
                            </div>

                            {/* Timestamp */}
                            <span className="text-[8px] text-slate-400 dark:text-slate-500 mt-1 px-1">
                              {new Date(msg.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* Reply Form */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                  {selectedMessage.status === 'closed' ? (
                    <div className="flex items-center justify-center p-3 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                      <CheckCircle className="w-4 h-4 mr-1.5" />
                      <span>This support request ticket has been resolved and closed.</span>
                    </div>
                  ) : (
                    <form onSubmit={handleSendReply} className="flex gap-3 items-center">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={isOperator ? "Type a professional reply to this operator query..." : "Ask a follow-up or reply to the operator..."}
                        className="flex-1 px-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-xl text-xs text-slate-850 dark:text-slate-100 focus:outline-none"
                        required
                        disabled={sendingReply}
                      />
                      <button
                        type="submit"
                        disabled={sendingReply}
                        className="px-4 py-2 bg-blue-650 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
                      >
                        {sendingReply ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Reply</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ) : (
              /* No Selected Conversation */
              <div className="flex flex-col items-center justify-center py-32 text-slate-500 space-y-4">
                <HelpCircle className="w-16 h-16 opacity-15" />
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No message active</p>
                  <p className="text-xs text-slate-550 dark:text-slate-400 mt-1">
                    Select a support ticket from the sidebar to view details, or create a new request.
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* AI Chatbot Widget */}
      <AIChatbot context="helpdesk" />
    </>
  );
};

export default HelpDesk;
