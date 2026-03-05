import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LogOut, Plus, BookOpen, User as UserIcon } from 'lucide-react';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stories, setStories] = useState([]);
    const [myCharacters, setMyCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Create Story Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    // Join Story Form State
    const [joinStoryId, setJoinStoryId] = useState(null);
    const [charName, setCharName] = useState('');
    const [charRace, setCharRace] = useState('');
    const [charGender, setCharGender] = useState('');
    const [charAge, setCharAge] = useState('');

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            const [storiesRes, charRes] = await Promise.all([
                axios.get('http://localhost:5000/api/story'),
                axios.get('http://localhost:5000/api/users/me/characters')
            ]);
            setStories(storiesRes.data.data);
            setMyCharacters(charRes.data.data || []);
        } catch (err) {
            console.error('Failed to fetch data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleCreateStory = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/story', { title, description });
            setShowModal(false);
            setTitle('');
            setDescription('');
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create story');
        }
    };

    const handleJoinStory = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`http://localhost:5000/api/story/${joinStoryId}/characters`, {
                name: charName,
                race: charRace,
                gender: charGender,
                age: Number(charAge)
            });
            setJoinStoryId(null);
            setCharName('');
            setCharRace('');
            setCharGender('');
            setCharAge('');
            navigate(`/story/${joinStoryId}`);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to join story. You might already have a character.');
        }
    };

    const navigateToStory = (id) => {
        navigate(`/story/${id}`);
    };

    const hasCharacterInStory = (storyId) => {
        return myCharacters.some(c => c.storyId?._id === storyId || c.storyId === storyId);
    };

    return (
        <div className="dashboard-container">
            <nav className="dashboard-nav glass">
                <div className="nav-brand">
                    <BookOpen className="nav-icon" />
                    <h1 className="gradient-text">Lore Ledger</h1>
                </div>
                <div className="nav-user">
                    <button onClick={handleLogout} className="icon-btn" title="Logout">
                        <LogOut size={20} />
                    </button>
                </div>
            </nav>

            <main className="dashboard-content">
                <div className="dashboard-header">
                    <h2>Story Hub</h2>
                    <button className="primary-btn flex-center" onClick={() => setShowModal(true)}>
                        <Plus size={18} style={{ marginRight: '8px' }} /> Create Narrative
                    </button>
                </div>

                {loading ? (
                    <div className="loading-state">Loading stories...</div>
                ) : stories.length === 0 ? (
                    <div className="empty-state glass">
                        <BookOpen size={48} className="empty-icon" />
                        <h3>No Stories Found</h3>
                        <p>The archives are currently empty.</p>
                    </div>
                ) : (
                    <>
                        {stories.filter(s => s.authorId === user?.id).length > 0 && (
                            <>
                                <h3 className="section-title" style={{ marginTop: '2rem', marginBottom: '1rem' }}>Your Narratives</h3>
                                <div className="story-grid">
                                    {stories.filter(s => s.authorId === user?.id).map(story => (
                                        <div key={story._id} className="story-card glass">
                                            <div className="story-image-placeholder"><BookOpen size={32} opacity={0.5} /></div>
                                            <div className="story-card-content">
                                                <h3 className="story-title">{story.title}</h3>
                                                <p className="story-desc">{story.description}</p>
                                                <div className="story-card-actions">
                                                    <button className="primary-btn full-width" onClick={() => navigateToStory(story._id)}>
                                                        Manage Story
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {stories.filter(s => s.authorId !== user?.id).length > 0 && (
                            <>
                                <h3 className="section-title" style={{ marginTop: '3rem', marginBottom: '1rem' }}>Explore Tales</h3>
                                <div className="story-grid">
                                    {stories.filter(s => s.authorId !== user?.id).map(story => (
                                        <div key={story._id} className="story-card glass">
                                            <div className="story-image-placeholder"><BookOpen size={32} opacity={0.5} /></div>
                                            <div className="story-card-content">
                                                <h3 className="story-title">{story.title}</h3>
                                                <p className="story-desc">{story.description}</p>
                                                <div className="story-card-actions">
                                                    <div className="character-actions">
                                                        {hasCharacterInStory(story._id) ? (
                                                            <button className="secondary-btn full-width" onClick={() => navigateToStory(story._id)}>
                                                                Enter Tale
                                                            </button>
                                                        ) : (
                                                            <button className="primary-btn outline full-width" onClick={() => setJoinStoryId(story._id)}>
                                                                Join as New
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}
            </main>

            {/* Create Story Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass">
                        <h2>Chronicle a New Legend</h2>
                        <form onSubmit={handleCreateStory}>
                            <div className="input-group">
                                <label>Title</label>
                                <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Epic title..." />
                            </div>
                            <div className="input-group" style={{ marginTop: '1rem' }}>
                                <label>Description</label>
                                <textarea required value={description} onChange={e => setDescription(e.target.value)} placeholder="Set the scene..." rows={4} className="glass-input" />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="text-btn" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="primary-btn">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Join Story Modal */}
            {joinStoryId && (
                <div className="modal-overlay">
                    <div className="modal-content glass">
                        <h2>Forge a New Character</h2>
                        <form onSubmit={handleJoinStory}>
                            <div className="input-group">
                                <label>Character Name</label>
                                <input required value={charName} onChange={e => setCharName(e.target.value)} placeholder="Name your alter ego..." />
                            </div>
                            <div className="input-group" style={{ marginTop: '1rem' }}>
                                <label>Race</label>
                                <input required value={charRace} onChange={e => setCharRace(e.target.value)} placeholder="Elf, Human, Orc..." />
                            </div>
                            <div className="input-group" style={{ marginTop: '1rem' }}>
                                <label>Gender</label>
                                <input required value={charGender} onChange={e => setCharGender(e.target.value)} placeholder="Male, Female, Non-binary..." />
                            </div>
                            <div className="input-group" style={{ marginTop: '1rem' }}>
                                <label>Age</label>
                                <input required type="number" min="1" value={charAge} onChange={e => setCharAge(e.target.value)} placeholder="Age in years..." />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="text-btn" onClick={() => setJoinStoryId(null)}>Cancel</button>
                                <button type="submit" className="primary-btn">Join Tale</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
