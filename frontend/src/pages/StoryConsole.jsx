import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { Send, CheckCircle, XCircle, Users, MessageSquare, Activity, UserPlus, Info, Settings, Trash2, RefreshCw } from 'lucide-react';

const StoryConsole = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Socket
    const [socket, setSocket] = useState(null);

    // Core States
    const [storyDetails, setStoryDetails] = useState(null);
    const [messages, setMessages] = useState([]);
    const [actions, setActions] = useState([]);
    const [requests, setRequests] = useState([]);

    // Character / Persona States
    const [myCharacters, setMyCharacters] = useState([]);
    const [rosterCharacters, setRosterCharacters] = useState([]);
    const [activePersonaId, setActivePersonaId] = useState('');
    const [editingTraitChar, setEditingTraitChar] = useState(null); // Full character obj for trait editing

    // UI States
    const [msgInput, setMsgInput] = useState('');
    const [actionInput, setActionInput] = useState('');
    const [activeTab, setActiveTab] = useState('WORLD'); // 'WORLD' || 'ISOLATED'
    const [authorRightTab, setAuthorRightTab] = useState('MODERATION'); // 'MODERATION' || 'ROSTER'
    const [composerScenario, setComposerScenario] = useState('LOCAL'); // Author action default scenario

    // Modals
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showCreatePersona, setShowCreatePersona] = useState(false);
    const [showManageTraits, setShowManageTraits] = useState(false);

    // Form States
    const [charName, setCharName] = useState('');
    const [charRace, setCharRace] = useState('');
    const [charGender, setCharGender] = useState('');
    const [charAge, setCharAge] = useState('');
    const [traitRole, setTraitRole] = useState('');
    const [traitPersonalities, setTraitPersonalities] = useState('');

    const isAuthor = storyDetails?.authorId === user?.id;
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);
        newSocket.on('connect', () => newSocket.emit('join_story', id));
        newSocket.on('receive_message', (msg) => setMessages(prev => [...prev, msg]));

        setupData();
        return () => newSocket.close();
    }, [id]);

    useEffect(() => {
        if (storyDetails) {
            fetchActions();
        }
    }, [activePersonaId, storyDetails]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const setupData = async () => {
        try {
            const storyRes = await axios.get(`http://localhost:5000/api/story/${id}`);
            const storyData = storyRes.data.data;
            setStoryDetails(storyData);

            const msgRes = await axios.get(`http://localhost:5000/api/messages/${id}`);
            setMessages(msgRes.data.data);

            const isAut = storyData.authorId === user?.id;

            // Fetch characters
            const charRes = await axios.get(`http://localhost:5000/api/story/${id}/characters`);
            const allChars = charRes.data.data || [];
            if (isAut) setRosterCharacters(allChars);

            if (isAut) {
                const myCharRes = await axios.get(`http://localhost:5000/api/story/${id}/characters/me`);
                const authorChars = myCharRes.data.data || [];
                setMyCharacters(authorChars);
                if (authorChars.length > 0 && !activePersonaId) {
                    setActivePersonaId(authorChars[0].id);
                }
                fetchRequests();
            } else {
                const myCharRes = await axios.get(`http://localhost:5000/api/story/${id}/characters/me`);
                const playerChars = myCharRes.data.data || [];
                if (playerChars.length > 0) {
                    setMyCharacters(playerChars);
                    setActivePersonaId(playerChars[0].id);
                }
            }
        } catch (err) {
            console.error(err);
            if (err.response?.status === 404) navigate('/dashboard');
        }
    };

    const fetchActions = async () => {
        try {
            const endpoint = isAuthor && activePersonaId
                ? `http://localhost:5000/api/story/${id}/actions?characterId=${activePersonaId}`
                : `http://localhost:5000/api/story/${id}/actions`;
            const actRes = await axios.get(endpoint);
            setActions(actRes.data.data || []);
        } catch (err) {
            console.error('Failed fetching actions');
        }
    };

    const fetchRequests = async () => {
        try {
            const reqRes = await axios.get(`http://localhost:5000/api/story/${id}/requests`);
            setRequests(reqRes.data.data || []);
        } catch (err) {
            console.error('Failed fetching requests');
        }
    };

    const fetchAllStoryCharacters = async () => {
        try {
            const charRes = await axios.get(`http://localhost:5000/api/story/${id}/characters`);
            setRosterCharacters(charRes.data.data || []);
        } catch (err) {
            console.error('Failed fetching roster');
        }
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (!msgInput.trim() || !socket) return;
        socket.emit('send_message', { storyId: id, senderId: user.id, content: msgInput });
        setMsgInput('');
    };

    const submitAction = async (e) => {
        e.preventDefault();
        if (!actionInput.trim()) return;
        try {
            const payload = { content: actionInput };
            if (isAuthor && activePersonaId) {
                payload.characterId = activePersonaId;
                payload.scenario = composerScenario;
            } else if (isAuthor) {
                payload.scenario = 'GLOBAL'; // Master action
            }
            await axios.post(`http://localhost:5000/api/story/${id}/actions`, payload);
            setActionInput('');
            fetchActions();
        } catch (err) {
            alert('Failed to submit action');
        }
    };

    const requestGlobal = async (actionId) => {
        try {
            const res = await axios.post(`http://localhost:5000/api/story/${id}/actions/${actionId}/request-global`);
            if (res.data.message.includes('automatically made GLOBAL')) {
                alert('Action immediately promoted to global!');
                fetchActions();
            } else {
                alert('Request sent to author!');
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to request');
        }
    };

    const handleModeration = async (requestId, status) => {
        try {
            await axios.put(`http://localhost:5000/api/story/${id}/requests/${requestId}`, { status });
            fetchRequests();
            fetchActions();
        } catch (err) {
            alert('Moderation failed');
        }
    };

    const handleDeleteAction = async (actionId) => {
        if (!window.confirm("Delete this action permanently?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/story/${id}/actions/${actionId}`);
            fetchActions();
        } catch (err) {
            alert('Failed to delete action');
        }
    };

    const handleToggleScenario = async (actionId) => {
        try {
            await axios.put(`http://localhost:5000/api/story/${id}/actions/${actionId}/scenario`);
            fetchActions();
        } catch (err) {
            alert('Failed to toggle scenario');
        }
    };

    const handleCreatePersona = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`http://localhost:5000/api/story/${id}/characters`, {
                name: charName, race: charRace, gender: charGender, age: Number(charAge)
            });
            setShowCreatePersona(false);
            setCharName(''); setCharRace(''); setCharGender(''); setCharAge('');
            const myCharRes = await axios.get(`http://localhost:5000/api/story/${id}/characters/me`);
            setMyCharacters(myCharRes.data.data || []);
            fetchAllStoryCharacters();
        } catch (err) {
            alert('Failed to create persona');
        }
    };

    const startEditingTraits = (character) => {
        setEditingTraitChar(character);
        setTraitRole(character.role || '');
        setTraitPersonalities(character.personalities?.join(', ') || '');
        setShowManageTraits(true);
    };

    const handleUpdateTraits = async (e) => {
        e.preventDefault();
        if (!editingTraitChar) return;
        try {
            const parts = traitPersonalities.split(',').map(p => p.trim()).filter(Boolean);
            await axios.put(`http://localhost:5000/api/story/${id}/characters/${editingTraitChar.id}`, {
                role: traitRole, personalities: parts
            });
            setShowManageTraits(false);
            setEditingTraitChar(null);

            // Refresh character lists
            fetchAllStoryCharacters();
            if (isAuthor) {
                const myCharRes = await axios.get(`http://localhost:5000/api/story/${id}/characters/me`);
                setMyCharacters(myCharRes.data.data || []);
            }
        } catch (err) {
            alert('Failed to update traits');
        }
    };

    const activeCharacter = myCharacters.find(c => c.id === activePersonaId);

    // Filter logic for World vs Isolated
    const displayedActions = actions.filter(act => {
        if (activeTab === 'WORLD') {
            return isAuthor ? true : act.scenario === 'GLOBAL';
        } else {
            return act.characterId?._id === activePersonaId || act.characterId?._id === activeCharacter?.id;
        }
    });

    return (
        <div className="console-layout">
            {/* LEFT PANE: CHAT */}
            <div className="console-pane chat-pane glass">
                <div className="pane-header">
                    <MessageSquare size={18} />
                    <h3>Global Chat</h3>
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
                    <input value={msgInput} onChange={e => setMsgInput(e.target.value)} placeholder="Type a message..." className="glass-input" />
                    <button type="submit" className="icon-btn send-btn"><Send size={18} /></button>
                </form>
            </div>

            {/* MIDDLE PANE: ACTIONS */}
            <div className="console-pane actions-pane glass">
                <div className="pane-header">
                    <Activity size={18} />
                    <h3>{storyDetails?.title || 'Story'}</h3>
                </div>

                <div className="narrative-tabs" style={{ display: 'flex', gap: '10px', padding: '10px 20px', background: 'rgba(0,0,0,0.2)' }}>
                    <button className={`secondary-btn ${activeTab === 'WORLD' ? 'active' : 'outline'}`} onClick={() => setActiveTab('WORLD')} style={{ flex: 1 }}>World Mode</button>
                    <button className={`secondary-btn ${activeTab === 'ISOLATED' ? 'active' : 'outline'}`} onClick={() => setActiveTab('ISOLATED')} style={{ flex: 1 }}>Isolated</button>
                </div>

                <div className="feed-container">
                    {displayedActions.length === 0 ? (
                        <div className="empty-sub">No actions in this view.</div>
                    ) : (
                        displayedActions.map(act => {
                            const isGlobalInIsolated = activeTab === 'ISOLATED' && act.scenario === 'GLOBAL';
                            const cardStyle = isGlobalInIsolated ? { borderColor: '#8b5cf6', boxShadow: '0 0 10px rgba(139, 92, 246, 0.2)' } : {};

                            return (
                                <div key={act._id} className="action-card glass" style={cardStyle}>
                                    <div className="act-header">
                                        <span className="act-char">
                                            {act.characterId?.name || 'Game Master'}
                                            {act.characterId?.role && <span style={{ fontSize: '11px', fontStyle: 'italic', marginLeft: '6px', color: '#94a3b8' }}>- {act.characterId.role}</span>}
                                        </span>
                                        {/* Hide badge in isolated mode if global, per requirement */}
                                        {!(activeTab === 'ISOLATED') && (
                                            <span className={`scenario-badge ${act.scenario.toLowerCase()}`}>{act.scenario}</span>
                                        )}
                                        {(activeTab === 'ISOLATED' && act.scenario === 'LOCAL') && (
                                            <span className={`scenario-badge local`}>LOCAL</span>
                                        )}
                                    </div>
                                    <p className="act-content">{act.content}</p>

                                    <div className="action-controls" style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                                        {!isAuthor && act.scenario === 'LOCAL' && (
                                            <button type="button" className="text-btn request-btn" onClick={() => requestGlobal(act._id)}>
                                                Promote to Global
                                            </button>
                                        )}
                                        {isAuthor && (
                                            <>
                                                <button type="button" className="icon-btn" title="Toggle Global/Local" onClick={() => handleToggleScenario(act._id)}>
                                                    <RefreshCw size={14} color="#94a3b8" />
                                                </button>
                                                <button type="button" className="icon-btn" title="Delete Action" onClick={() => handleDeleteAction(act._id)}>
                                                    <Trash2 size={14} color="#ef4444" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <form className="action-composer glass" onSubmit={submitAction}>
                    <textarea
                        value={actionInput}
                        onChange={e => setActionInput(e.target.value)}
                        placeholder={isAuthor && !activeCharacter ? "Describe the next global event..." : `What does ${activeCharacter?.name || 'your character'} do?`}
                        className="glass-input"
                        rows={3}
                    />
                    {isAuthor && activePersonaId && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#cbd5e1', fontSize: '13px' }}>
                            <input
                                type="checkbox"
                                id="global-toggle"
                                checked={composerScenario === 'GLOBAL'}
                                onChange={(e) => setComposerScenario(e.target.checked ? 'GLOBAL' : 'LOCAL')}
                                style={{ accentColor: '#3b82f6' }}
                            />
                            <label htmlFor="global-toggle">Post directly as Global Action</label>
                        </div>
                    )}
                    <button type="submit" className="primary-btn">Submit Action</button>
                </form>
            </div>

            {/* RIGHT PANE: MODERATION / CONTEXT */}
            <div className="console-pane moderation-pane glass">
                <div className="pane-header">
                    <Users size={18} />
                    <h3>{isAuthor ? 'Author Dashboard' : 'Player Context'}</h3>
                </div>

                <div className="story-info" style={{ marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                    {isAuthor && (
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '5px' }}>Active Persona</label>
                            <select
                                className="glass-input full-width"
                                value={activePersonaId}
                                onChange={e => setActivePersonaId(e.target.value)}
                            >
                                <option value="">Global Observer (No Persona)</option>
                                {myCharacters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                                <button className="secondary-btn flex-1 flex-center" onClick={() => setShowCreatePersona(true)}>
                                    <UserPlus size={14} style={{ marginRight: '5px' }} /> New Persona
                                </button>
                                {activePersonaId && (
                                    <button className="secondary-btn flex-1 flex-center" onClick={() => startEditingTraits(activeCharacter)}>
                                        <Settings size={14} style={{ marginRight: '5px' }} /> Traits
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {activeCharacter && (
                        <button className="primary-btn outline full-width flex-center" onClick={() => setShowDetailsModal(true)}>
                            <Info size={16} style={{ marginRight: '8px' }} /> My Character Details
                        </button>
                    )}
                </div>

                {isAuthor ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                        <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
                            <button className={`secondary-btn flex-1 ${authorRightTab === 'MODERATION' ? 'active' : 'outline'}`} onClick={() => setAuthorRightTab('MODERATION')} style={{ padding: '6px' }}>Queue</button>
                            <button className={`secondary-btn flex-1 ${authorRightTab === 'ROSTER' ? 'active' : 'outline'}`} onClick={() => setAuthorRightTab('ROSTER')} style={{ padding: '6px' }}>Roster</button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto' }} className="custom-scroll">
                            {authorRightTab === 'MODERATION' && (
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
                                                    <button className="icon-btn accept" onClick={() => handleModeration(req._id, 'APPROVED')} title="Approve"><CheckCircle size={20} /></button>
                                                    <button className="icon-btn reject" onClick={() => handleModeration(req._id, 'REJECTED')} title="Reject"><XCircle size={20} /></button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {authorRightTab === 'ROSTER' && (
                                <div className="roster-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {rosterCharacters.length === 0 ? (
                                        <div className="empty-sub">No characters in story</div>
                                    ) : (
                                        rosterCharacters.map(char => (
                                            <div key={char.id} className="mod-card glass" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '10px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                                    <strong style={{ color: '#fff' }}>{char.name}</strong>
                                                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{char.owner}</span>
                                                </div>
                                                <div style={{ fontSize: '13px', color: '#cbd5e1', margin: '5px 0' }}>
                                                    {char.race} • {char.role || 'No Role'}
                                                </div>
                                                <button className="text-btn full-width" style={{ marginTop: '5px', padding: '5px', fontSize: '13px', textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} onClick={() => startEditingTraits(char)}>
                                                    Manage Traits
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="story-info">
                        <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '10px' }}>Story Lore</h4>
                        <p>{storyDetails?.description}</p>
                    </div>
                )}
            </div>

            {/* MODALS */}
            {showDetailsModal && activeCharacter && (
                <div className="modal-overlay">
                    <div className="modal-content glass">
                        <h2>{activeCharacter.name}'s Details</h2>
                        <div style={{ marginTop: '15px', color: '#cbd5e1', lineHeight: '1.6' }}>
                            <p><strong>Race:</strong> {activeCharacter.race || 'Unknown'}</p>
                            <p><strong>Gender:</strong> {activeCharacter.gender || 'Unknown'}</p>
                            <p><strong>Age:</strong> {activeCharacter.age || 'Unknown'}</p>
                            <p><strong>Role/Class:</strong> {activeCharacter.role || 'Unassigned'}</p>
                            <p><strong>Personalities:</strong> {activeCharacter.personalities?.length > 0 ? activeCharacter.personalities.join(', ') : 'None'}</p>
                        </div>
                        <div className="modal-actions" style={{ marginTop: '20px' }}>
                            <button className="primary-btn outline full-width" onClick={() => setShowDetailsModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {showCreatePersona && (
                <div className="modal-overlay">
                    <div className="modal-content glass">
                        <h2>Create Persona</h2>
                        <form onSubmit={handleCreatePersona}>
                            <div className="input-group"><label>Name</label><input required value={charName} onChange={e => setCharName(e.target.value)} /></div>
                            <div className="input-group"><label>Race</label><input required value={charRace} onChange={e => setCharRace(e.target.value)} /></div>
                            <div className="input-group"><label>Gender</label><input required value={charGender} onChange={e => setCharGender(e.target.value)} /></div>
                            <div className="input-group"><label>Age</label><input required type="number" min="1" value={charAge} onChange={e => setCharAge(e.target.value)} /></div>
                            <div className="modal-actions">
                                <button type="button" className="text-btn" onClick={() => setShowCreatePersona(false)}>Cancel</button>
                                <button type="submit" className="primary-btn">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showManageTraits && editingTraitChar && (
                <div className="modal-overlay">
                    <div className="modal-content glass">
                        <h2>Manage Traits for {editingTraitChar.name}</h2>
                        <form onSubmit={handleUpdateTraits}>
                            <div className="input-group">
                                <label>Role / Class</label>
                                <input placeholder="e.g. Rogue, Royal Guard" value={traitRole} onChange={e => setTraitRole(e.target.value)} />
                            </div>
                            <div className="input-group" style={{ marginTop: '10px' }}>
                                <label>Personalities (comma separated)</label>
                                <input placeholder="e.g. Brave, Stubborn" value={traitPersonalities} onChange={e => setTraitPersonalities(e.target.value)} />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="text-btn" onClick={() => setShowManageTraits(false)}>Cancel</button>
                                <button type="submit" className="primary-btn">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoryConsole;
