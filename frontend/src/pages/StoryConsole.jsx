import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { Send, CheckCircle, XCircle, Users, MessageSquare, Activity } from 'lucide-react';

const StoryConsole = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Socket
    const [socket, setSocket] = useState(null);

    // States
    const [messages, setMessages] = useState([]);
    const [msgInput, setMsgInput] = useState('');

    const [actions, setActions] = useState([]);
    const [actionInput, setActionInput] = useState('');

    const [requests, setRequests] = useState([]);
    const [storyDetails, setStoryDetails] = useState(null);

    const isAuthor = storyDetails?.authorId === user?.id;

    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Connect Socket
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            newSocket.emit('join_story', id);
        });

        newSocket.on('receive_message', (msg) => {
            setMessages(prev => [...prev, msg]);
        });

        fetchStoryData();

        return () => newSocket.close();
    }, [id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchStoryData = async () => {
        try {
            // Fetch Story Details
            const storyRes = await axios.get(`http://localhost:5000/api/story/${id}`);
            setStoryDetails(storyRes.data.data);

            // Fetch Messages
            const msgRes = await axios.get(`http://localhost:5000/api/messages/${id}`);
            setMessages(msgRes.data.data);

            // Fetch Actions
            const actRes = await axios.get(`http://localhost:5000/api/story/${id}/actions`);
            setActions(actRes.data.data || []);

            // If Author, fetch pending moderation requests
            if (storyRes.data.data.authorId === user?.id) {
                fetchRequests();
            }
        } catch (err) {
            console.error(err);
            if (err.response?.status === 404) navigate('/dashboard');
        }
    };

    const fetchRequests = async () => {
        try {
            const reqRes = await axios.get(`http://localhost:5000/api/story/${id}/requests`);
            setRequests(reqRes.data.data);
        } catch (err) {
            console.error('Failed fetching requests', err);
        }
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (!msgInput.trim() || !socket) return;

        socket.emit('send_message', {
            storyId: id,
            senderId: user.id,
            content: msgInput
        });
        setMsgInput('');
    };

    const submitAction = async (e) => {
        e.preventDefault();
        if (!actionInput.trim()) return;

        try {
            await axios.post(`http://localhost:5000/api/story/${id}/actions`, { content: actionInput });
            setActionInput('');
            fetchStoryData(); // Refresh actions
        } catch (err) {
            alert('Failed to submit action');
        }
    };

    const requestGlobal = async (actionId) => {
        try {
            await axios.post(`http://localhost:5000/api/story/${id}/actions/${actionId}/request-global`);
            alert('Request sent to author!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to request');
        }
    };

    const handleModeration = async (requestId, status) => {
        try {
            await axios.put(`http://localhost:5000/api/story/${id}/requests/${requestId}`, { status });
            fetchRequests();
            fetchStoryData(); // Refresh actions if any scenarios flipped
        } catch (err) {
            alert('Moderation failed');
        }
    };

    return (
        <div className="console-layout">
            {/* LEFT PANE: CHAT */}
            <div className="console-pane chat-pane glass">
                <div className="pane-header">
                    <MessageSquare size={18} />
                    <h3>OOC Chat</h3>
                </div>
                <div className="chat-messages">
                    {messages.map((m, i) => (
                        <div key={i} className={`message ${m.senderId?._id === user.id ? 'mine' : ''}`}>
                            <span className="msg-sender">{m.senderId?.username || 'Unknown'}</span>
                            <div className="msg-bubble">{m.content}</div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <form className="chat-input" onSubmit={sendMessage}>
                    <input
                        value={msgInput}
                        onChange={e => setMsgInput(e.target.value)}
                        placeholder="Type a message..."
                        className="glass-input"
                    />
                    <button type="submit" className="icon-btn send-btn"><Send size={18} /></button>
                </form>
            </div>

            {/* MIDDLE PANE: ACTIONS */}
            <div className="console-pane actions-pane glass">
                <div className="pane-header">
                    <Activity size={18} />
                    <h3>{storyDetails?.title || 'Story'} - Narrative</h3>
                </div>

                <div className="feed-container">
                    {actions.length === 0 ? (
                        <div className="empty-sub">No actions yet.</div>
                    ) : (
                        actions.map(act => (
                            <div key={act._id} className="action-card glass">
                                <div className="act-header">
                                    <span className="act-char">Action</span>
                                    <span className={`scenario-badge ${act.scenario.toLowerCase()}`}>{act.scenario}</span>
                                </div>
                                <p className="act-content">{act.content}</p>
                                {!isAuthor && act.scenario === 'LOCAL' && (
                                    <button className="text-btn request-btn" onClick={() => requestGlobal(act._id)}>
                                        Promote to Global
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {!isAuthor && (
                    <form className="action-composer glass" onSubmit={submitAction}>
                        <textarea
                            value={actionInput}
                            onChange={e => setActionInput(e.target.value)}
                            placeholder="What does your character do?"
                            className="glass-input"
                            rows={3}
                        />
                        <button type="submit" className="primary-btn">Submit Action</button>
                    </form>
                )}
            </div>

            {/* RIGHT PANE: MODERATION / CONTEXT */}
            <div className="console-pane moderation-pane glass">
                <div className="pane-header">
                    <Users size={18} />
                    <h3>{isAuthor ? 'Moderation Queue' : 'Story Details'}</h3>
                </div>

                {isAuthor ? (
                    <div className="mod-queue">
                        {requests.length === 0 ? (
                            <div className="empty-sub">No pending requests</div>
                        ) : (
                            requests.map(req => (
                                <div key={req._id} className="mod-card glass">
                                    <div className="mod-info">
                                        <strong>{req.characterId?.name || 'Character'}</strong> requested global status for:
                                        <p className="mod-action-preview">"{req.actionId?.content}"</p>
                                    </div>
                                    <div className="mod-actions">
                                        <button className="icon-btn accept" onClick={() => handleModeration(req._id, 'APPROVED')} title="Approve">
                                            <CheckCircle size={20} />
                                        </button>
                                        <button className="icon-btn reject" onClick={() => handleModeration(req._id, 'REJECTED')} title="Reject">
                                            <XCircle size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="story-info">
                        <p>{storyDetails?.description}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoryConsole;
